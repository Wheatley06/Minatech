package com.minatech.iot.mqtt.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Una entrada dentro del objeto "lecturas" del JSON que publica Node-RED,
 * por ejemplo:
 * <pre>
 * "gas_1": {"valor":6.03,"unidad":"%LEL","tipo":"CH4","estado_simulacion":"NORMAL"}
 * </pre>
 * El campo "tipo" solo viene presente en gas/presion/temperatura (el
 * subtipo real del sensor: CH4, hidraulica, motor, etc.); en vibracion
 * no viene y queda en null.
 */
public class LecturaMqttDto {

    private Double valor;
    private String unidad;
    private String tipo;

    @JsonProperty("estado_simulacion")
    private String estadoSimulacion;

    public Double getValor() {
        return valor;
    }

    public void setValor(Double valor) {
        this.valor = valor;
    }

    public String getUnidad() {
        return unidad;
    }

    public void setUnidad(String unidad) {
        this.unidad = unidad;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public String getEstadoSimulacion() {
        return estadoSimulacion;
    }

    public void setEstadoSimulacion(String estadoSimulacion) {
        this.estadoSimulacion = estadoSimulacion;
    }
}
