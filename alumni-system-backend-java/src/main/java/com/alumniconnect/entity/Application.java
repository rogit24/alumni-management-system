package com.alumniconnect.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Data;

@Entity
@Data
public class Application {
    @Id
    private Long id;
    private String status;
    private String appliedDate;
}
