package com.minatech.iot.api.dto;

import com.minatech.iot.domain.EstadoSensor;
import com.minatech.iot.domain.TipoSensor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/** Cuerpo de POST /api/sensores (pantalla "Registro de Sensor"). */
public class SensorMinaRequest {

    @NotBlank
    private String nombre;

    /** Clave de variable (ej. "vibracion_1"), para que coincida con lo que enviará Node-RED. */
    @NotBlank
    private String claveVariable;

    @NotNull
    private TipoSensor tipoSensor;

    private String ubicacion;

    @NotNull
    private Long equipoMecanicoId;

    private Double umbralCritico;

    private EstadoSensor estado;

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

    public String getUbicacion() {
        return ubicacion;
    }

    public void setUbicacion(String ubicacion) {
        this.ubicacion = ubicacion;
    }

    public Long getEquipoMecanicoId() {
        return equipoMecanicoId;
    }

    public void setEquipoMecanicoId(Long equipoMecanicoId) {
        this.equipoMecanicoId = equipoMecanicoId;
    }

    public Double getUmbralCritico() {
        return umbralCritico;
    }

    public void setUmbralCritico(Double umbralCritico) {
        this.umbralCritico = umbralCritico;
    }

    public EstadoSensor getEstado() {
        return estado;
    }

    public void setEstado(EstadoSensor estado) {
        this.estado = estado;
    }
}
