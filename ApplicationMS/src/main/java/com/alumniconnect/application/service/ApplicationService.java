package com.alumniconnect.application.service;

import java.util.List;

import com.alumniconnect.application.dto.ApplicationDto;
import com.alumniconnect.application.entity.ApplicationStatus;
import com.alumniconnect.application.entity.UserRole;

public interface ApplicationService {

	ApplicationDto submitApplication(ApplicationDto dto, String studentEmail);

    List<ApplicationDto> getApplicationsForStudent(String studentEmail);

    List<ApplicationDto> getApplicationsForJob(Long jobId);

    ApplicationDto updateApplicationStatus(Long id, ApplicationStatus status, UserRole userRole);
}
