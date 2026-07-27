package com.alumniconnect.template.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.alumniconnect.template.dto.ReferralRequestDto;
import com.alumniconnect.template.entity.ReferralRequest;
import com.alumniconnect.template.service.ReferralService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/referrals")
public class ReferralController {

    private final ReferralService referralService;

    public ReferralController(ReferralService referralService) {
        this.referralService = referralService;
    }

    // ===========================
    // Create Referral
    // ===========================
    @PostMapping
    public ReferralRequestDto createReferral(
            @Valid @RequestBody ReferralRequestDto dto) {

        return referralService.saveReferral(dto);
    }

    // ===========================
    // Update Referral
    // ===========================
    @PutMapping("/{id}")
    public ReferralRequestDto updateReferral(
            @PathVariable Long id,
            @Valid @RequestBody ReferralRequestDto dto) {

        return referralService.updateReferral(id, dto);
    }

    // ===========================
    // Approve Referral
    // ===========================
    @PutMapping("/{id}/approve")
    public ReferralRequest approveReferral(@PathVariable Long id) {

        return referralService.approveReferral(id);
    }

    // ===========================
    // Reject Referral
    // ===========================
    @PutMapping("/{id}/reject")
    public ReferralRequest rejectReferral(@PathVariable Long id) {

        return referralService.rejectReferral(id);
    }

    // ===========================
    // Get Student Details (Feign)
    // ===========================
    @GetMapping("/student-details/{id}")
    public Object getStudentDetails(@PathVariable Long id) {

        return referralService.getStudentDetails(id);
    }

    // ===========================
    // Get Student Referrals
    // ===========================
    @GetMapping("/student/{studentId}")
    public List<ReferralRequest> getStudentReferrals(
            @PathVariable Long studentId) {

        return referralService.getStudentReferrals(studentId);
    }

    // ===========================
    // Get Alumni Referrals
    // ===========================
    @GetMapping("/alumni/{alumniId}")
    public List<ReferralRequest> getAlumniReferrals(
            @PathVariable Long alumniId) {

        return referralService.getAlumniReferrals(alumniId);
    }

    // ===========================
    // Get Pending Referrals
    // ===========================
    @GetMapping("/pending")
    public List<ReferralRequest> getPendingReferrals() {

        return referralService.getPendingReferrals();
    }

    // ===========================
    // Get All Referrals
    // ===========================
    @GetMapping
    public List<ReferralRequest> getAllReferrals() {

        return referralService.getAllReferrals();
    }

    // ===========================
    // Get Referral By Id
    // ===========================
    @GetMapping("/{id}")
    public ReferralRequest getReferralById(
            @PathVariable Long id) {

        return referralService.getReferralById(id);
    }

    // ===========================
    // Delete Referral
    // ===========================
    @DeleteMapping("/{id}")
    public void deleteReferral(
            @PathVariable Long id) {

        referralService.deleteReferral(id);
    }
}