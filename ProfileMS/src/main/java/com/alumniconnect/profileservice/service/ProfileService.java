package com.alumniconnect.profileservice.service;

import com.alumniconnect.profileservice.dto.ProfileDto;

public interface ProfileService {
    ProfileDto createProfile(ProfileDto profileDto, Long loggedInUserId, String userEmail, String userRole);
    ProfileDto getProfileById(Long id);
    ProfileDto getProfileByUserId(Long userId);
    ProfileDto updateProfile(Long id, ProfileDto profileDto, Long loggedInUserId, String userEmail, String userRole);
    void deleteProfile(Long id, Long loggedInUserId, String userEmail, String userRole);
}
