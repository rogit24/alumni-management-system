package com.alumniconnect.application.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.alumniconnect.application.dto.ApplicationDto;
import com.alumniconnect.application.entity.ApplicationStatus;
import com.alumniconnect.application.entity.UserRole;
import com.alumniconnect.application.service.ApplicationService;

import jakarta.validation.Valid;

import java.util.HashMap;
import java.util.List;
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
			@RequestHeader(value = "X-User-Role",required= false)String userRole)
			{
		
		validateRole(userRole, UserRole.STUDENT);
		if(userEmail==null || userEmail.isBlank()) {
			throw new RuntimeException("Access denied: X-User-Email header is missing");
		}
		ApplicationDto createdApplication =applicationService.submitApplication(applicationDto, userEmail);
		
		return new ResponseEntity<>(createdApplication,HttpStatus.CREATED);
	}
	
	@GetMapping("/my-applications")
     public ResponseEntity<List<ApplicationDto>> getApplications(
    		 @RequestHeader(value="X-User-email",required = false)String email,
    		 @RequestHeader(value="X-User-Role",required = false)String userRole){
		validateRole(userRole,UserRole.STUDENT);
		if(email ==null || email.isBlank()) {
			throw new RuntimeException("Access denied: X-User-Email header is missing");
		}
		
		List<ApplicationDto> applications = applicationService.getApplicationsForStudent(email);
				return ResponseEntity.ok(applications);
		
	}
  
	
	@GetMapping("/job/{jobId}")
    public ResponseEntity<List<ApplicationDto>> getApplicationsForJob(
            @PathVariable Long jobId,
            @RequestHeader(value = "X-User-Email", required = false) String userEmail,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {

        validateRole(userRole, UserRole.ALUMNI, UserRole.ADMIN);
        List<ApplicationDto> applications = applicationService.getApplicationsForJob(jobId);
        return ResponseEntity.ok(applications);
    }
	
	@PatchMapping("/{id}/status")
	public ResponseEntity<ApplicationDto> updateStatus(@PathVariable Long id,
            @RequestParam(value = "status", required = false) String queryStatus,
            @RequestBody(required = false) Map<String, String> bodyStatusMap,
            @RequestHeader(value = "X-User-Email", required = false) String userEmail,
            @RequestHeader(value = "X-User-Role", required = false) String userRole) {

        UserRole validatedRole = validateRole(userRole, UserRole.ALUMNI, UserRole.ADMIN);

        String statusToUpdate = queryStatus;
        if ((statusToUpdate == null || statusToUpdate.isBlank()) && bodyStatusMap != null) {
            statusToUpdate = bodyStatusMap.get("status");
        }

        if (statusToUpdate == null || statusToUpdate.isBlank()) {
            throw new RuntimeException("Status field is required either in query parameter or JSON request body");
        }

        ApplicationStatus statusEnum = ApplicationStatus.fromString(statusToUpdate);

        ApplicationDto updated = applicationService.updateApplicationStatus(id, statusEnum, validatedRole);
        return ResponseEntity.ok(updated);
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteApplication(
			@PathVariable Long id,
			@RequestHeader(value = "X-User-Email", required = false) String userEmail,
			@RequestHeader(value = "X-User-Role", required = false) String userRole) {
		
		validateRole(userRole, UserRole.STUDENT, UserRole.ADMIN);
		applicationService.deleteApplication(id);
		return ResponseEntity.ok().build();
	}

	@GetMapping
	public ResponseEntity<List<ApplicationDto>> getAllApplications(
			@RequestHeader(value = "X-User-Role", required = false) String userRole) {
		validateRole(userRole, UserRole.ADMIN);
		List<ApplicationDto> applications = applicationService.getAllApplications();
		return ResponseEntity.ok(applications);
	}
	
//	Validation of the UserRole
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
    	for(UserRole allowedRole : allowedRoles) {
    		if(userRole == allowedRole) {
    			return userRole;
    		}
    	}
		throw new RuntimeException("Access denied: Unauthorized role: " + userRoleStr);
    }
}
