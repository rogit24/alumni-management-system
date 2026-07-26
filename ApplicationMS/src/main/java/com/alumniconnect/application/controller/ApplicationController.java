package com.alumniconnect.application.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.alumniconnect.application.dto.ApplicationDto;
import com.alumniconnect.application.entity.UserRole;
import com.alumniconnect.application.service.ApplicationService;

import jakarta.validation.Valid;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/applications")
public class ApplicationController {

//    @GetMapping("/hello")
//    public ResponseEntity<Map<String, String>> sayHello(
//            @RequestHeader(value = "X-User-Email", required = false) String userEmail,
//            @RequestHeader(value = "X-User-Role", required = false) String userRole) {
//        
//        Map<String, String> response = new HashMap<>();
//        response.put("message", "Hello from the Application Microservice Client!");
//        response.put("extractedEmail", userEmail != null ? userEmail : "Not passed by gateway");
//        response.put("extractedRole", userRole != null ? userRole : "Not passed by gateway");
//        
//        return ResponseEntity.ok(response);
//    }
	
	
	private final ApplicationService applicationService;
	
	@Autowired
    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }
	
	@PostMapping
	public ResponseEntity<ApplicationDto> submit(
			@Valid @RequestBody ApplicationDto applicationDto,
			@RequestHeader(value="X-User-Email",required = false)String userEmail,
			@RequestHeader(value = "X-User_Role",required= false)String userRole)
			{
		
		validateRole(userRole, UserRole.STUDENT);
		if(userEmail==null || userEmail.isBlank()) {
			throw new RuntimeException("Access denied: X-User-Email header is missing");
		}
		ApplicationDto createdApplication =applicationService.submitApplication(applicationDto, userEmail);
		
		return new ResponseEntity<>(createdApplication,HttpStatus.CREATED);
	}
	
    
    
    private UserRole  validateRole(String userRoleStr, UserRole... allowedRoles) {
    	
    	if(userRoleStr==null) {
    		throw new RuntimeException("Access Denied: UserRole header is missing ");
    	}
    	UserRole userRole;
    	try {
    		userRole = UserRole.fromString(userRoleStr);
    	}catch(IllegalArgumentException e) {
    		throw new RuntimeException("Access denied: Unauthorized role: " + userRoleStr);
        }
    	for(UserRole allowedRole : UserRole.values()) {
    		if(userRole == allowedRole) {
    			return userRole;
    		}
    	}
		throw new RuntimeException("Access denied: Unauthorized role: " + userRoleStr);
    }
}
