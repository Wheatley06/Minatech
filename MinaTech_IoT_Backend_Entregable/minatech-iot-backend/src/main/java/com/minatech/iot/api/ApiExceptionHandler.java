package com.minatech.iot.api;

import com.minatech.iot.auth.dto.ErrorResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/** Traduce los {@link ApiException} de cualquier controlador de /api/** a una respuesta JSON uniforme. */
@RestControllerAdvice(basePackages = "com.minatech.iot.api")
public class ApiExceptionHandler {

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ErrorResponse> manejarApiException(ApiException ex) {
        return ResponseEntity.status(ex.getStatus()).body(new ErrorResponse(ex.getMessage()));
    }
}
