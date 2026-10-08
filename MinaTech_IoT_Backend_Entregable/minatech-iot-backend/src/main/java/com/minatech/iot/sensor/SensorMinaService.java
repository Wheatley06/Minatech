package com.minatech.iot.sensor;

import com.minatech.iot.common.ApiException;
import com.minatech.iot.domain.EquipoMecanico;
import com.minatech.iot.domain.SensorMina;
import com.minatech.iot.repository.EquipoMecanicoRepository;
import com.minatech.iot.repository.SensorMinaRepository;
import com.minatech.iot.sensor.dto.SensorMinaRequest;
import com.minatech.iot.sensor.dto.SensorMinaResponse;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class SensorMinaService {

    private final SensorMinaRepository sensorMinaRepository;
    private final EquipoMecanicoRepository equipoMecanicoRepository;

    public SensorMinaService(SensorMinaRepository sensorMinaRepository,
                              EquipoMecanicoRepository equipoMecanicoRepository) {
        this.sensorMinaRepository = sensorMinaRepository;
        this.equipoMecanicoRepository = equipoMecanicoRepository;
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
}
