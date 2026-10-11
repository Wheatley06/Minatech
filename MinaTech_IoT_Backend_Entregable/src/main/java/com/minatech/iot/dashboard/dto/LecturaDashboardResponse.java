package com.minatech.iot.dashboard.dto;

import com.minatech.iot.domain.LecturaTelemetria;
import com.minatech.iot.domain.SensorMina;
import com.minatech.iot.domain.TipoSensor;
import java.time.LocalDateTime;

/** Una fila del dashboard general: la ultima lectura conocida de un sensor. */
public class LecturaDashboardResponse {

    private Long sensorId;
    private String sensorNombre;
    private String claveVariable;
    private TipoSensor tipoSensor;

    private Long equipoId;
    private String equipoNombre;

    private Double valor;
    private String unidadMedida;
    private String estadoSimulacion;
    private LocalDateTime fechaHora;

    /** Sensor sin ninguna lectura registrada todavia (equipo recien creado o sin telemetria aun). */
    public static LecturaDashboardResponse sinLecturas(SensorMina sensor) {
        LecturaDashboardResponse r = new LecturaDashboardResponse();
        llenarDatosSensor(r, sensor);
        return r;
    }

    public static LecturaDashboardResponse desde(SensorMina sensor, LecturaTelemetria lectura) {
        LecturaDashboardResponse r = new LecturaDashboardResponse();
        llenarDatosSensor(r, sensor);
        r.valor = lectura.getValor();
        r.unidadMedida = lectura.getUnidadMedida();
        r.estadoSimulacion = lectura.getEstadoSimulacion();
        r.fechaHora = lectura.getFechaHora();
        return r;
    }

    private static void llenarDatosSensor(LecturaDashboardResponse r, SensorMina sensor) {
        r.sensorId = sensor.getId();
        r.sensorNombre = sensor.getNombre();
        r.claveVariable = sensor.getClaveVariable();
        r.tipoSensor = sensor.getTipoSensor();
        if (sensor.getEquipoMecanico() != null) {
            r.equipoId = sensor.getEquipoMecanico().getId();
            r.equipoNombre = sensor.getEquipoMecanico().getNombre();
        }
    }

    public Long getSensorId() {
        return sensorId;
    }

    public String getSensorNombre() {
        return sensorNombre;
    }

    public String getClaveVariable() {
        return claveVariable;
    }

    public TipoSensor getTipoSensor() {
        return tipoSensor;
    }

    public Long getEquipoId() {
        return equipoId;
    }

    public String getEquipoNombre() {
        return equipoNombre;
    }

    public Double getValor() {
        return valor;
    }

    public String getUnidadMedida() {
        return unidadMedida;
    }

    public String getEstadoSimulacion() {
        return estadoSimulacion;
    }

    public LocalDateTime getFechaHora() {
        return fechaHora;
    }
}
