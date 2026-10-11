package com.minatech.iot.common;

/** Cuerpo de respuesta JSON usado para cualquier error de negocio. */
public class ErrorResponse {

    private String mensaje;

    public ErrorResponse() {
    }

    public ErrorResponse(String mensaje) {
        this.mensaje = mensaje;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }
}
