package com.minatech.iot.auth.dto;

import com.minatech.iot.domain.RolUsuario;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Cuerpo de la peticion POST /api/auth/registro.
 *
 * dni, telefono y concesionMinera solo son obligatorios cuando
 * rol = MINERO_OPERADOR; esa validacion condicional se hace en
 * AuthService (no se puede expresar solo con anotaciones porque
 * depende del valor de otro campo).
 */
public class RegistroRequest {

    @NotBlank
    private String nombres;

    @NotBlank
    private String apellidos;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
    private String password;

    @NotNull
    private RolUsuario rol;

    // Solo obligatorios si rol = MINERO_OPERADOR
    private String dni;
    private String telefono;
    private String concesionMinera;

    public RegistroRequest() {
    }

    public String getNombres() {
        return nombres;
    }

    public void setNombres(String nombres) {
        this.nombres = nombres;
    }

    public String getApellidos() {
        return apellidos;
    }

    public void setApellidos(String apellidos) {
        this.apellidos = apellidos;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public RolUsuario getRol() {
        return rol;
    }

    public void setRol(RolUsuario rol) {
        this.rol = rol;
    }

    public String getDni() {
        return dni;
    }

    public void setDni(String dni) {
        this.dni = dni;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public String getConcesionMinera() {
        return concesionMinera;
    }

    public void setConcesionMinera(String concesionMinera) {
        this.concesionMinera = concesionMinera;
    }
}
