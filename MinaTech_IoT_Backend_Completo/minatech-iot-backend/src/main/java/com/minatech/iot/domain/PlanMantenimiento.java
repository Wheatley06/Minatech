package com.minatech.iot.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

/**
 * Programa el mantenimiento preventivo o correctivo de un equipo
 * mecanico, asignando responsable y fecha.
 */
@Entity
@Table(name = "plan_mantenimiento")
public class PlanMantenimiento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "equipo_mecanico_id", nullable = false)
    private EquipoMecanico equipoMecanico;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_mantenimiento", nullable = false, length = 20)
    private TipoMantenimiento tipoMantenimiento;

    @NotNull
    @Column(name = "fecha_programada", nullable = false)
    private LocalDate fechaProgramada;

    @Column(length = 150)
    private String responsable;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoPlanMantenimiento estado = EstadoPlanMantenimiento.PROGRAMADO;

    @Column(length = 255)
    private String descripcion;

    public PlanMantenimiento() {
    }

    public PlanMantenimiento(EquipoMecanico equipoMecanico, TipoMantenimiento tipoMantenimiento,
                              LocalDate fechaProgramada, String responsable, String descripcion) {
        this.equipoMecanico = equipoMecanico;
        this.tipoMantenimiento = tipoMantenimiento;
        this.fechaProgramada = fechaProgramada;
        this.responsable = responsable;
        this.descripcion = descripcion;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public EquipoMecanico getEquipoMecanico() {
        return equipoMecanico;
    }

    public void setEquipoMecanico(EquipoMecanico equipoMecanico) {
        this.equipoMecanico = equipoMecanico;
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

    public EstadoPlanMantenimiento getEstado() {
        return estado;
    }

    public void setEstado(EstadoPlanMantenimiento estado) {
        this.estado = estado;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }
}
