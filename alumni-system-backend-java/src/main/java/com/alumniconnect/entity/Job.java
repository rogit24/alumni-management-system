package com.alumniconnect.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Data;

@Entity
@Data
public class Job {
    @Id
    private Long id;
    private String title;
    private String company;
    private String salary;
    private String location;
    private String description;
}
