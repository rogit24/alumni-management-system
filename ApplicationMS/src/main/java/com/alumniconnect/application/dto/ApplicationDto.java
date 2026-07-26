package com.alumniconnect.application.dto;


import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

import com.alumniconnect.application.entity.ApplicationStatus;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicationDto {

    private Long id;

    @NotNull(message = "Job ID is required")
    private Long jobId;

    private String studentEmail;

    private ApplicationStatus status;

    private LocalDate appliedDate;
}