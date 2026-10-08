package com.minatech.iot.api.dto;

import com.minatech.iot.domain.LecturaTelemetria;
import java.time.LocalDateTime;

/** Última lectura conocida de un sensor, embebida en {@link SensorMinaResponse} para el dashboard. */
public class LecturaResumenResponse {

    private Double valor;
    private String unidad;
    private String estadoSimulacion;
    private LocalDateTime fechaHora;

    public static LecturaResumenResponse desde(LecturaTelemetria lectura) {
        if (lectura == null) {
            return null;
        }
        LecturaResumenResponse dto = new LecturaResumenResponse();
        dto.valor = lectura.getValor();
        dto.unidad = lectura.getUnidadMedida();
        dto.estadoSimulacion = lectura.getEstadoSimulacion();
        dto.fechaHora = lectura.getFechaHora();
        return dto;
    }

    public Double getValor() {
        return valor;
    }

    public String getUnidad() {
        return unidad;
    }

    public String getEstadoSimulacion() {
        return estadoSimulacion;
    }

    public LocalDateTime getFechaHora() {
        return fechaHora;
    }
}
