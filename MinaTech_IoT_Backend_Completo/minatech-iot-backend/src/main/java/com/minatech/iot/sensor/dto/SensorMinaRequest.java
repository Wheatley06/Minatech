package com.minatech.iot.sensor.dto;

import com.minatech.iot.domain.TipoSensor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/** Datos que llegan desde la pantalla "Registro de Sensor" del frontend. */
public class SensorMinaRequest {

    @NotBlank
    private String nombre;

    /**
     * Clave de la variable como la identifica Node-RED por MQTT
     * (ej. "vibracion_1", "gas_2"). Debe coincidir con una de las 8
     * variables actuales para que la telemetria entrante enlace con este
     * sensor en vez de crear uno nuevo.
     */
    @NotBlank
    private String claveVariable;

    @NotNull
    private TipoSensor tipoSensor;

    private String subtipo;

    private String ubicacion;

    private Double umbralCritico;

    @NotNull
    private Long equipoMecanicoId;

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getClaveVariable() {
        return claveVariable;
    }

    public void setClaveVariable(String claveVariable) {
        this.claveVariable = claveVariable;
    }

    public TipoSensor getTipoSensor() {
        return tipoSensor;
    }

    public void setTipoSensor(TipoSensor tipoSensor) {
        this.tipoSensor = tipoSensor;
    }

    public String getSubtipo() {
        return subtipo;
    }

    public void setSubtipo(String subtipo) {
        this.subtipo = subtipo;
    }

    public String getUbicacion() {
        return ubicacion;
    }

    public void setUbicacion(String ubicacion) {
        this.ubicacion = ubicacion;
    }

    public Double getUmbralCritico() {
        return umbralCritico;
    }

    public void setUmbralCritico(Double umbralCritico) {
        this.umbralCritico = umbralCritico;
    }

    public Long getEquipoMecanicoId() {
        return equipoMecanicoId;
    }

    public void setEquipoMecanicoId(Long equipoMecanicoId) {
        this.equipoMecanicoId = equipoMecanicoId;
    }
}
