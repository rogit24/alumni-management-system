package com.alumniconnect.profileservice.service;

import com.alumniconnect.profileservice.dto.ProfileDto;
import java.util.List;

public interface ProfileService {
    ProfileDto createProfile(ProfileDto profileDto, Long loggedInUserId, String userEmail, String userRole);
    ProfileDto getProfileById(Long id);
    ProfileDto getProfileByUserId(Long userId);
    List<ProfileDto> getAllProfiles();
    ProfileDto updateProfile(Long id, ProfileDto profileDto, Long loggedInUserId, String userEmail, String userRole);
    void deleteProfile(Long id, Long loggedInUserId, String userEmail, String userRole);
}

