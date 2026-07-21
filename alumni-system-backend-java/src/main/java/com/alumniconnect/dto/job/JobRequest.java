package com.alumniconnect.dto.job;

import lombok.Data;

@Data
public class JobRequest {
    private String title;
    private String company;
    private String salary;
    private String location;
    private String description;
}
