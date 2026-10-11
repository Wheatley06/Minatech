package com.minatech.iot.domain;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;

/**
 * Representa maquinaria pesada monitoreada (perforadoras, compresoras,
 * sistemas de izaje, etc.). Su id coincide con el "equipo_id" que llega
 * en cada mensaje MQTT de telemetria.
 */
@Entity
@Table(name = "equipo_mecanico")
public class EquipoMecanico {

    @Id
    private Long id;

    @NotBlank
    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(name = "tipo_equipo", length = 80)
    private String tipoEquipo;

    @Column(length = 80)
    private String marca;

    @Column(length = 80)
    private String modelo;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EstadoEquipo estado = EstadoEquipo.OPERATIVO;

    /**
     * Un equipo mecanico es monitoreado por varios sensores (1 a N).
     */
    @OneToMany(mappedBy = "equipoMecanico", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SensorMina> sensores = new ArrayList<>();

    /**
     * Un equipo mecanico puede requerir varios planes de mantenimiento
     * a lo largo del tiempo (1 a N).
     */
    @OneToMany(mappedBy = "equipoMecanico", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PlanMantenimiento> planesMantenimiento = new ArrayList<>();

    public EquipoMecanico() {
    }

    public EquipoMecanico(Long id, String nombre, String tipoEquipo, String marca, String modelo) {
        this.id = id;
        this.nombre = nombre;
        this.tipoEquipo = tipoEquipo;
        this.marca = marca;
        this.modelo = modelo;
    }

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

    public List<SensorMina> getSensores() {
        return sensores;
    }

    public void setSensores(List<SensorMina> sensores) {
        this.sensores = sensores;
    }

    public List<PlanMantenimiento> getPlanesMantenimiento() {
        return planesMantenimiento;
    }

    public void setPlanesMantenimiento(List<PlanMantenimiento> planesMantenimiento) {
        this.planesMantenimiento = planesMantenimiento;
    }
}
