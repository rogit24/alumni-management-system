package com.alumniconnect.job.service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.alumniconnect.job.dto.JobDto;
import com.alumniconnect.job.entity.Job;
import com.alumniconnect.job.entity.UserRole;
import com.alumniconnect.job.repository.JobRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;


@Service
@Transactional
@RequiredArgsConstructor
public class JobServiceImpl implements JobService {
	
	private final JobRepository jobRepository;
	
	
	private final ModelMapper modelMapper;
	
//creating a new job
	@Override
	public JobDto create(JobDto jobDto, String userEmail,UserRole userRole) {
		Job job = modelMapper.map(jobDto,Job.class);
		
		job.setPostedByEmail(userEmail);
		job.setPostedDate(LocalDate.now());
		job.setUserRole(userRole);
		Job savedJob = jobRepository.save(job);
		
		return modelMapper.map(savedJob,JobDto.class);
	}

//	fetching all Jobs
	@Override
	public List<JobDto> getAllJobs() {
		return jobRepository.findAll().stream()
				.map(job->modelMapper.map(job, JobDto.class))
				.collect(Collectors.toList());
	}

//	fetching only one needed job
	@Override
	public JobDto getJobById(Long id) {
		Job job = jobRepository.findById(id).
				orElseThrow(()-> new RuntimeException("Job not found of id:"+id));
		
		return modelMapper.map(job, JobDto.class);
	}
//updating a job posted based on id 
	@Override
	public JobDto updateJob(Long id, JobDto jobDto, String userEmail, UserRole userRole) {
		Job job = jobRepository.findById(id).orElseThrow(()-> new RuntimeException("User id not found:"+id));
		if (userRole != UserRole.ADMIN && (job.getPostedByEmail() == null || !job.getPostedByEmail().equals(userEmail))) {
            throw new RuntimeException("Access denied: You are not authorized to update this job");
        }
		
		job.setTitle(jobDto.getTitle());
        job.setCompany(jobDto.getCompany());
        job.setSalary(jobDto.getSalary());
        job.setLocation(jobDto.getLocation());
        job.setDescription(jobDto.getDescription());
        
        Job updatedJob = jobRepository.save(job);
        return modelMapper.map(updatedJob, JobDto.class);
	}
	
//delete a job based on id
	@Override
	public void delete(Long id, String userEmail, UserRole userRole) {
		Job job = jobRepository.findById(id).orElseThrow(()-> new RuntimeException("User id not found:"+id));
		
		if (userRole != UserRole.ADMIN && (job.getPostedByEmail() == null || !job.getPostedByEmail().equals(userEmail))) {
            throw new RuntimeException("Access denied: You are not authorized to update this job");
        }
		
		jobRepository.delete(job);
	}

}
