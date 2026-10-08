package com.minatech.iot.mantenimiento.dto;

import com.minatech.iot.domain.EstadoPlanMantenimiento;
import com.minatech.iot.domain.PlanMantenimiento;
import com.minatech.iot.domain.TipoMantenimiento;
import java.time.LocalDate;

public class PlanMantenimientoResponse {

    private Long id;
    private Long equipoId;
    private String equipoNombre;
    private TipoMantenimiento tipoMantenimiento;
    private LocalDate fechaProgramada;
    private String responsable;
    private EstadoPlanMantenimiento estado;
    private String descripcion;

    public static PlanMantenimientoResponse desde(PlanMantenimiento plan) {
        PlanMantenimientoResponse r = new PlanMantenimientoResponse();
        r.id = plan.getId();
        if (plan.getEquipoMecanico() != null) {
            r.equipoId = plan.getEquipoMecanico().getId();
            r.equipoNombre = plan.getEquipoMecanico().getNombre();
        }
        r.tipoMantenimiento = plan.getTipoMantenimiento();
        r.fechaProgramada = plan.getFechaProgramada();
        r.responsable = plan.getResponsable();
        r.estado = plan.getEstado();
        r.descripcion = plan.getDescripcion();
        return r;
    }

    public Long getId() {
        return id;
    }

    public Long getEquipoId() {
        return equipoId;
    }

    public String getEquipoNombre() {
        return equipoNombre;
    }

    public TipoMantenimiento getTipoMantenimiento() {
        return tipoMantenimiento;
    }

    public LocalDate getFechaProgramada() {
        return fechaProgramada;
    }

    public String getResponsable() {
        return responsable;
    }

    public EstadoPlanMantenimiento getEstado() {
        return estado;
    }

    public String getDescripcion() {
        return descripcion;
    }
}
