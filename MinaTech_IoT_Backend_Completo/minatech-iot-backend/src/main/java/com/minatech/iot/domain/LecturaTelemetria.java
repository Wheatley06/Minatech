package com.minatech.iot.domain;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

/**
 * Registra el valor medido por un sensor de mina en un instante
 * determinado (un punto del array "lecturas" de un mensaje MQTT).
 * Puede originar, como maximo, una alerta de riesgo (relacion 1 a 0..1).
 */
@Entity
@Table(name = "lectura_telemetria")
public class LecturaTelemetria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sensor_mina_id", nullable = false)
    private SensorMina sensorMina;

    @NotNull
    @Column(nullable = false)
    private Double valor;

    @Column(name = "unidad_medida", length = 20)
    private String unidadMedida;

    /** Estado calculado por el simulador de Node-RED (ej. NORMAL, ALERTA, CRITICO). */
    @Column(name = "estado_simulacion", length = 30)
    private String estadoSimulacion;

    @NotNull
    @Column(name = "fecha_hora", nullable = false)
    private LocalDateTime fechaHora = LocalDateTime.now();

    /**
     * Alerta de riesgo originada por esta lectura, si corresponde
     * (a lo mas una alerta por lectura).
     */
    @OneToOne(mappedBy = "lecturaTelemetria", cascade = CascadeType.ALL, orphanRemoval = true)
    private AlertaRiesgo alertaRiesgo;

    public LecturaTelemetria() {
    }

    public LecturaTelemetria(SensorMina sensorMina, Double valor, String unidadMedida, LocalDateTime fechaHora) {
        this.sensorMina = sensorMina;
        this.valor = valor;
        this.unidadMedida = unidadMedida;
        this.fechaHora = fechaHora;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public SensorMina getSensorMina() {
        return sensorMina;
    }

    public void setSensorMina(SensorMina sensorMina) {
        this.sensorMina = sensorMina;
    }

    public Double getValor() {
        return valor;
    }

    public void setValor(Double valor) {
        this.valor = valor;
    }

    public String getUnidadMedida() {
        return unidadMedida;
    }

    public void setUnidadMedida(String unidadMedida) {
        this.unidadMedida = unidadMedida;
    }

    public String getEstadoSimulacion() {
        return estadoSimulacion;
    }

    public void setEstadoSimulacion(String estadoSimulacion) {
        this.estadoSimulacion = estadoSimulacion;
    }

    public LocalDateTime getFechaHora() {
        return fechaHora;
    }

    public void setFechaHora(LocalDateTime fechaHora) {
        this.fechaHora = fechaHora;
    }

    public AlertaRiesgo getAlertaRiesgo() {
        return alertaRiesgo;
    }

    public void setAlertaRiesgo(AlertaRiesgo alertaRiesgo) {
        this.alertaRiesgo = alertaRiesgo;
    }
}
