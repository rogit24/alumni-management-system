package com.alumniconnect.application.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/applications")
public class ApplicationController {

    @GetMapping("/hello")
    public ResponseEntity<Map<String, String>> sayHello(
            @RequestHeader(value = "X-User-Email", required = false) String userEmail,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Hello from the Application Microservice Client!");
        response.put("extractedEmail", userEmail != null ? userEmail : "Not passed by gateway");
        response.put("extractedRole", userRole != null ? userRole : "Not passed by gateway");
        
        return ResponseEntity.ok(response);
    }
}
