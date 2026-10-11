package com.minatech.iot.domain;

import jakarta.persistence.CascadeType;
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
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;

/**
 * Representa un sensor de campo (vibracion, gas, presion o temperatura),
 * nodo Edge simulado por Node-RED, que genera lecturas de telemetria.
 *
 * El campo {@code claveVariable} guarda la clave tal cual llega en el
 * JSON de MQTT (ej. "vibracion_1", "gas_2") para poder encontrar o crear
 * el sensor correspondiente a cada variable de cada equipo sin
 * ambigüedad.
 */
@Entity
@Table(name = "sensor_mina")
public class SensorMina {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, length = 100)
    private String nombre;

    /** Clave de la variable tal como llega por MQTT, ej. "vibracion_1". */
    @NotBlank
    @Column(name = "clave_variable", nullable = false, length = 50)
    private String claveVariable;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_sensor", nullable = false, length = 20)
    private TipoSensor tipoSensor;

    /** Subtipo informativo que trae el propio mensaje MQTT (ej. "CH4", "motor"). */
    @Column(length = 40)
    private String subtipo;

    @Column(length = 150)
    private String ubicacion;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EstadoSensor estado = EstadoSensor.ACTIVO;

    /**
     * Umbral critico de alerta configurable para la lectura de este sensor.
     * Puede quedar sin definir mientras se usa el "estado_simulacion" que
     * ya viene calculado desde Node-RED.
     */
    @Column(name = "umbral_critico")
    private Double umbralCritico;

    /**
     * Equipo mecanico monitoreado por este sensor.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipo_mecanico_id")
    private EquipoMecanico equipoMecanico;

    /**
     * Usuario responsable que gestiona/registra este sensor.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    /**
     * Un sensor genera multiples lecturas de telemetria (1 a N).
     */
    @OneToMany(mappedBy = "sensorMina", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LecturaTelemetria> lecturas = new ArrayList<>();

    public SensorMina() {
    }

    public SensorMina(String nombre, String claveVariable, TipoSensor tipoSensor, EquipoMecanico equipoMecanico) {
        this.nombre = nombre;
        this.claveVariable = claveVariable;
        this.tipoSensor = tipoSensor;
        this.equipoMecanico = equipoMecanico;
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

    public String getClaveVariable() {
        return claveVariable;
    }

    public void setClaveVariable(String claveVariable) {
        this.claveVariable = claveVariable;
    }

    public TipoSensor getTipoSensor() {
        return tipoSensor;
    }

    public void setTipoSensor(TipoSensor tipoSensor) {
        this.tipoSensor = tipoSensor;
    }

    public String getSubtipo() {
        return subtipo;
    }

    public void setSubtipo(String subtipo) {
        this.subtipo = subtipo;
    }

    public String getUbicacion() {
        return ubicacion;
    }

    public void setUbicacion(String ubicacion) {
        this.ubicacion = ubicacion;
    }

    public EstadoSensor getEstado() {
        return estado;
    }

    public void setEstado(EstadoSensor estado) {
        this.estado = estado;
    }

    public Double getUmbralCritico() {
        return umbralCritico;
    }

    public void setUmbralCritico(Double umbralCritico) {
        this.umbralCritico = umbralCritico;
    }

    public EquipoMecanico getEquipoMecanico() {
        return equipoMecanico;
    }

    public void setEquipoMecanico(EquipoMecanico equipoMecanico) {
        this.equipoMecanico = equipoMecanico;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public List<LecturaTelemetria> getLecturas() {
        return lecturas;
    }

    public void setLecturas(List<LecturaTelemetria> lecturas) {
        this.lecturas = lecturas;
    }
}
