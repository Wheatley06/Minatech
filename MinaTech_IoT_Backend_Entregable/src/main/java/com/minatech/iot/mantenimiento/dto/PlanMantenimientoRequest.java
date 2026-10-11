package com.minatech.iot.mantenimiento.dto;

import com.minatech.iot.domain.TipoMantenimiento;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

/** Datos que llegan desde la pantalla "Plan de Mantenimiento" del frontend. */
public class PlanMantenimientoRequest {

    @NotNull
    private Long equipoMecanicoId;

    @NotNull
    private TipoMantenimiento tipoMantenimiento;

    @NotNull
    @FutureOrPresent
    private LocalDate fechaProgramada;

    @NotBlank
    private String responsable;

    private String descripcion;

    public Long getEquipoMecanicoId() {
        return equipoMecanicoId;
    }

    public void setEquipoMecanicoId(Long equipoMecanicoId) {
        this.equipoMecanicoId = equipoMecanicoId;
    }

    public TipoMantenimiento getTipoMantenimiento() {
        return tipoMantenimiento;
    }

    public void setTipoMantenimiento(TipoMantenimiento tipoMantenimiento) {
        this.tipoMantenimiento = tipoMantenimiento;
    }

    public LocalDate getFechaProgramada() {
        return fechaProgramada;
    }

    public void setFechaProgramada(LocalDate fechaProgramada) {
        this.fechaProgramada = fechaProgramada;
    }

    public String getResponsable() {
        return responsable;
    }

    public void setResponsable(String responsable) {
        this.responsable = responsable;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }
}
