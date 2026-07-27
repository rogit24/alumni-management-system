package com.alumniconnect.userservice.service;

import com.alumniconnect.userservice.dto.AuthResponse;
import com.alumniconnect.userservice.dto.LoginRequest;
import com.alumniconnect.userservice.dto.RegisterRequest;
import com.alumniconnect.userservice.dto.UserDto;
import com.alumniconnect.userservice.entity.User;
import com.alumniconnect.userservice.repository.UserRepository;
import com.alumniconnect.userservice.security.JwtUtils;
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
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        if (user.getStatus() == User.Status.BANNED) {
            throw new RuntimeException("Your account has been banned by the Admin! ❌");
        }

        if (user.getStatus() == User.Status.PENDING && user.getRole() == User.Role.ALUMNI) {
            throw new RuntimeException("Your alumni account is pending Admin approval! ❌");
        }

        String token = jwtUtils.generateToken(user.getId(), user.getEmail(), user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .status(user.getStatus().name())
                .build();
    }

    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        return UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .status(user.getStatus().name())
                .build();
    }

    public java.util.List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(user -> UserDto.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .role(user.getRole().name())
                        .status(user.getStatus().name())
                        .build())
                .collect(java.util.stream.Collectors.toList());
    }

    public UserDto updateUserStatus(Long id, String statusStr) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        try {
            User.Status status = User.Status.valueOf(statusStr.toUpperCase());
            user.setStatus(status);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status: " + statusStr);
        }
        userRepository.save(user);
        return UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .status(user.getStatus().name())
                .build();
    }

    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        userRepository.delete(user);
    }
}
