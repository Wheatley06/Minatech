package com.minatech.iot.auth;

import com.minatech.iot.auth.dto.LoginRequest;
import com.minatech.iot.auth.dto.LoginResponse;
import com.minatech.iot.auth.dto.RegistroRequest;
import com.minatech.iot.auth.dto.UsuarioResponse;
import com.minatech.iot.domain.Minero;
import com.minatech.iot.domain.RolUsuario;
import com.minatech.iot.domain.Usuario;
import com.minatech.iot.repository.UsuarioRepository;
import com.minatech.iot.security.JwtService;
import com.minatech.iot.security.UsuarioDetailsService;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Logica de negocio del login y el registro de usuarios nuevos.
 *
 * El registro crea una fila de {@link Minero} (con dni/telefono/concesion
 * minera) cuando el rol elegido es MINERO_OPERADOR, o una fila de
 * {@link Usuario} "plana" para los roles JEFE_OPERACIONES y ADMINISTRADOR,
 * que no tienen datos adicionales en este entregable.
 */
@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UsuarioDetailsService usuarioDetailsService;

    public AuthService(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            UsuarioDetailsService usuarioDetailsService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.usuarioDetailsService = usuarioDetailsService;
    }

    public LoginResponse login(LoginRequest request) {
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AuthException("Correo o contraseña incorrectos.", HttpStatus.UNAUTHORIZED));

        if (!usuario.isActivo()) {
            throw new AuthException("Esta cuenta está inactiva. Contacta al administrador.", HttpStatus.UNAUTHORIZED);
        }

        if (!passwordEncoder.matches(request.getPassword(), usuario.getPasswordHash())) {
            throw new AuthException("Correo o contraseña incorrectos.", HttpStatus.UNAUTHORIZED);
        }

        UserDetails userDetails = usuarioDetailsService.loadUserByUsername(usuario.getEmail());
        String token = jwtService.generarToken(
                userDetails,
                Map.of(
                        "rol", usuario.getRol().name(),
                        "nombres", usuario.getNombres(),
                        "usuarioId", usuario.getId()
                )
        );

        return new LoginResponse(token, UsuarioResponse.desde(usuario));
    }

    public UsuarioResponse registrar(RegistroRequest request) {
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new AuthException("Ya existe una cuenta registrada con este correo.");
        }

        String passwordHash = passwordEncoder.encode(request.getPassword());
        Usuario nuevoUsuario;

        if (request.getRol() == RolUsuario.MINERO_OPERADOR) {
            if (esVacio(request.getDni()) || esVacio(request.getTelefono()) || esVacio(request.getConcesionMinera())) {
                throw new AuthException(
                        "Para el rol Minero/Operador, DNI, teléfono y concesión minera son obligatorios.");
            }
            nuevoUsuario = new Minero(
                    request.getNombres(),
                    request.getApellidos(),
                    request.getEmail(),
                    passwordHash,
                    request.getDni(),
                    request.getTelefono(),
                    request.getConcesionMinera());
        } else {
            // JEFE_OPERACIONES o ADMINISTRADOR: sin datos adicionales por ahora.
            nuevoUsuario = new Usuario(
                    request.getNombres(),
                    request.getApellidos(),
                    request.getEmail(),
                    passwordHash,
                    request.getRol());
        }

        Usuario guardado = usuarioRepository.save(nuevoUsuario);
        return UsuarioResponse.desde(guardado);
    }

    private boolean esVacio(String valor) {
        return valor == null || valor.isBlank();
    }
}
