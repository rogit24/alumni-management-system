package com.alumniconnect.job.service;

import java.util.List;

import com.alumniconnect.job.dto.JobDto;
import com.alumniconnect.job.entity.UserRole;

public interface JobService {
 
	JobDto create(JobDto jobDto,String userEmail,UserRole userRole);
	
	List<JobDto> getAllJobs();
	
	JobDto getJobById(Long id);
	
	JobDto updateJob(Long id, JobDto jobDto,String email, UserRole userRole);
	
	void delete(Long id,String userEmail,UserRole userRole);
	
	
}
