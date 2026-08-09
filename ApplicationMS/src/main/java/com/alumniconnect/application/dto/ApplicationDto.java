package com.alumniconnect.application.dto;


import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

import com.alumniconnect.application.entity.ApplicationStatus;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicationDto {
    
	@JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long id;

    @NotNull(message = "Job ID is required")
    private Long jobId;

    private String studentEmail;

    private ApplicationStatus status;

    private LocalDate appliedDate;
}