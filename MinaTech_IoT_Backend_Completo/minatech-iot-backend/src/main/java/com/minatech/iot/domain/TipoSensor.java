package com.minatech.iot.domain;

/**
 * Tipos de sensor de campo soportados (nodos Edge ESP32 / Raspberry Pi,
 * simulados por Node-RED mientras no hay hardware físico).
 *
 * Ampliado respecto a la propuesta inicial del informe (que solo
 * contemplaba GAS y VIBRACION) para reflejar las 8 variables reales
 * que llegan por MQTT: vibración, gas, presión y temperatura.
 */
public enum TipoSensor {
    VIBRACION,
    GAS,
    PRESION,
    TEMPERATURA
}
