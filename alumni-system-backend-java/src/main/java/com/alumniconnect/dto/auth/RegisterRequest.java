package com.alumniconnect.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Name must not be blank")
    private String name;

    @NotBlank(message = "Email must not be blank")
    @Email(message = "Email must be valid")
    private String email;

    @NotBlank(message = "Password must not be blank")
    private String password;

    @NotBlank(message = "Role must not be blank")
    @Pattern(regexp = "^(?i)(student|alumni|admin)$", message = "Role must be student, alumni, or admin")
    private String role;
}
