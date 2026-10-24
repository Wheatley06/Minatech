package com.minatech.iot.equipo;

import com.minatech.iot.equipo.dto.EquipoMecanicoRequest;
import com.minatech.iot.equipo.dto.EquipoMecanicoResponse;
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
import org.springframework.web.bind.annotation.RestController;

/**
 * Lista, da de alta y edita equipos mecánicos. Los equipos también se
 * siguen creando de forma automática desde la telemetría MQTT (ver
 * TelemetriaService) la primera vez que llega un "equipo_id" nuevo; estos
 * endpoints respaldan el panel de administración manual del frontend.
 */
@RestController
@RequestMapping("/api/equipos")
public class EquipoMecanicoController {

    private final EquipoMecanicoService equipoMecanicoService;

    public EquipoMecanicoController(EquipoMecanicoService equipoMecanicoService) {
        this.equipoMecanicoService = equipoMecanicoService;
    }

    @GetMapping
    public ResponseEntity<List<EquipoMecanicoResponse>> listar() {
        return ResponseEntity.ok(equipoMecanicoService.listar());
    }

    @PostMapping
    public ResponseEntity<EquipoMecanicoResponse> crear(@Valid @RequestBody EquipoMecanicoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(equipoMecanicoService.crear(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EquipoMecanicoResponse> actualizar(
            @PathVariable Long id, @Valid @RequestBody EquipoMecanicoRequest request) {
        return ResponseEntity.ok(equipoMecanicoService.actualizar(id, request));
    }
}
