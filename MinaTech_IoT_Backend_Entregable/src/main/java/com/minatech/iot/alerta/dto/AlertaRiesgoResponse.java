package com.minatech.iot.alerta.dto;

import com.minatech.iot.domain.AlertaRiesgo;
import com.minatech.iot.domain.NivelRiesgo;
import java.time.LocalDateTime;

public class AlertaRiesgoResponse {

    private Long id;
    private NivelRiesgo nivelRiesgo;
    private LocalDateTime fechaGeneracion;
    private boolean atendida;
    private LocalDateTime fechaAtencion;
    private String observaciones;

    private Long sensorId;
    private String sensorNombre;
    private String claveVariable;

    private Long equipoId;
    private String equipoNombre;

    private Double valorLectura;
    private String unidadMedida;
    private String estadoSimulacion;
    private LocalDateTime fechaHoraLectura;

    public static AlertaRiesgoResponse desde(AlertaRiesgo alerta) {
        AlertaRiesgoResponse r = new AlertaRiesgoResponse();
        r.id = alerta.getId();
        r.nivelRiesgo = alerta.getNivelRiesgo();
        r.fechaGeneracion = alerta.getFechaGeneracion();
        r.atendida = alerta.isAtendida();
        r.fechaAtencion = alerta.getFechaAtencion();
        r.observaciones = alerta.getObservaciones();

        var lectura = alerta.getLecturaTelemetria();
        if (lectura != null) {
            r.valorLectura = lectura.getValor();
            r.unidadMedida = lectura.getUnidadMedida();
            r.estadoSimulacion = lectura.getEstadoSimulacion();
            r.fechaHoraLectura = lectura.getFechaHora();

            var sensor = lectura.getSensorMina();
            if (sensor != null) {
                r.sensorId = sensor.getId();
                r.sensorNombre = sensor.getNombre();
                r.claveVariable = sensor.getClaveVariable();

                var equipo = sensor.getEquipoMecanico();
                if (equipo != null) {
                    r.equipoId = equipo.getId();
                    r.equipoNombre = equipo.getNombre();
                }
            }
        }
        return r;
    }

    public Long getId() {
        return id;
    }

    public NivelRiesgo getNivelRiesgo() {
        return nivelRiesgo;
    }

    public LocalDateTime getFechaGeneracion() {
        return fechaGeneracion;
    }

    public boolean isAtendida() {
        return atendida;
    }

    public LocalDateTime getFechaAtencion() {
        return fechaAtencion;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public Long getSensorId() {
        return sensorId;
    }

    public String getSensorNombre() {
        return sensorNombre;
    }

    public String getClaveVariable() {
        return claveVariable;
    }

    public Long getEquipoId() {
        return equipoId;
    }

    public String getEquipoNombre() {
        return equipoNombre;
    }

    public Double getValorLectura() {
        return valorLectura;
    }

    public String getUnidadMedida() {
        return unidadMedida;
    }

    public String getEstadoSimulacion() {
        return estadoSimulacion;
    }

    public LocalDateTime getFechaHoraLectura() {
        return fechaHoraLectura;
    }
}
