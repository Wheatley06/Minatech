package com.minatech.iot.api.dto;

import com.minatech.iot.domain.EquipoMecanico;
import com.minatech.iot.domain.EstadoEquipo;

/** Para los dropdowns "Equipo mecánico asociado" / "Equipo mecánico". */
public class EquipoMecanicoResponse {

    private Long id;
    private String nombre;
    private String tipoEquipo;
    private String marca;
    private String modelo;
    private EstadoEquipo estado;

    public static EquipoMecanicoResponse desde(EquipoMecanico equipo) {
        EquipoMecanicoResponse dto = new EquipoMecanicoResponse();
        dto.id = equipo.getId();
        dto.nombre = equipo.getNombre();
        dto.tipoEquipo = equipo.getTipoEquipo();
        dto.marca = equipo.getMarca();
        dto.modelo = equipo.getModelo();
        dto.estado = equipo.getEstado();
        return dto;
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
}
