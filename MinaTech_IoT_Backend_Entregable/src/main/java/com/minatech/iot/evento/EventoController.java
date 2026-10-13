package com.minatech.iot.evento;

import com.minatech.iot.evento.dto.EventoResponse;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Respalda la pantalla "Bitácora de Eventos" del frontend. */
@RestController
@RequestMapping("/api/eventos")
public class EventoController {

    private final EventoService eventoService;

    public EventoController(EventoService eventoService) {
        this.eventoService = eventoService;
    }

    @GetMapping
    public ResponseEntity<List<EventoResponse>> listar(@RequestParam(defaultValue = "100") int limite) {
        return ResponseEntity.ok(eventoService.listar(limite));
    }
}
