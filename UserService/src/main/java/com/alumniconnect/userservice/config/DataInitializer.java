package com.alumniconnect.userservice.config;

import com.alumniconnect.userservice.entity.User;
import com.alumniconnect.userservice.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        String adminEmail = "admin@alumniconnect.com";
        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = User.builder()
                    .name("System Admin")
                    .email(adminEmail)
                    .password(passwordEncoder.encode("admin123"))
                    .role(User.Role.ADMIN)
                    .status(User.Status.ACTIVE)
                    .emailVerified(true)
                    .build();

            userRepository.save(admin);
            System.out.println("=================================================");
            System.out.println("DEFAULT ADMIN ACCOUNT CREATED SUCCESSFULLY!");
            System.out.println("Email: " + adminEmail);
            System.out.println("Password: admin123");
            System.out.println("=================================================");
        } else {
            System.out.println("Admin account already exists. Skipping initialization.");
        }
    }
}
