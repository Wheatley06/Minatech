package com.minatech.iot.sensor;

import com.minatech.iot.sensor.dto.SensorMinaRequest;
import com.minatech.iot.sensor.dto.SensorMinaResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
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
}
