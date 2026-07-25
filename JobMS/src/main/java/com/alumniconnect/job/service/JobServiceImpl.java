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
	

	@Override
	public JobDto create(JobDto jobDto, String userEmail,UserRole userRole) {
		Job job = modelMapper.map(jobDto,Job.class);
		
		job.setPostedByEmail(userEmail);
		job.setPostedDate(LocalDate.now());
		job.setUserRole(userRole);
		Job savedJob = jobRepository.save(job);
		
		return modelMapper.map(savedJob,JobDto.class);
	}

	@Override
	public List<JobDto> getAllJobs() {
		return jobRepository.findAll().stream()
				.map(job->modelMapper.map(job, JobDto.class))
				.collect(Collectors.toList());
	}

	@Override
	public JobDto getJobById(Long id) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public JobDto updateJob(Long id, JobDto jobDto, String email, UserRole userRole) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public void delete(Long id, String userEmail, UserRole userRole) {
		// TODO Auto-generated method stub
		
	}

}
