package com.alumniconnect.template.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReferralRequestDto {

    private Long id;

    @NotNull(message = "Student Id is required")
    private Long studentId;

    @NotNull(message = "Alumni Id is required")
    private Long alumniId;

    @NotBlank(message = "Company name is required")
    private String company;

    @NotBlank(message = "Job Role is required")
    private String jobRole;

    @NotBlank(message = "Message is required")
    private String message;

    @NotBlank(message = "Request Date is required")
    private String requestDate;
}