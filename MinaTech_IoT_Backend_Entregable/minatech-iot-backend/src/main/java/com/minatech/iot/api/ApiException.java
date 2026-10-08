package com.minatech.iot.api;

import org.springframework.http.HttpStatus;

/** Error de negocio de la API REST (recurso no encontrado, dato duplicado, etc.). */
public class ApiException extends RuntimeException {

    private final HttpStatus status;

    public ApiException(String mensaje, HttpStatus status) {
        super(mensaje);
        this.status = status;
    }

    public static ApiException noEncontrado(String mensaje) {
        return new ApiException(mensaje, HttpStatus.NOT_FOUND);
    }

    public static ApiException conflicto(String mensaje) {
        return new ApiException(mensaje, HttpStatus.CONFLICT);
    }

    public static ApiException solicitudInvalida(String mensaje) {
        return new ApiException(mensaje, HttpStatus.BAD_REQUEST);
    }

    public HttpStatus getStatus() {
        return status;
    }
}
