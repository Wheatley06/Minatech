package com.minatech.iot.auth;

import com.minatech.iot.auth.dto.ErrorResponse;
import com.minatech.iot.auth.dto.LoginRequest;
import com.minatech.iot.auth.dto.LoginResponse;
import com.minatech.iot.auth.dto.RegistroRequest;
import com.minatech.iot.auth.dto.UsuarioResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Endpoints publicos de autenticacion (ver SecurityConfig: "/api/auth/**"
 * esta excluido del filtro JWT).
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /** POST /api/auth/login - devuelve el token JWT y los datos del usuario. */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    /** POST /api/auth/registro - crea un usuario nuevo (Minero, Jefe de Operaciones o Administrador). */
    @PostMapping("/registro")
    public ResponseEntity<UsuarioResponse> registrar(@Valid @RequestBody RegistroRequest request) {
        UsuarioResponse creado = authService.registrar(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @ExceptionHandler(AuthException.class)
    public ResponseEntity<ErrorResponse> manejarAuthException(AuthException ex) {
        return ResponseEntity.status(ex.getStatus()).body(new ErrorResponse(ex.getMessage()));
    }
}
