package com.minatech.iot.domain;

/**
 * Estado operativo de un equipo mecanico (perforadoras, compresoras,
 * sistemas de izaje, etc.). El campo equipoId de la telemetria MQTT
 * (p. ej. 101) se corresponde con el id de una fila de esta entidad.
 */
public enum EstadoEquipo {
    OPERATIVO,
    EN_MANTENIMIENTO,
    FUERA_DE_SERVICIO
}
