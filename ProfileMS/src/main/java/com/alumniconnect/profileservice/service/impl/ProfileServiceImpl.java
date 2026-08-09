package com.alumniconnect.profileservice.service.impl;

import com.alumniconnect.profileservice.dto.ProfileDto;
import com.alumniconnect.profileservice.entity.Profile;
import com.alumniconnect.profileservice.exception.AccessDeniedException;
import com.alumniconnect.profileservice.exception.ProfileAlreadyExistsException;
import com.alumniconnect.profileservice.exception.ResourceNotFoundException;
import com.alumniconnect.profileservice.repository.ProfileRepository;
import com.alumniconnect.profileservice.service.ProfileService;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProfileServiceImpl implements ProfileService {

    private final ProfileRepository profileRepository;
    private final ModelMapper modelMapper;

    public ProfileServiceImpl(ProfileRepository profileRepository, ModelMapper modelMapper) {
        this.profileRepository = profileRepository;
        this.modelMapper = modelMapper;
    }

    @Override
    public ProfileDto createProfile(ProfileDto profileDto, Long loggedInUserId, String userEmail, String userRole) {
        if (profileRepository.existsByUserId(loggedInUserId)) {
            throw new ProfileAlreadyExistsException("Profile already exists for this user");
        }
        if (profileRepository.existsByEmail(profileDto.getEmail())) {
            throw new ProfileAlreadyExistsException("Profile already exists for email: " + profileDto.getEmail());
        }

        Profile profile = modelMapper.map(profileDto, Profile.class);
        profile.setUserId(loggedInUserId);

        Profile savedProfile = profileRepository.save(profile);
        return modelMapper.map(savedProfile, ProfileDto.class);
    }

    @Override
    public ProfileDto getProfileById(Long id) {
        Profile profile = profileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found with ID: " + id));
        return modelMapper.map(profile, ProfileDto.class);
    }

    @Override
    public ProfileDto getProfileByUserId(Long userId) {
        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for user ID: " + userId));
        return modelMapper.map(profile, ProfileDto.class);
    }

    @Override
    public ProfileDto updateProfile(Long id, ProfileDto profileDto, Long loggedInUserId, String userEmail, String userRole) {
        Profile existingProfile = profileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found with ID: " + id));

        // Authorization check: NON-ADMIN users can only update their own profile
        if (!"ADMIN".equalsIgnoreCase(userRole) && !existingProfile.getUserId().equals(loggedInUserId)) {
            throw new AccessDeniedException("Access denied: You can only update your own profile.");
        }

        existingProfile.setFullName(profileDto.getFullName());
        existingProfile.setEmail(profileDto.getEmail());
        existingProfile.setPhone(profileDto.getPhone());
        existingProfile.setProfilePicture(profileDto.getProfilePicture());
        existingProfile.setResume(profileDto.getResume());
        existingProfile.setBio(profileDto.getBio());
        existingProfile.setSkills(profileDto.getSkills());
        existingProfile.setEducation(profileDto.getEducation());
        existingProfile.setGraduationYear(profileDto.getGraduationYear());
        existingProfile.setCurrentCompany(profileDto.getCurrentCompany());
        existingProfile.setDesignation(profileDto.getDesignation());
        existingProfile.setLocation(profileDto.getLocation());

        Profile updatedProfile = profileRepository.save(existingProfile);
        return modelMapper.map(updatedProfile, ProfileDto.class);
    }

    @Override
    public void deleteProfile(Long id, Long loggedInUserId, String userEmail, String userRole) {
        Profile existingProfile = profileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found with ID: " + id));

        // Authorization check: NON-ADMIN users can only delete their own profile
        if (!"ADMIN".equalsIgnoreCase(userRole) && !existingProfile.getUserId().equals(loggedInUserId)) {
            throw new AccessDeniedException("Access denied: You can only delete your own profile.");
        }

        profileRepository.delete(existingProfile);
    }

    @Override
    public List<ProfileDto> getAllProfiles() {
        return profileRepository.findAll().stream()
                .map(profile -> modelMapper.map(profile, ProfileDto.class))
                .collect(Collectors.toList());
    }
}

