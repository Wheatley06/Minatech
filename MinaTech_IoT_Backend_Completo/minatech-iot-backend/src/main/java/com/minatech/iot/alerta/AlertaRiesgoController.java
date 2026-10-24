package com.minatech.iot.alerta;

import com.minatech.iot.alerta.dto.AlertaRiesgoResponse;
import com.minatech.iot.common.ApiException;
import com.minatech.iot.domain.AlertaRiesgo;
import com.minatech.iot.repository.AlertaRiesgoRepository;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Respalda la pantalla "Alertas de Riesgo" del frontend. */
@RestController
@RequestMapping("/api/alertas")
public class AlertaRiesgoController {

    private final AlertaRiesgoRepository alertaRiesgoRepository;

    public AlertaRiesgoController(AlertaRiesgoRepository alertaRiesgoRepository) {
        this.alertaRiesgoRepository = alertaRiesgoRepository;
    }

    /** GET /api/alertas?atendida=false - si no se pasa el parametro, devuelve todas. */
    @GetMapping
    public ResponseEntity<List<AlertaRiesgoResponse>> listar(
            @RequestParam(required = false) Boolean atendida) {
        List<AlertaRiesgo> alertas = atendida == null
                ? alertaRiesgoRepository.findAll()
                : alertaRiesgoRepository.findByAtendida(atendida);

        List<AlertaRiesgoResponse> respuesta = alertas.stream()
                .sorted(Comparator.comparing(AlertaRiesgo::getFechaGeneracion).reversed())
                .map(AlertaRiesgoResponse::desde)
                .toList();
        return ResponseEntity.ok(respuesta);
    }

    /** PATCH /api/alertas/{id}/atender - marca la alerta como atendida. */
    @PatchMapping("/{id}/atender")
    public ResponseEntity<AlertaRiesgoResponse> atender(@PathVariable Long id) {
        AlertaRiesgo alerta = alertaRiesgoRepository.findById(id)
                .orElseThrow(() -> new ApiException("No existe una alerta con id " + id, HttpStatus.NOT_FOUND));

        alerta.setAtendida(true);
        alerta.setFechaAtencion(LocalDateTime.now());
        AlertaRiesgo guardada = alertaRiesgoRepository.save(alerta);
        return ResponseEntity.ok(AlertaRiesgoResponse.desde(guardada));
    }
}
