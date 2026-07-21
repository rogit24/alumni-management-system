package com.alumniconnect.repository;

import com.alumniconnect.entity.ReferralRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReferralRepository extends JpaRepository<ReferralRequest, Long> {
}
