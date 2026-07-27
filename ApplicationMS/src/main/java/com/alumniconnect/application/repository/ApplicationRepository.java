package com.alumniconnect.application.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.alumniconnect.application.entity.Application;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
	
	 List<Application> findByStudentEmail(String studentEmail);
	    
	    List<Application> findByJobId(Long jobId);
	    
	    boolean existsByJobIdAndStudentEmail(Long jobId, String studentEmail);
	
}
