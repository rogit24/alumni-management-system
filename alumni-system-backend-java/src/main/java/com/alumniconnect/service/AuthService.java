package com.alumniconnect.service;

import com.alumniconnect.dto.auth.AuthResponse;
import com.alumniconnect.dto.auth.LoginRequest;
import com.alumniconnect.dto.auth.RegisterRequest;
import com.alumniconnect.entity.User;
import com.alumniconnect.exception.UnauthorizedException;
import com.alumniconnect.repository.UserRepository;
import com.alumniconnect.security.JwtUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered!");
        }

        User.Role resolvedRole;
        try {
            resolvedRole = User.Role.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid role: " + request.getRole());
        }

        // Default statuses: STUDENT -> ACTIVE, ALUMNI -> PENDING, ADMIN -> ACTIVE
        User.Status resolvedStatus = resolvedRole == User.Role.ALUMNI ? User.Status.PENDING : User.Status.ACTIVE;

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(resolvedRole)
                .status(resolvedStatus)
                .build();

        userRepository.save(user);

        return AuthResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .status(user.getStatus().name())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        if (user.getStatus() == User.Status.BANNED) {
            throw new UnauthorizedException("Your account has been banned by the Admin! ❌");
        }

        if (user.getStatus() == User.Status.PENDING && user.getRole() == User.Role.ALUMNI) {
            throw new UnauthorizedException("Your alumni account is pending Admin approval! ❌");
        }

        String token = jwtUtils.generateToken(user.getEmail(), user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .status(user.getStatus().name())
                .build();
    }
}
