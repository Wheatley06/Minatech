package com.minatech.iot.equipo.dto;

import com.minatech.iot.domain.EstadoEquipo;
import jakarta.validation.constraints.NotBlank;

/**
 * Datos que llegan desde el panel de administración de equipos del
 * frontend (pantalla "Registro de Sensor", que ahora también administra
 * equipos mecánicos). Al crear, se espera el "id" (debe coincidir con el
 * "equipo_id" que luego use la telemetría MQTT de ese equipo); al editar,
 * el id va en la URL y este campo se ignora.
 */
public class EquipoMecanicoRequest {

    private Long id;

    @NotBlank
    private String nombre;

    private String tipoEquipo;

    private String marca;

    private String modelo;

    private EstadoEquipo estado;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getTipoEquipo() {
        return tipoEquipo;
    }

    public void setTipoEquipo(String tipoEquipo) {
        this.tipoEquipo = tipoEquipo;
    }

    public String getMarca() {
        return marca;
    }

    public void setMarca(String marca) {
        this.marca = marca;
    }

    public String getModelo() {
        return modelo;
    }

    public void setModelo(String modelo) {
        this.modelo = modelo;
    }

    public EstadoEquipo getEstado() {
        return estado;
    }

    public void setEstado(EstadoEquipo estado) {
        this.estado = estado;
    }
}
