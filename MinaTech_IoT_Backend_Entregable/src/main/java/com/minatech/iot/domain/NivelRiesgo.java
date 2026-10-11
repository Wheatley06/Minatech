package com.minatech.iot.domain;

/**
 * Nivel de riesgo asociado a una alerta generada a partir de una lectura
 * de telemetria que supera el umbral critico configurado (o cuyo
 * "estado_simulacion" recibido por MQTT indica una condicion anomala).
 */
public enum NivelRiesgo {
    BAJO,
    MEDIO,
    ALTO,
    CRITICO
}
