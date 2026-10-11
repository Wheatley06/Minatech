package com.minatech.iot.equipo;

import com.minatech.iot.equipo.dto.EquipoMecanicoResponse;
import com.minatech.iot.repository.EquipoMecanicoRepository;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Lista los equipos mecanicos existentes. Se usa sobre todo para llenar los
 * selectores de "Registro de Sensor" y "Plan de Mantenimiento" en el
 * frontend; los equipos en si se siguen creando automaticamente desde la
 * telemetria MQTT (ver TelemetriaService) hasta que exista una pantalla de
 * alta manual.
 */
@RestController
@RequestMapping("/api/equipos")
public class EquipoMecanicoController {

    private final EquipoMecanicoRepository equipoMecanicoRepository;

    public EquipoMecanicoController(EquipoMecanicoRepository equipoMecanicoRepository) {
        this.equipoMecanicoRepository = equipoMecanicoRepository;
    }

    @GetMapping
    public ResponseEntity<List<EquipoMecanicoResponse>> listar() {
        List<EquipoMecanicoResponse> equipos = equipoMecanicoRepository.findAll().stream()
                .map(EquipoMecanicoResponse::desde)
                .toList();
        return ResponseEntity.ok(equipos);
    }
}
