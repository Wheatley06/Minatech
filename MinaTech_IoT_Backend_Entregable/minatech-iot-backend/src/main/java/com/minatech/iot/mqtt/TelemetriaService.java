package com.minatech.iot.mqtt;

import com.minatech.iot.domain.AlertaRiesgo;
import com.minatech.iot.domain.EquipoMecanico;
import com.minatech.iot.domain.LecturaTelemetria;
import com.minatech.iot.domain.NivelRiesgo;
import com.minatech.iot.domain.SensorMina;
import com.minatech.iot.domain.TipoSensor;
import com.minatech.iot.mqtt.dto.LecturaMqttDto;
import com.minatech.iot.mqtt.dto.TelemetriaMqttPayload;
import com.minatech.iot.repository.AlertaRiesgoRepository;
import com.minatech.iot.repository.EquipoMecanicoRepository;
import com.minatech.iot.repository.LecturaTelemetriaRepository;
import com.minatech.iot.repository.SensorMinaRepository;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Locale;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Convierte cada mensaje MQTT de Node-RED en filas de dominio: crea el
 * {@link EquipoMecanico} y el {@link SensorMina} la primera vez que se ve
 * cada uno (find-or-create, ya que todavia no hay una pantalla de alta
 * manual de sensores conectada a este flujo), guarda la
 * {@link LecturaTelemetria} y, si el "estado_simulacion" no es NORMAL,
 * genera automaticamente una {@link AlertaRiesgo}.
 */
@Service
public class TelemetriaService {

    private static final Logger log = LoggerFactory.getLogger(TelemetriaService.class);

    private final EquipoMecanicoRepository equipoMecanicoRepository;
    private final SensorMinaRepository sensorMinaRepository;
    private final LecturaTelemetriaRepository lecturaTelemetriaRepository;
    private final AlertaRiesgoRepository alertaRiesgoRepository;

    public TelemetriaService(
            EquipoMecanicoRepository equipoMecanicoRepository,
            SensorMinaRepository sensorMinaRepository,
            LecturaTelemetriaRepository lecturaTelemetriaRepository,
            AlertaRiesgoRepository alertaRiesgoRepository) {
        this.equipoMecanicoRepository = equipoMecanicoRepository;
        this.sensorMinaRepository = sensorMinaRepository;
        this.lecturaTelemetriaRepository = lecturaTelemetriaRepository;
        this.alertaRiesgoRepository = alertaRiesgoRepository;
    }

    @Transactional
    public void procesarPayload(TelemetriaMqttPayload payload) {
        if (payload.getEquipoId() == null || payload.getLecturas() == null) {
            log.warn("Mensaje MQTT descartado: falta equipo_id o lecturas. Payload={}", payload);
            return;
        }

        EquipoMecanico equipo = obtenerOCrearEquipo(payload.getEquipoId());
        LocalDateTime fechaHora = parsearFecha(payload.getTimestamp());

        for (Map.Entry<String, LecturaMqttDto> entrada : payload.getLecturas().entrySet()) {
            try {
                procesarLectura(equipo, entrada.getKey(), entrada.getValue(), fechaHora);
            } catch (Exception ex) {
                // Una variable con formato inesperado no debe tumbar el resto
                // del mensaje (las otras 7 variables deben guardarse igual).
                log.error("No se pudo procesar la variable '{}' del equipo {}: {}",
                        entrada.getKey(), payload.getEquipoId(), ex.getMessage(), ex);
            }
        }
    }

    private EquipoMecanico obtenerOCrearEquipo(Long equipoId) {
        return equipoMecanicoRepository.findById(equipoId)
                .orElseGet(() -> {
                    log.info("Equipo mecanico {} no existia: se crea automaticamente desde telemetria MQTT.", equipoId);
                    EquipoMecanico nuevo = new EquipoMecanico(equipoId, "Equipo " + equipoId, null, null, null);
                    return equipoMecanicoRepository.save(nuevo);
                });
    }

    private void procesarLectura(EquipoMecanico equipo, String claveVariable, LecturaMqttDto dato, LocalDateTime fechaHora) {
        SensorMina sensor = obtenerOCrearSensor(equipo, claveVariable, dato);

        LecturaTelemetria lectura = new LecturaTelemetria(sensor, dato.getValor(), dato.getUnidad(), fechaHora);
        lectura.setEstadoSimulacion(dato.getEstadoSimulacion());
        lectura = lecturaTelemetriaRepository.save(lectura);

        NivelRiesgo nivelRiesgo = mapearNivelRiesgo(dato.getEstadoSimulacion());
        if (nivelRiesgo != null) {
            AlertaRiesgo alerta = new AlertaRiesgo(
                    lectura,
                    nivelRiesgo,
                    "Generada automáticamente por telemetría MQTT (estado_simulacion=" + dato.getEstadoSimulacion() + ")");
            alertaRiesgoRepository.save(alerta);
        }
    }

