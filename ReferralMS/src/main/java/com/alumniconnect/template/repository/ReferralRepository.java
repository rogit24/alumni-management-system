package com.alumniconnect.template.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.alumniconnect.template.entity.ReferralRequest;
import com.alumniconnect.template.enums.ReferralStatus;

@Repository
public interface ReferralRepository extends JpaRepository<ReferralRequest, Long> {

    // Get all referrals of a student
    List<ReferralRequest> findByStudentId(Long studentId);

    // Get all referrals assigned to an alumni
    List<ReferralRequest> findByAlumniId(Long alumniId);

    // Get referrals by status (PENDING, APPROVED, REJECTED)
    List<ReferralRequest> findByStatus(ReferralStatus status);

    // Get referrals for a specific student with a specific status
    List<ReferralRequest> findByStudentIdAndStatus(Long studentId, ReferralStatus status);

    // Get referrals for a specific alumni with a specific status
    List<ReferralRequest> findByAlumniIdAndStatus(Long alumniId, ReferralStatus status);
}