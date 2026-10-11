package com.minatech.iot.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;

/**
 * Representa al operador minero. Hereda de {@link Usuario} y consulta
 * sus alertas de riesgo asociadas a los sensores que gestiona.
 */
@Entity
@Table(name = "minero")
@PrimaryKeyJoinColumn(name = "usuario_id")
public class Minero extends Usuario {

    @Column(length = 20)
    private String dni;

    @Column(length = 20)
    private String telefono;

    @Column(name = "concesion_minera", length = 150)
    private String concesionMinera;

    public Minero() {
        super();
    }

    public Minero(String nombres, String apellidos, String email, String passwordHash,
                   String dni, String telefono, String concesionMinera) {
        super(nombres, apellidos, email, passwordHash, RolUsuario.MINERO_OPERADOR);
        this.dni = dni;
        this.telefono = telefono;
        this.concesionMinera = concesionMinera;
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
