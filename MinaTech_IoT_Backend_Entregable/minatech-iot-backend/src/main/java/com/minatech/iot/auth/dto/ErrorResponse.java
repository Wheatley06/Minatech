package com.minatech.iot.auth.dto;

/** Cuerpo de error simple devuelto cuando falla el login o el registro. */
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
