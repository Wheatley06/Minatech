package com.minatech.iot.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import java.security.Key;
import java.util.Date;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

/**
 * Genera y valida los tokens JWT usados para autenticar las peticiones
 * REST despues del login (se envian como header
 * "Authorization: Bearer &lt;token&gt;").
 */
@Service
public class JwtService {

    private final Key signingKey;
    private final long expirationMs;

    public JwtService(
            @Value("${minatech.jwt.secret}") String secret,
            @Value("${minatech.jwt.expiration-ms}") long expirationMs) {
        // La clave debe tener al menos 256 bits para HS256; el valor de
        // application.properties ya viene de ese largo por defecto.
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes());
        this.expirationMs = expirationMs;
    }

    public String generarToken(UserDetails userDetails, Map<String, Object> claimsExtra) {
        Date ahora = new Date();
        Date expiracion = new Date(ahora.getTime() + expirationMs);

        return Jwts.builder()
                .setClaims(claimsExtra)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(ahora)
                .setExpiration(expiracion)
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();
    }

    public String extraerEmail(String token) {
        return parseClaims(token).getSubject();
    }

    public boolean esTokenValido(String token, UserDetails userDetails) {
        String email = extraerEmail(token);
        return email.equals(userDetails.getUsername()) && !estaExpirado(token);
    }

    private boolean estaExpirado(String token) {
        return parseClaims(token).getExpiration().before(new Date());
    }

    private Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
