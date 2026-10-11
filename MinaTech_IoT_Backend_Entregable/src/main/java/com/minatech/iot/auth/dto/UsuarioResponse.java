package com.minatech.iot.auth.dto;

import com.minatech.iot.domain.Minero;
import com.minatech.iot.domain.RolUsuario;
import com.minatech.iot.domain.Usuario;

/** Datos del usuario que se devuelven al frontend (nunca incluye el hash de la contraseña). */
public class UsuarioResponse {

    private Long id;
    private String nombres;
    private String apellidos;
    private String email;
    private RolUsuario rol;
    private boolean activo;
    // Solo presentes cuando el usuario es un Minero; null en los demás roles.
    private String dni;
    private String telefono;
    private String concesionMinera;

    public static UsuarioResponse desde(Usuario usuario) {
        UsuarioResponse dto = new UsuarioResponse();
        dto.id = usuario.getId();
        dto.nombres = usuario.getNombres();
        dto.apellidos = usuario.getApellidos();
        dto.email = usuario.getEmail();
        dto.rol = usuario.getRol();
        dto.activo = usuario.isActivo();

        if (usuario instanceof Minero minero) {
            dto.dni = minero.getDni();
            dto.telefono = minero.getTelefono();
            dto.concesionMinera = minero.getConcesionMinera();
        }
        return dto;
    }

    public Long getId() {
        return id;
    }

    public String getNombres() {
        return nombres;
    }

    public String getApellidos() {
        return apellidos;
    }

    public String getEmail() {
        return email;
    }

    public RolUsuario getRol() {
        return rol;
    }

    public boolean isActivo() {
        return activo;
    }

    public String getDni() {
        return dni;
    }

    public String getTelefono() {
        return telefono;
    }

    public String getConcesionMinera() {
        return concesionMinera;
    }
}
