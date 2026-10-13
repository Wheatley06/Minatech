package com.minatech.iot.evento;

import com.minatech.iot.domain.AlertaRiesgo;
import com.minatech.iot.domain.EquipoMecanico;
import com.minatech.iot.domain.SensorMina;
import com.minatech.iot.evento.dto.EventoResponse;
import com.minatech.iot.repository.AlertaRiesgoRepository;
import com.minatech.iot.repository.EquipoMecanicoRepository;
import com.minatech.iot.repository.SensorMinaRepository;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;

/**
 * Arma la "Bitácora de Eventos": un feed cronológico único que junta las
 * alertas de riesgo generadas con los equipos y sensores detectados por
 * primera vez (automáticamente por MQTT, o dados de alta a mano), para
 * poder reconstruir "qué pasó" sin saltar entre las pantallas de Alertas
 * y Equipos/Sensores.
 */
@Service
public class EventoService {

    private final AlertaRiesgoRepository alertaRiesgoRepository;
    private final EquipoMecanicoRepository equipoMecanicoRepository;
    private final SensorMinaRepository sensorMinaRepository;

    public EventoService(AlertaRiesgoRepository alertaRiesgoRepository,
                          EquipoMecanicoRepository equipoMecanicoRepository,
                          SensorMinaRepository sensorMinaRepository) {
        this.alertaRiesgoRepository = alertaRiesgoRepository;
        this.equipoMecanicoRepository = equipoMecanicoRepository;
        this.sensorMinaRepository = sensorMinaRepository;
    }

    public List<EventoResponse> listar(int limite) {
        int limiteSeguro = Math.max(1, Math.min(limite, 500));
        List<EventoResponse> eventos = new ArrayList<>();

        for (AlertaRiesgo alerta : alertaRiesgoRepository.findAll()) {
            SensorMina sensor = alerta.getLecturaTelemetria() != null ? alerta.getLecturaTelemetria().getSensorMina() : null;
            EquipoMecanico equipo = sensor != null ? sensor.getEquipoMecanico() : null;
            String sensorNombre = sensor != null ? sensor.getNombre() : "sensor desconocido";
            String equipoNombre = equipo != null ? equipo.getNombre() : "equipo desconocido";
            eventos.add(EventoResponse.de(
                    "ALERTA",
                    alerta.getFechaGeneracion(),
                    "Alerta " + capitalizar(alerta.getNivelRiesgo().name()) + " en " + sensorNombre,
                    sensorNombre + " (" + equipoNombre + ") pasó a estado de riesgo"
                            + (alerta.isAtendida() ? " — ya atendida." : " — pendiente."),
                    alerta.getNivelRiesgo().name(),
                    equipo != null ? equipo.getId() : null,
                    equipoNombre,
                    sensor != null ? sensor.getId() : null,
                    sensorNombre));
        }

        for (EquipoMecanico equipo : equipoMecanicoRepository.findAll()) {
            eventos.add(EventoResponse.de(
                    "EQUIPO_NUEVO",
                    equipo.getFechaCreacion(),
                    "Equipo detectado: " + equipo.getNombre(),
                    "Se registró el equipo mecánico '" + equipo.getNombre() + "' (id " + equipo.getId() + ").",
                    null,
                    equipo.getId(),
                    equipo.getNombre(),
                    null,
                    null));
        }

        for (SensorMina sensor : sensorMinaRepository.findAll()) {
            EquipoMecanico equipo = sensor.getEquipoMecanico();
            String equipoNombre = equipo != null ? equipo.getNombre() : "equipo desconocido";
            eventos.add(EventoResponse.de(
                    "SENSOR_NUEVO",
                    sensor.getFechaCreacion(),
                    "Sensor detectado: " + sensor.getNombre(),
                    "Se registró el sensor '" + sensor.getNombre() + "' (" + sensor.getClaveVariable()
                            + ") en el equipo '" + equipoNombre + "'.",
                    null,
                    equipo != null ? equipo.getId() : null,
                    equipoNombre,
                    sensor.getId(),
                    sensor.getNombre()));
        }

        return eventos.stream()
                .sorted(Comparator.comparing(EventoResponse::getFecha).reversed())
                .limit(limiteSeguro)
                .toList();
    }

    private String capitalizar(String texto) {
        if (texto == null || texto.isEmpty()) {
            return texto;
        }
        return texto.charAt(0) + texto.substring(1).toLowerCase();
    }
}
