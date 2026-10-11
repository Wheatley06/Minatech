package com.minatech.iot.mqtt.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;

/**
 * Representa el mensaje JSON completo que Node-RED publica por MQTT,
 * por ejemplo:
 * <pre>
 * {
 *   "equipo_id": 101,
 *   "timestamp": "2026-09-30T23:33:13.776Z",
 *   "simulacion": true,
 *   "intervalo_segundos": 1,
 *   "lecturas": {
 *     "vibracion_1": {"valor":3.79,"unidad":"mm/s","estado_simulacion":"NORMAL"},
 *     "gas_1": {"valor":6.03,"unidad":"%LEL","tipo":"CH4","estado_simulacion":"NORMAL"},
 *     ...
 *   }
 * }
 * </pre>
 * Las claves de "lecturas" (vibracion_1, vibracion_2, gas_1, gas_2,
 * presion_1, presion_2, temperatura_1, temperatura_2) identifican de
 * forma unica a cada sensor dentro de un mismo equipo.
 */
public class TelemetriaMqttPayload {

    @JsonProperty("equipo_id")
    private Long equipoId;

    private String timestamp;

    private Boolean simulacion;

    @JsonProperty("intervalo_segundos")
    private Integer intervaloSegundos;

    private Map<String, LecturaMqttDto> lecturas;

    public Long getEquipoId() {
        return equipoId;
    }

    public void setEquipoId(Long equipoId) {
        this.equipoId = equipoId;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public Boolean getSimulacion() {
        return simulacion;
    }

    public void setSimulacion(Boolean simulacion) {
        this.simulacion = simulacion;
    }

    public Integer getIntervaloSegundos() {
        return intervaloSegundos;
    }

    public void setIntervaloSegundos(Integer intervaloSegundos) {
        this.intervaloSegundos = intervaloSegundos;
    }

    public Map<String, LecturaMqttDto> getLecturas() {
        return lecturas;
    }

    public void setLecturas(Map<String, LecturaMqttDto> lecturas) {
        this.lecturas = lecturas;
    }
}
