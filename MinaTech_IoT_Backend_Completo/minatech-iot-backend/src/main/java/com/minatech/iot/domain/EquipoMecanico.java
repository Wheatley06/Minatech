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
import java.time.LocalDateTime;
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

    /** Momento en que se detectó/registró este equipo por primera vez, para la bitácora de actividad del frontend. */
    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    /**
     * Posición (0-100, porcentaje del ancho/alto del plano) para ubicar
     * este equipo en el "Mapa de Equipos" esquemático del frontend. Null
     * mientras nadie la haya configurado desde el panel de administración;
     * el frontend los acomoda en una grilla de reserva en ese caso.
     */
    @Column(name = "pos_x")
    private Double posX;

    @Column(name = "pos_y")
    private Double posY;

    /** Coordenadas geograficas (WGS84) para el "Mapa Satelital"; null = sin ubicacion geografica. */
    @Column(name = "latitud")
    private Double latitud;

    @Column(name = "longitud")
    private Double longitud;

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

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public Double getPosX() {
        return posX;
    }

    public void setPosX(Double posX) {
        this.posX = posX;
    }

    public Double getPosY() {
        return posY;
    }

    public void setPosY(Double posY) {
        this.posY = posY;
    }

    public Double getLatitud() {
        return latitud;
    }

    public void setLatitud(Double latitud) {
        this.latitud = latitud;
    }

    public Double getLongitud() {
        return longitud;
    }

    public void setLongitud(Double longitud) {
        this.longitud = longitud;
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
