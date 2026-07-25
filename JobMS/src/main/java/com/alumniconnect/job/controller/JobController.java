package com.alumniconnect.job.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.alumniconnect.job.dto.JobDto;
import com.alumniconnect.job.entity.UserRole;
import com.alumniconnect.job.service.JobService;

import jakarta.validation.Valid;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/jobs")
public class JobController {

//    @GetMapping("/hello")
//    public ResponseEntity<Map<String, String>> sayHello(
//            @RequestHeader(value = "X-User-Email", required = false) String userEmail,
//            @RequestHeader(value = "X-User-Role", required = false) String userRole) {
//        
//        Map<String, String> response = new HashMap<>();
//        response.put("message", "Hello from the Job Microservice Client!");
//        response.put("extractedEmail", userEmail != null ? userEmail : "Not passed by gateway");
//        response.put("extractedRole", userRole != null ? userRole : "Not passed by gateway");
//        
//        return ResponseEntity.ok(response);
    //}
	
	private JobService jobService ;
	
	@Autowired
	public JobController(JobService jobService) {
		this.jobService = jobService;
	}
	
	@PostMapping
	public ResponseEntity<JobDto> createJob(@Valid @RequestBody JobDto jobDto,
            @RequestHeader(value = "X-User-Email", required = false) String userEmail,
            @RequestHeader(value = "X-User-Role", required = false) String userRole){
		UserRole validateRole = validateRole(userRole,UserRole.ALUMNI,UserRole.ADMIN);
		JobDto createdJob = jobService.create(jobDto, userEmail, validateRole);
		
		return new ResponseEntity<>(createdJob,HttpStatus.CREATED);
	}
	
	@GetMapping
	public ResponseEntity<List<JobDto>> getAllJobs(
			@RequestHeader(value="X-User-Email",required = false)String userEmail,
			@RequestHeader(value="X-User-Role",required = false)String userRole){
		validateRole(userRole, UserRole.ADMIN,UserRole.STUDENT,UserRole.ALUMNI);
		List<JobDto> jobs = jobService.getAllJobs();
		return ResponseEntity.ok(jobs);
	}
	
	
	
	
	
	
	
//	Validate UserRole
	private UserRole validateRole(String userRoleStr, UserRole... allowedRoles) {
        if (userRoleStr == null) {
            throw new RuntimeException("Access denied: User role header is missing");
        }
        UserRole userRole;
        try {
            userRole = UserRole.fromString(userRoleStr);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Access denied: Unauthorized role: " + userRoleStr);
        }
        for (UserRole allowedRole : allowedRoles) {
            if (userRole == allowedRole) {
                return userRole;
            }
        }
        throw new RuntimeException("Access denied: Unauthorized role: " + userRoleStr);
    }
}
