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
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

/**
 * Se origina cuando una lectura de telemetria llega con un
 * "estado_simulacion" distinto de NORMAL (o supera el umbral critico
 * configurado manualmente para el sensor). Puede marcarse como atendida
 * por el minero/operador o el jefe de operaciones.
 */
@Entity
@Table(name = "alerta_riesgo")
public class AlertaRiesgo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "lectura_telemetria_id", nullable = false, unique = true)
    private LecturaTelemetria lecturaTelemetria;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "nivel_riesgo", nullable = false, length = 20)
    private NivelRiesgo nivelRiesgo;

    @NotNull
    @Column(name = "fecha_generacion", nullable = false)
    private LocalDateTime fechaGeneracion = LocalDateTime.now();

    @Column(nullable = false)
    private boolean atendida = false;

    @Column(name = "fecha_atencion")
    private LocalDateTime fechaAtencion;

    @Column(length = 255)
    private String observaciones;

    public AlertaRiesgo() {
    }

    public AlertaRiesgo(LecturaTelemetria lecturaTelemetria, NivelRiesgo nivelRiesgo, String observaciones) {
        this.lecturaTelemetria = lecturaTelemetria;
        this.nivelRiesgo = nivelRiesgo;
        this.observaciones = observaciones;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LecturaTelemetria getLecturaTelemetria() {
        return lecturaTelemetria;
    }

    public void setLecturaTelemetria(LecturaTelemetria lecturaTelemetria) {
        this.lecturaTelemetria = lecturaTelemetria;
    }

    public NivelRiesgo getNivelRiesgo() {
        return nivelRiesgo;
    }

    public void setNivelRiesgo(NivelRiesgo nivelRiesgo) {
        this.nivelRiesgo = nivelRiesgo;
    }

    public LocalDateTime getFechaGeneracion() {
        return fechaGeneracion;
    }

    public void setFechaGeneracion(LocalDateTime fechaGeneracion) {
        this.fechaGeneracion = fechaGeneracion;
    }

    public boolean isAtendida() {
        return atendida;
    }

    public void setAtendida(boolean atendida) {
        this.atendida = atendida;
    }

    public LocalDateTime getFechaAtencion() {
        return fechaAtencion;
    }

    public void setFechaAtencion(LocalDateTime fechaAtencion) {
        this.fechaAtencion = fechaAtencion;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }
}
