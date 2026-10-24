package com.minatech.iot.common;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Traduce ApiException a una respuesta JSON consistente para todos los
 * controladores nuevos (equipos, sensores, alertas, planes, dashboard).
 * El flujo de autenticacion mantiene su propio manejador en
 * AuthController, que ya existia antes de estos endpoints.
 */
@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ErrorResponse> manejarApiException(ApiException ex) {
        return ResponseEntity.status(ex.getStatus()).body(new ErrorResponse(ex.getMessage()));
    }
}
