package com.minatech.iot.mantenimiento;

import com.minatech.iot.mantenimiento.dto.PlanMantenimientoRequest;
import com.minatech.iot.mantenimiento.dto.PlanMantenimientoResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Respalda la pantalla "Plan de Mantenimiento" del frontend. */
@RestController
@RequestMapping("/api/planes")
public class PlanMantenimientoController {

    private final PlanMantenimientoService planMantenimientoService;

    public PlanMantenimientoController(PlanMantenimientoService planMantenimientoService) {
        this.planMantenimientoService = planMantenimientoService;
    }

    @GetMapping
    public ResponseEntity<List<PlanMantenimientoResponse>> listar() {
        return ResponseEntity.ok(planMantenimientoService.listar());
    }

    @PostMapping
    public ResponseEntity<PlanMantenimientoResponse> crear(@Valid @RequestBody PlanMantenimientoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(planMantenimientoService.crear(request));
    }
}
