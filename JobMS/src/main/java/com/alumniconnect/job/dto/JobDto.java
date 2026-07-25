package com.alumniconnect.job.dto;

import com.alumniconnect.job.entity.UserRole;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobDto {
	
	private Long id;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Company is required")
    private String company;

    private String salary;

    private String location;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    private String postedByEmail;

    private UserRole userRole;
}
