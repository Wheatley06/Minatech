package com.minatech.iot.auth.dto;

/** Respuesta de un login exitoso: el token JWT y los datos basicos del usuario. */
public class LoginResponse {

    private String token;
    private String tipoToken = "Bearer";
    private UsuarioResponse usuario;

    public LoginResponse() {
    }

    public LoginResponse(String token, UsuarioResponse usuario) {
        this.token = token;
        this.usuario = usuario;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getTipoToken() {
        return tipoToken;
    }

    public void setTipoToken(String tipoToken) {
        this.tipoToken = tipoToken;
    }

    public UsuarioResponse getUsuario() {
        return usuario;
    }

    public void setUsuario(UsuarioResponse usuario) {
        this.usuario = usuario;
    }
}
