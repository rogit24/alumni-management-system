package com.alumniconnect.template.entity;

import com.alumniconnect.template.enums.ReferralStatus;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;

@Entity
@Data
public class ReferralRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long studentId;

    private Long alumniId;

    private String company;

    private String jobRole;

    private String message;

    @Enumerated(EnumType.STRING)
    private ReferralStatus status;

    private String requestDate;
}