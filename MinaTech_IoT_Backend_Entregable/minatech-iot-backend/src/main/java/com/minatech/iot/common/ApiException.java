package com.minatech.iot.common;

import org.springframework.http.HttpStatus;

/**
 * Excepcion generica para errores de negocio en los endpoints de
 * sensores, alertas, planes de mantenimiento y dashboard (los de
 * autenticacion siguen usando AuthException, que ya existia antes).
 */
public class ApiException extends RuntimeException {

    private final HttpStatus status;

    public ApiException(String mensaje) {
        this(mensaje, HttpStatus.BAD_REQUEST);
    }

    public ApiException(String mensaje, HttpStatus status) {
        super(mensaje);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
