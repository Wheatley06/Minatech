package com.minatech.iot.equipo.dto;

import com.minatech.iot.domain.EquipoMecanico;
import com.minatech.iot.domain.EstadoEquipo;
import java.time.LocalDateTime;

/** Vista simplificada de un EquipoMecanico, usada para listas y dropdowns del frontend. */
public class EquipoMecanicoResponse {

    private Long id;
    private String nombre;
    private String tipoEquipo;
    private String marca;
    private String modelo;
    private EstadoEquipo estado;
    private LocalDateTime fechaCreacion;
    private Double posX;
    private Double posY;

    public static EquipoMecanicoResponse desde(EquipoMecanico equipo) {
        EquipoMecanicoResponse r = new EquipoMecanicoResponse();
        r.id = equipo.getId();
        r.nombre = equipo.getNombre();
        r.tipoEquipo = equipo.getTipoEquipo();
        r.marca = equipo.getMarca();
        r.modelo = equipo.getModelo();
        r.estado = equipo.getEstado();
        r.fechaCreacion = equipo.getFechaCreacion();
        r.posX = equipo.getPosX();
        r.posY = equipo.getPosY();
        return r;
    }

    public Long getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public String getTipoEquipo() {
        return tipoEquipo;
    }

    public String getMarca() {
        return marca;
    }

    public String getModelo() {
        return modelo;
    }

    public EstadoEquipo getEstado() {
        return estado;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public Double getPosX() {
        return posX;
    }

    public Double getPosY() {
        return posY;
    }
}
