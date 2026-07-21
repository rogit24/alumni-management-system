package com.alumniconnect.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Data;

@Entity
@Data
public class ReferralRequest {
    @Id
    private Long id;
    private String company;
    private String status;
    private String requestDate;
}
