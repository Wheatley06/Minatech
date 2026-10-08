package com.minatech.iot.domain;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Clase base de autenticacion. Gestiona las credenciales y el rol de
 * acceso de cualquier persona que interactua con el sistema MinaTech IoT
 * (Minero/Operador, Jefe de Operaciones, Administrador).
 */
@Entity
@Table(name = "usuario")
@Inheritance(strategy = InheritanceType.JOINED)
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, length = 100)
    private String nombres;

    @NotBlank
    @Column(nullable = false, length = 100)
    private String apellidos;

    @NotBlank
    @Email
    @Column(nullable = false, unique = true, length = 150)
    private String email;

    /** Hash BCrypt de la contraseña (nunca se guarda en texto plano). */
    @NotBlank
    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private RolUsuario rol;

    @Column(nullable = false)
    private boolean activo = true;

    @Column(name = "fecha_registro", nullable = false)
    private LocalDateTime fechaRegistro = LocalDateTime.now();

    /**
     * Sensores de mina que este usuario gestiona (relacion 1 a N:
     * un usuario gestiona varios sensores).
     */
    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SensorMina> sensoresGestionados = new ArrayList<>();

    public Usuario() {
    }

    public Usuario(String nombres, String apellidos, String email, String passwordHash, RolUsuario rol) {
        this.nombres = nombres;
        this.apellidos = apellidos;
        this.email = email;
        this.passwordHash = passwordHash;
        this.rol = rol;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public RolUsuario getRol() {
        return rol;
    }

    public void setRol(RolUsuario rol) {
        this.rol = rol;
    }

    public boolean isActivo() {
        return activo;
    }

    public void setActivo(boolean activo) {
        this.activo = activo;
    }

    public LocalDateTime getFechaRegistro() {
        return fechaRegistro;
    }

    public void setFechaRegistro(LocalDateTime fechaRegistro) {
        this.fechaRegistro = fechaRegistro;
    }

    public List<SensorMina> getSensoresGestionados() {
        return sensoresGestionados;
    }

    public void setSensoresGestionados(List<SensorMina> sensoresGestionados) {
        this.sensoresGestionados = sensoresGestionados;
    }
}
