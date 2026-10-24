package com.minatech.iot.sensor;

import com.minatech.iot.sensor.dto.LecturaHistorialResponse;
import com.minatech.iot.sensor.dto.SensorMinaRequest;
import com.minatech.iot.sensor.dto.SensorMinaResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Respalda la pantalla "Registro de Sensor" del frontend. */
@RestController
@RequestMapping("/api/sensores")
public class SensorMinaController {

    private final SensorMinaService sensorMinaService;

    public SensorMinaController(SensorMinaService sensorMinaService) {
        this.sensorMinaService = sensorMinaService;
    }

    @GetMapping
    public ResponseEntity<List<SensorMinaResponse>> listar() {
        return ResponseEntity.ok(sensorMinaService.listar());
    }

    @PostMapping
    public ResponseEntity<SensorMinaResponse> registrar(@Valid @RequestBody SensorMinaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(sensorMinaService.registrar(request));
    }

    /**
     * Edita un sensor existente (nombre, subtipo, ubicación, umbral
     * crítico). La variable MQTT, el tipo de sensor y el equipo no se
     * pueden cambiar desde aquí (ver SensorMinaService.actualizar).
     */
    @PutMapping("/{id}")
    public ResponseEntity<SensorMinaResponse> actualizar(
            @PathVariable Long id, @Valid @RequestBody SensorMinaRequest request) {
        return ResponseEntity.ok(sensorMinaService.actualizar(id, request));
    }

    /**
     * GET /api/sensores/{id}/lecturas?limite=50 - historial reciente de un
     * sensor en orden cronologico, para graficar tendencias (lineas/area)
     * en el dashboard.
     */
    @GetMapping("/{id}/lecturas")
    public ResponseEntity<List<LecturaHistorialResponse>> historial(
            @PathVariable Long id,
            @RequestParam(defaultValue = "50") int limite) {
        return ResponseEntity.ok(sensorMinaService.historial(id, limite));
    }
}
