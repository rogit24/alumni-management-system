package com.alumniconnect.gateway.security;

import io.jsonwebtoken.Claims;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {

    private final JwtUtils jwtUtils;

    public AuthenticationFilter(JwtUtils jwtUtils) {
        super(Config.class);
        this.jwtUtils = jwtUtils;
    }

    public static class Config {
        // No custom config parameters needed for now
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();

            // 0. Bypass security checks for Swagger / OpenAPI documentation endpoints
            String path = request.getURI().getPath();
            if (path.contains("/v3/api-docs") || path.contains("/swagger-ui") || path.contains("/swagger-resources")) {
                return chain.filter(exchange);
            }

            // 1. Check if Authorization header exists
            if (!request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                return onError(exchange, "Missing Authorization Header", HttpStatus.UNAUTHORIZED);
            }

            String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return onError(exchange, "Malformed Authorization Header", HttpStatus.UNAUTHORIZED);
            }

            String token = authHeader.substring(7);

            // 2. Validate token
            if (!jwtUtils.validateToken(token)) {
                return onError(exchange, "Invalid or Expired Session Token", HttpStatus.UNAUTHORIZED);
            }

            // 3. Extract claims and mutate request with user details headers
            try {
                Claims claims = jwtUtils.getClaims(token);
                String email = claims.getSubject();
                String role = claims.get("role", String.class);

                // Re-write the request headers before sending it to target microservice
                ServerHttpRequest mutatedRequest = request.mutate()
                        .header("X-User-Email", email)
                        .header("X-User-Role", role)
                        .build();

                return chain.filter(exchange.mutate().request(mutatedRequest).build());
            } catch (Exception e) {
                return onError(exchange, "Claims Parsing Error", HttpStatus.UNAUTHORIZED);
            }
        };
    }

    private Mono<Void> onError(ServerWebExchange exchange, String err, HttpStatus httpStatus) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(httpStatus);
        // Add error info in header or body
        response.getHeaders().add("X-Gateway-Auth-Error", err);
        return response.setComplete();
    }
}
