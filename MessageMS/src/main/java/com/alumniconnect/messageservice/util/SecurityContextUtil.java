package com.alumniconnect.messageservice.util;

import com.alumniconnect.messageservice.exception.UnauthorizedException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.nio.charset.StandardCharsets;
import java.security.Key;

@Component
public class SecurityContextUtil {

    @Value("${jwt.secret:my_super_secret_key_which_is_long_enough_for_sha256_key_and_more_characters_for_security}")
    private String jwtSecret;

    public static class UserSecurityDetails {
        private final Long userId;
        private final String email;
        private final String role;

        public UserSecurityDetails(Long userId, String email, String role) {
            this.userId = userId;
            this.email = email;
            this.role = role;
        }

        public Long getUserId() { return userId; }
        public String getEmail() { return email; }
        public String getRole() { return role; }
    }

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    public UserSecurityDetails extractUserSecurityDetails(HttpServletRequest request, String headerUserId, String headerUserEmail, String headerUserRole) {
        Long userId = null;
        String email = headerUserEmail;
        String role = headerUserRole;

        if (StringUtils.hasText(headerUserId)) {
            try {
                userId = Long.parseLong(headerUserId.trim());
            } catch (NumberFormatException ignored) {}
        }

        // Fallback: parse Bearer JWT token directly if X-User-Id header was not set by API Gateway
        if (userId == null || !StringUtils.hasText(email)) {
            String authHeader = request.getHeader("Authorization");
            if (StringUtils.hasText(authHeader) && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                try {
                    Claims claims = Jwts.parserBuilder()
                            .setSigningKey(getSigningKey())
                            .build()
                            .parseClaimsJws(token)
                            .getBody();

                    if (userId == null && claims.get("userId") != null) {
                        userId = Long.parseLong(claims.get("userId").toString());
                    }
                    if (!StringUtils.hasText(email)) {
                        email = claims.getSubject();
                    }
                    if (!StringUtils.hasText(role) && claims.get("role") != null) {
                        role = claims.get("role", String.class);
                    }
                } catch (Exception e) {
                    System.err.println("MessageMS JWT extraction warning: " + e.getMessage());
                }
            }
        }

        if (userId == null) {
            throw new UnauthorizedException("User authentication required: Missing or invalid authentication token.");
        }

        return new UserSecurityDetails(userId, email, role);
    }
}
