package com.minatech.iot.sensor.dto;

import com.minatech.iot.domain.EstadoSensor;
import com.minatech.iot.domain.SensorMina;
import com.minatech.iot.domain.TipoSensor;
import java.time.LocalDateTime;

public class SensorMinaResponse {

    private Long id;
    private String nombre;
    private String claveVariable;
    private TipoSensor tipoSensor;
    private String subtipo;
    private String ubicacion;
    private EstadoSensor estado;
    private Double umbralCritico;
    private Long equipoId;
    private String equipoNombre;
    private LocalDateTime fechaCreacion;

    public static SensorMinaResponse desde(SensorMina sensor) {
        SensorMinaResponse r = new SensorMinaResponse();
        r.id = sensor.getId();
        r.nombre = sensor.getNombre();
        r.claveVariable = sensor.getClaveVariable();
        r.tipoSensor = sensor.getTipoSensor();
        r.subtipo = sensor.getSubtipo();
        r.ubicacion = sensor.getUbicacion();
        r.estado = sensor.getEstado();
        r.umbralCritico = sensor.getUmbralCritico();
        r.fechaCreacion = sensor.getFechaCreacion();
        if (sensor.getEquipoMecanico() != null) {
            r.equipoId = sensor.getEquipoMecanico().getId();
            r.equipoNombre = sensor.getEquipoMecanico().getNombre();
        }
        return r;
    }

    public Long getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public String getClaveVariable() {
        return claveVariable;
    }

    public TipoSensor getTipoSensor() {
        return tipoSensor;
    }

    public String getSubtipo() {
        return subtipo;
    }

    public String getUbicacion() {
        return ubicacion;
    }

    public EstadoSensor getEstado() {
        return estado;
    }

    public Double getUmbralCritico() {
        return umbralCritico;
    }

    public Long getEquipoId() {
        return equipoId;
    }

    public String getEquipoNombre() {
        return equipoNombre;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }
}
