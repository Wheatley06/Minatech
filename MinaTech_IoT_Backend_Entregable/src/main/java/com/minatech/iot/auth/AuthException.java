package com.minatech.iot.auth;

import org.springframework.http.HttpStatus;

/** Error de negocio en el flujo de autenticación (email duplicado, datos faltantes, credenciales inválidas, etc.). */
public class AuthException extends RuntimeException {

    private final HttpStatus status;

    /** Por defecto 400 Bad Request (datos de registro inválidos o incompletos). */
    public AuthException(String mensaje) {
        this(mensaje, HttpStatus.BAD_REQUEST);
    }

    public AuthException(String mensaje, HttpStatus status) {
        super(mensaje);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
