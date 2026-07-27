package com.alumniconnect.profileservice.controller;

import com.alumniconnect.profileservice.dto.ProfileDto;
import com.alumniconnect.profileservice.service.ProfileService;
import com.alumniconnect.profileservice.util.SecurityContextUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/profiles")
public class ProfileController {

    private final ProfileService profileService;
    private final SecurityContextUtil securityContextUtil;

    public ProfileController(ProfileService profileService, SecurityContextUtil securityContextUtil) {
        this.profileService = profileService;
        this.securityContextUtil = securityContextUtil;
    }

    @PostMapping
    public ResponseEntity<ProfileDto> createProfile(
            @Valid @RequestBody ProfileDto profileDto,
            HttpServletRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestHeader(value = "X-User-Email", required = false) String headerUserEmail,
            @RequestHeader(value = "X-User-Role", required = false) String headerUserRole) {

        SecurityContextUtil.UserSecurityDetails userDetails =
                securityContextUtil.extractUserSecurityDetails(request, headerUserId, headerUserEmail, headerUserRole);

        ProfileDto createdProfile = profileService.createProfile(
                profileDto, userDetails.getUserId(), userDetails.getEmail(), userDetails.getRole());
        return ResponseEntity.status(HttpStatus.CREATED).body(createdProfile);
    }

    @GetMapping("/me")
    public ResponseEntity<ProfileDto> getMyProfile(
            HttpServletRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestHeader(value = "X-User-Email", required = false) String headerUserEmail,
            @RequestHeader(value = "X-User-Role", required = false) String headerUserRole) {

        SecurityContextUtil.UserSecurityDetails userDetails =
                securityContextUtil.extractUserSecurityDetails(request, headerUserId, headerUserEmail, headerUserRole);

        ProfileDto profileDto = profileService.getProfileByUserId(userDetails.getUserId());
        return ResponseEntity.ok(profileDto);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProfileDto> getProfileById(@PathVariable("id") Long id) {
        ProfileDto profileDto = profileService.getProfileById(id);
        return ResponseEntity.ok(profileDto);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ProfileDto> getProfileByUserId(@PathVariable("userId") Long userId) {
        ProfileDto profileDto = profileService.getProfileByUserId(userId);
        return ResponseEntity.ok(profileDto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProfileDto> updateProfile(
            @PathVariable("id") Long id,
            @Valid @RequestBody ProfileDto profileDto,
            HttpServletRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestHeader(value = "X-User-Email", required = false) String headerUserEmail,
            @RequestHeader(value = "X-User-Role", required = false) String headerUserRole) {

        SecurityContextUtil.UserSecurityDetails userDetails =
                securityContextUtil.extractUserSecurityDetails(request, headerUserId, headerUserEmail, headerUserRole);

        ProfileDto updatedProfile = profileService.updateProfile(
                id, profileDto, userDetails.getUserId(), userDetails.getEmail(), userDetails.getRole());
        return ResponseEntity.ok(updatedProfile);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteProfile(
            @PathVariable("id") Long id,
            HttpServletRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestHeader(value = "X-User-Email", required = false) String headerUserEmail,
            @RequestHeader(value = "X-User-Role", required = false) String headerUserRole) {

        SecurityContextUtil.UserSecurityDetails userDetails =
                securityContextUtil.extractUserSecurityDetails(request, headerUserId, headerUserEmail, headerUserRole);

        profileService.deleteProfile(
                id, userDetails.getUserId(), userDetails.getEmail(), userDetails.getRole());
        return ResponseEntity.ok("Profile deleted successfully with ID: " + id);
    }
}