    private SensorMina obtenerOCrearSensor(EquipoMecanico equipo, String claveVariable, LecturaMqttDto dato) {
        SensorMina sensor = sensorMinaRepository
                .findByEquipoMecanicoIdAndClaveVariable(equipo.getId(), claveVariable)
                .orElseGet(() -> {
                    TipoSensor tipoSensor = inferirTipoSensor(claveVariable);
                    SensorMina nuevo = new SensorMina(formatearNombre(claveVariable), claveVariable, tipoSensor, equipo);
                    nuevo.setSubtipo(dato.getTipo());
                    log.info("Sensor '{}' no existia para el equipo {}: se crea automaticamente.", claveVariable, equipo.getId());
                    return sensorMinaRepository.save(nuevo);
                });

        // Si el sensor ya existia pero aun no tenia subtipo (p. ej. se creo
        // antes de recibir el primer mensaje con "tipo"), lo completamos.
        if (sensor.getSubtipo() == null && dato.getTipo() != null) {
            sensor.setSubtipo(dato.getTipo());
            sensor = sensorMinaRepository.save(sensor);
        }

        return sensor;
    }

    /**
     * Las 8 variables actuales siguen el patron "{tipo}_{numero}"
     * (vibracion_1, gas_2, presion_1, temperatura_2, ...).
     */
    private TipoSensor inferirTipoSensor(String claveVariable) {
        String clave = claveVariable.toLowerCase(Locale.ROOT);
        if (clave.startsWith("vibracion")) {
            return TipoSensor.VIBRACION;
        }
        if (clave.startsWith("gas")) {
            return TipoSensor.GAS;
        }
        if (clave.startsWith("presion")) {
            return TipoSensor.PRESION;
        }
        if (clave.startsWith("temperatura")) {
            return TipoSensor.TEMPERATURA;
        }
        throw new IllegalArgumentException("No se reconoce el tipo de sensor para la variable '" + claveVariable + "'");
    }

    /** "vibracion_1" -> "Vibracion 1". Solo para dar un nombre legible por defecto. */
    private String formatearNombre(String claveVariable) {
        String[] partes = claveVariable.split("_");
        StringBuilder nombre = new StringBuilder();
        for (String parte : partes) {
            if (parte.isEmpty()) {
                continue;
            }
            if (nombre.length() > 0) {
                nombre.append(' ');
            }
            nombre.append(parte.substring(0, 1).toUpperCase(Locale.ROOT)).append(parte.substring(1));
        }
        return nombre.toString();
    }

    /**
     * Mapeo provisional estado_simulacion -> NivelRiesgo. Node-RED hoy solo
     * envia "NORMAL" en los ejemplos vistos; cuando el equipo de datos
     * (Angel Di Maria, Project Charter sec. 5) defina el resto de valores
     * posibles del simulador, ajustar este metodo.
     */
    private NivelRiesgo mapearNivelRiesgo(String estadoSimulacion) {
        if (estadoSimulacion == null || "NORMAL".equalsIgnoreCase(estadoSimulacion)) {
            return null;
        }
        return switch (estadoSimulacion.toUpperCase(Locale.ROOT)) {
            case "ALERTA" -> NivelRiesgo.MEDIO;
            case "ADVERTENCIA" -> NivelRiesgo.ALTO;
            case "CRITICO" -> NivelRiesgo.CRITICO;
            default -> {
                log.warn("estado_simulacion desconocido '{}': se registra como nivel ALTO por defecto.", estadoSimulacion);
                yield NivelRiesgo.ALTO;
            }
        };
    }

    private LocalDateTime parsearFecha(String timestamp) {
        if (timestamp == null) {
            return LocalDateTime.now();
        }
        try {
            return LocalDateTime.ofInstant(Instant.parse(timestamp), ZoneId.systemDefault());
        } catch (Exception ex) {
            log.warn("No se pudo parsear el timestamp '{}', se usa la hora actual del servidor.", timestamp);
            return LocalDateTime.now();
        }
    }
}
