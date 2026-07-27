package com.alumniconnect.application.service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.alumniconnect.application.client.JobServiceClient;
import com.alumniconnect.application.dto.ApplicationDto;
import com.alumniconnect.application.entity.Application;
import com.alumniconnect.application.entity.ApplicationStatus;
import com.alumniconnect.application.entity.UserRole;
import com.alumniconnect.application.repository.ApplicationRepository;

import feign.FeignException;
import feign.FeignException.FeignClientException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class ApplicationServiceImpl implements ApplicationService {
	
	private final ApplicationRepository applicationRepository;
	
	private final JobServiceClient jobServiceClient;
	
	private final ModelMapper modelMapper;
	
	 @Autowired
	    public ApplicationServiceImpl(ApplicationRepository applicationRepository,
	                                  ModelMapper modelMapper,
	                                  JobServiceClient jobServiceClient) {
	        this.applicationRepository = applicationRepository;
	        this.modelMapper = modelMapper;
	        this.jobServiceClient = jobServiceClient;
	    }

	@Override
	public ApplicationDto submitApplication(ApplicationDto dto, String studentEmail) {
		if (studentEmail == null || studentEmail.isBlank()) {
            throw new RuntimeException("Student email is required");
        }
		
//		Validating the feign client 
		try {
			 jobServiceClient.getJobById(dto.getJobId(), studentEmail, "STUDENT");
		}catch(FeignClientException.NotFound e) {
			throw new RuntimeException("Job not found with id :"+dto.getJobId());
		}
		catch(FeignException e) {
			throw new RuntimeException("Job Validation failed:"+e.getMessage());
		}catch(Exception e) {
			throw new RuntimeException("Unable to communicate with Job Service :" + e.getMessage());
		}
		
//		Preventing dulpication by not allowing the same student to apply for same job multiple times
		if (applicationRepository.existsByJobIdAndStudentEmail(dto.getJobId(), studentEmail)) {
            throw new RuntimeException("You have already applied for this job.");
        }
		
		Application application = modelMapper.map(dto, Application.class);
		 application.setStudentEmail(studentEmail);
	        application.setStatus(ApplicationStatus.PENDING);
	        application.setAppliedDate(LocalDate.now());
		Application submittedApplication = applicationRepository.save(application);
		return modelMapper.map(submittedApplication , ApplicationDto.class);
		
	}

	@Override
	public List<ApplicationDto> getApplicationsForStudent(String studentEmail) {
		if(studentEmail==null || studentEmail.isBlank()) {
			throw new RuntimeException("Student email is required");
		}
		return applicationRepository.findByStudentEmail(studentEmail).stream()
                .map(app -> modelMapper.map(app, ApplicationDto.class))
                .collect(Collectors.toList());
	}

	@Override
    public List<ApplicationDto> getApplicationsForJob(Long jobId) {
        return applicationRepository.findByJobId(jobId).stream()
                .map(app -> modelMapper.map(app, ApplicationDto.class))
                .collect(Collectors.toList());
    }

	@Override
	public ApplicationDto updateApplicationStatus(Long id, ApplicationStatus status, UserRole userRole) {
		if(status == null) {
			throw new RuntimeException("Application status is required");
			
		}
		
		Application application = applicationRepository.findById(id).orElseThrow(()-> 
		new RuntimeException("Appication not found with Id : "+ id) );
		
		application.setStatus(status);
		Application updatedApplication=applicationRepository.save(application);
		
		
		return modelMapper.map(updatedApplication,ApplicationDto.class);
	}

	@Override
	public void deleteApplication(Long id) {
		Application application = applicationRepository.findById(id).orElseThrow(() -> 
		new RuntimeException("Application not found with Id : " + id));
		applicationRepository.delete(application);
	}
}
