package com.alumniconnect.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Data;

@Entity
@Data
public class Profile {
    @Id
    private Long id;
    private String bio;
    private String skills;
    private String company;
    private String location;
}
