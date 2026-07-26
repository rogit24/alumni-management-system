package com.alumniconnect.job.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "jobs")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String company;

    private double salary;

    @Column(length = 100)
    private String location;

    @Column(length = 1000)
    private String description;

    @Column(name = "posted_by_email")
    private String postedByEmail;

    @Enumerated(EnumType.STRING)
    @Column(name = "job_type")
    private Jobtype jobType;

    @Column(name = "posted_date")
    private LocalDate postedDate;

    @Enumerated(EnumType.STRING)
    private UserRole userRole;
}
