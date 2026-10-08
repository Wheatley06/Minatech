package com.minatech.iot.mqtt;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.minatech.iot.mqtt.dto.TelemetriaMqttPayload;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.eclipse.paho.client.mqttv3.IMqttDeliveryToken;
import org.eclipse.paho.client.mqttv3.MqttCallback;
import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.eclipse.paho.client.mqttv3.persist.MemoryPersistence;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Cliente MQTT que se suscribe al topico donde Node-RED publica la
 * telemetria simulada (ver JSON de ejemplo en TelemetriaMqttPayload) y
 * delega el guardado en {@link TelemetriaService}.
 *
 * =======================================================================
 * IMPORTANTE - Conexion MQTT todavia sin definir (Project Charter, 5.
 * responsabilidad de Angel Di Maria - arquitectura Edge/MQTT/Node-RED):
 * los valores reales de broker, topico y credenciales se configuran en
 * application.properties, bajo las claves:
 *
 *   minatech.mqtt.broker-url   <- AQUI va la URL del broker (ej. tcp://host:1883)
 *   minatech.mqtt.client-id    <- identificador de este cliente MQTT
 *   minatech.mqtt.topic        <- AQUI va el topico a suscribirse
 *   minatech.mqtt.username     <- usuario del broker (si aplica)
 *   minatech.mqtt.password     <- password del broker (si aplica)
 *
 * Mientras "broker-url" conserve el valor PENDIENTE_DEFINIR_URL_DEL_BROKER
 * (el que trae por defecto application.properties), este componente NO
 * intenta conectarse: solo deja un aviso en el log. Esto permite que el
 * resto del backend (login, registro) se pueda levantar y probar sin
 * depender de que el broker ya exista.
 * =======================================================================
 */
@Component
public class TelemetriaMqttListener implements MqttCallback {

    private static final Logger log = LoggerFactory.getLogger(TelemetriaMqttListener.class);
    private static final String MARCADOR_PENDIENTE = "PENDIENTE_DEFINIR";

    @Value("${minatech.mqtt.broker-url}")
    private String brokerUrl;

    @Value("${minatech.mqtt.client-id}")
    private String clientId;

    @Value("${minatech.mqtt.topic}")
    private String topic;

    @Value("${minatech.mqtt.username}")
    private String username;

    @Value("${minatech.mqtt.password}")
    private String password;

    private final TelemetriaService telemetriaService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private MqttClient mqttClient;

    public TelemetriaMqttListener(TelemetriaService telemetriaService) {
        this.telemetriaService = telemetriaService;
    }

    @PostConstruct
    public void conectar() {
        if (faltaConfigurar(brokerUrl) || faltaConfigurar(topic)) {
            log.warn("MQTT deshabilitado: define minatech.mqtt.broker-url y minatech.mqtt.topic "
                    + "en application.properties para activar la recepcion de telemetria.");
            return;
        }

        try {
            mqttClient = new MqttClient(brokerUrl, clientId, new MemoryPersistence());
            mqttClient.setCallback(this);

            MqttConnectOptions opciones = new MqttConnectOptions();
            opciones.setCleanSession(true);
            opciones.setAutomaticReconnect(true);
            if (username != null && !username.isBlank()) {
                opciones.setUserName(username);
                opciones.setPassword(password == null ? new char[0] : password.toCharArray());
            }

            mqttClient.connect(opciones);
            mqttClient.subscribe(topic);
            log.info("Conectado a MQTT en {} y suscrito al topico '{}'.", brokerUrl, topic);
        } catch (MqttException ex) {
            log.error("No se pudo conectar al broker MQTT ({}): {}", brokerUrl, ex.getMessage(), ex);
        }
    }

    @PreDestroy
    public void desconectar() {
        if (mqttClient != null && mqttClient.isConnected()) {
            try {
                mqttClient.disconnect();
            } catch (MqttException ex) {
                log.warn("Error al desconectar el cliente MQTT: {}", ex.getMessage());
            }
        }
    }

    @Override
    public void messageArrived(String topic, MqttMessage message) {
        try {
            TelemetriaMqttPayload payload = objectMapper.readValue(message.getPayload(), TelemetriaMqttPayload.class);
            telemetriaService.procesarPayload(payload);
        } catch (Exception ex) {
            // Nunca propagar la excepcion: un mensaje mal formado no debe
            // tumbar el hilo del cliente MQTT.
            log.error("Mensaje MQTT invalido en el topico '{}': {}", topic, ex.getMessage(), ex);
        }
    }

    @Override
    public void connectionLost(Throwable cause) {
        log.warn("Conexion MQTT perdida: {}", cause.getMessage());
    }

    @Override
    public void deliveryComplete(IMqttDeliveryToken token) {
        // No se publican mensajes desde el backend; no aplica.
    }

    private boolean faltaConfigurar(String valor) {
        return valor == null || valor.isBlank() || valor.startsWith(MARCADOR_PENDIENTE);
    }
}
