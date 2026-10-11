package com.minatech.iot.sensor;

import com.minatech.iot.common.ApiException;
import com.minatech.iot.domain.EquipoMecanico;
import com.minatech.iot.domain.SensorMina;
import com.minatech.iot.repository.EquipoMecanicoRepository;
import com.minatech.iot.repository.LecturaTelemetriaRepository;
import com.minatech.iot.repository.SensorMinaRepository;
import com.minatech.iot.sensor.dto.LecturaHistorialResponse;
import com.minatech.iot.sensor.dto.SensorMinaRequest;
import com.minatech.iot.sensor.dto.SensorMinaResponse;
import java.util.Collections;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class SensorMinaService {

    private final SensorMinaRepository sensorMinaRepository;
    private final EquipoMecanicoRepository equipoMecanicoRepository;
    private final LecturaTelemetriaRepository lecturaTelemetriaRepository;

    public SensorMinaService(SensorMinaRepository sensorMinaRepository,
                              EquipoMecanicoRepository equipoMecanicoRepository,
                              LecturaTelemetriaRepository lecturaTelemetriaRepository) {
        this.sensorMinaRepository = sensorMinaRepository;
        this.equipoMecanicoRepository = equipoMecanicoRepository;
        this.lecturaTelemetriaRepository = lecturaTelemetriaRepository;
    }

    public List<SensorMinaResponse> listar() {
        return sensorMinaRepository.findAll().stream()
                .map(SensorMinaResponse::desde)
                .toList();
    }

    public SensorMinaResponse registrar(SensorMinaRequest request) {
        EquipoMecanico equipo = equipoMecanicoRepository.findById(request.getEquipoMecanicoId())
                .orElseThrow(() -> new ApiException(
                        "No existe un equipo mecanico con id " + request.getEquipoMecanicoId(),
                        HttpStatus.NOT_FOUND));

        boolean yaExiste = sensorMinaRepository
                .findByEquipoMecanicoIdAndClaveVariable(equipo.getId(), request.getClaveVariable())
                .isPresent();
        if (yaExiste) {
            throw new ApiException(
                    "El equipo '" + equipo.getNombre() + "' ya tiene un sensor registrado para la variable '"
                            + request.getClaveVariable() + "'.");
        }

        SensorMina sensor = new SensorMina(request.getNombre(), request.getClaveVariable(),
                request.getTipoSensor(), equipo);
        sensor.setSubtipo(request.getSubtipo());
        sensor.setUbicacion(request.getUbicacion());
        sensor.setUmbralCritico(request.getUmbralCritico());

        SensorMina guardado = sensorMinaRepository.save(sensor);
        return SensorMinaResponse.desde(guardado);
    }

    /**
     * Edita un sensor ya existente (nombre, subtipo, ubicación y umbral
     * crítico). La variable MQTT (claveVariable), el tipo de sensor y el
     * equipo al que pertenece no se pueden cambiar aquí: son la llave que
     * usa TelemetriaService para enlazar cada mensaje MQTT entrante con su
     * sensor, y cambiarlos dejaría de enlazar la telemetría correctamente.
     */
    public SensorMinaResponse actualizar(Long id, SensorMinaRequest request) {
        SensorMina sensor = sensorMinaRepository.findById(id)
                .orElseThrow(() -> new ApiException("No existe un sensor con id " + id, HttpStatus.NOT_FOUND));

        sensor.setNombre(request.getNombre());
        sensor.setSubtipo(request.getSubtipo());
        sensor.setUbicacion(request.getUbicacion());
        sensor.setUmbralCritico(request.getUmbralCritico());

        SensorMina guardado = sensorMinaRepository.save(sensor);
        return SensorMinaResponse.desde(guardado);
    }

    /**
     * Las ultimas "limite" lecturas de un sensor, en orden cronologico
     * (mas antigua primero) para que se puedan graficar directamente como
     * una serie de tiempo (lineas / area) en el frontend.
     */
    public List<LecturaHistorialResponse> historial(Long sensorId, int limite) {
        if (!sensorMinaRepository.existsById(sensorId)) {
            throw new ApiException("No existe un sensor con id " + sensorId, HttpStatus.NOT_FOUND);
        }

        int limiteSeguro = Math.max(1, Math.min(limite, 500));

        List<LecturaHistorialResponse> masRecientePrimero = lecturaTelemetriaRepository
                .findBySensorMinaIdOrderByFechaHoraDesc(sensorId, PageRequest.of(0, limiteSeguro))
                .stream()
                .map(LecturaHistorialResponse::desde)
                .toList();

        List<LecturaHistorialResponse> cronologico = new java.util.ArrayList<>(masRecientePrimero);
        Collections.reverse(cronologico);
        return cronologico;
    }
}
