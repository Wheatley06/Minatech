package com.minatech.iot.api.dto;

import com.minatech.iot.domain.EstadoSensor;
import com.minatech.iot.domain.SensorMina;
import com.minatech.iot.domain.TipoSensor;

/** Sensor + su última lectura, tal como lo consume el Dashboard general y el listado de sensores. */
public class SensorMinaResponse {

    private Long id;
    private String nombre;
    private String claveVariable;
    private TipoSensor tipoSensor;
    private String subtipo;
    private String ubicacion;
    private EstadoSensor estado;
    private Double umbralCritico;
    private Long equipoMecanicoId;
    private String equipoMecanicoNombre;
    private LecturaResumenResponse ultimaLectura;

    public static SensorMinaResponse desde(SensorMina sensor, LecturaResumenResponse ultimaLectura) {
        SensorMinaResponse dto = new SensorMinaResponse();
        dto.id = sensor.getId();
        dto.nombre = sensor.getNombre();
        dto.claveVariable = sensor.getClaveVariable();
        dto.tipoSensor = sensor.getTipoSensor();
        dto.subtipo = sensor.getSubtipo();
        dto.ubicacion = sensor.getUbicacion();
        dto.estado = sensor.getEstado();
        dto.umbralCritico = sensor.getUmbralCritico();
        if (sensor.getEquipoMecanico() != null) {
            dto.equipoMecanicoId = sensor.getEquipoMecanico().getId();
            dto.equipoMecanicoNombre = sensor.getEquipoMecanico().getNombre();
        }
        dto.ultimaLectura = ultimaLectura;
        return dto;
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

    public Long getEquipoMecanicoId() {
        return equipoMecanicoId;
    }

    public String getEquipoMecanicoNombre() {
        return equipoMecanicoNombre;
    }

    public LecturaResumenResponse getUltimaLectura() {
        return ultimaLectura;
    }
}
