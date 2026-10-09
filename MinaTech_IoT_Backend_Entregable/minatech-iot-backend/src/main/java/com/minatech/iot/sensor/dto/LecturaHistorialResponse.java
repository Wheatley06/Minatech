package com.minatech.iot.sensor.dto;

import com.minatech.iot.domain.LecturaTelemetria;
import java.time.LocalDateTime;

/** Un punto del historial reciente de un sensor, para graficar tendencias. */
public class LecturaHistorialResponse {

    private Double valor;
    private String unidadMedida;
    private String estadoSimulacion;
    private LocalDateTime fechaHora;

    public static LecturaHistorialResponse desde(LecturaTelemetria lectura) {
        LecturaHistorialResponse r = new LecturaHistorialResponse();
        r.valor = lectura.getValor();
        r.unidadMedida = lectura.getUnidadMedida();
        r.estadoSimulacion = lectura.getEstadoSimulacion();
        r.fechaHora = lectura.getFechaHora();
        return r;
    }

    public Double getValor() {
        return valor;
    }

    public String getUnidadMedida() {
        return unidadMedida;
    }

    public String getEstadoSimulacion() {
        return estadoSimulacion;
    }

    public LocalDateTime getFechaHora() {
        return fechaHora;
    }
}
