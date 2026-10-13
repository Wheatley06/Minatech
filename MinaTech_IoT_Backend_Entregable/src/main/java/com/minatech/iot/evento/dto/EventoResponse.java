package com.minatech.iot.evento.dto;

import java.time.LocalDateTime;

/**
 * Una fila de la "Bitácora de Eventos" del frontend: una línea de tiempo
 * que combina, en un solo feed ordenado por fecha, las alertas de riesgo
 * generadas y los equipos/sensores detectados por primera vez (ya sea por
 * telemetría MQTT automática o dados de alta manualmente).
 */
public class EventoResponse {

    /** "ALERTA" | "EQUIPO_NUEVO" | "SENSOR_NUEVO" */
    private String tipo;

    private LocalDateTime fecha;
    private String titulo;
    private String descripcion;

    /** Solo presente en eventos de tipo ALERTA: BAJO | MEDIO | ALTO | CRITICO. */
    private String nivelRiesgo;

    private Long equipoId;
    private String equipoNombre;
    private Long sensorId;
    private String sensorNombre;

    public static EventoResponse de(String tipo, LocalDateTime fecha, String titulo, String descripcion,
                                     String nivelRiesgo, Long equipoId, String equipoNombre,
                                     Long sensorId, String sensorNombre) {
        EventoResponse e = new EventoResponse();
        e.tipo = tipo;
        e.fecha = fecha;
        e.titulo = titulo;
        e.descripcion = descripcion;
        e.nivelRiesgo = nivelRiesgo;
        e.equipoId = equipoId;
        e.equipoNombre = equipoNombre;
        e.sensorId = sensorId;
        e.sensorNombre = sensorNombre;
        return e;
    }

    public String getTipo() {
        return tipo;
    }

    public LocalDateTime getFecha() {
        return fecha;
    }

    public String getTitulo() {
        return titulo;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public String getNivelRiesgo() {
        return nivelRiesgo;
    }

    public Long getEquipoId() {
        return equipoId;
    }

    public String getEquipoNombre() {
        return equipoNombre;
    }

    public Long getSensorId() {
        return sensorId;
    }

    public String getSensorNombre() {
        return sensorNombre;
    }
}
