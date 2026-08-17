package com.nixtap.mediaservice.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;

@Slf4j @Component
public class JwtUtil {
    @Value("${jwt.secret}") private String jwtSecret;
    private SecretKey key() { return Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret)); }
    public String getEmailFromJwtToken(String t)  { return parseClaims(t).getSubject(); }
    public String getRoleFromJwtToken(String t)   { return parseClaims(t).get("role",   String.class); }
    public Long   getUserIdFromJwtToken(String t) { return parseClaims(t).get("userId", Long.class); }
    public boolean validateJwtToken(String t) {
        try { Jwts.parser().verifyWith(key()).build().parseSignedClaims(t); return true; }
        catch (JwtException | IllegalArgumentException e) { log.error("Invalid JWT: {}", e.getMessage()); }
        return false;
    }
    private Claims parseClaims(String t) {
        return Jwts.parser().verifyWith(key()).build().parseSignedClaims(t).getPayload();
    }
}
