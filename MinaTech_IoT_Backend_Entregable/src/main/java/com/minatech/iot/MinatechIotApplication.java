package com.minatech.iot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Punto de entrada de la aplicacion backend de MinaTech IoT.
 *
 * Plataforma industrial IoT & Edge Computing para el monitoreo de riesgos
 * mecanicos y de seguridad en la pequena mineria y mineria artesanal.
 *
 * Incluye: modelo de dominio, autenticacion (login/registro con JWT) y
 * recepcion de telemetria simulada por Node-RED a traves de MQTT.
 */
@SpringBootApplication
public class MinatechIotApplication {

    public static void main(String[] args) {
        SpringApplication.run(MinatechIotApplication.class, args);
    }

}
