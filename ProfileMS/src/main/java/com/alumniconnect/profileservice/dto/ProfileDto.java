package com.alumniconnect.profileservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileDto {

    @Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "Auto-generated profile ID")
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long id;

    @Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "System-assigned authenticated User ID")
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long userId;

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    private String phone;
    private String profilePicture;
    private String bio;
    private String skills;
    private String education;
    private Integer graduationYear;
    private String currentCompany;
    private String designation;
    private String location;

    @Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "Timestamp of profile creation")
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private LocalDateTime createdAt;

    @Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "Timestamp of last profile update")
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getProfilePicture() { return profilePicture; }
    public void setProfilePicture(String profilePicture) { this.profilePicture = profilePicture; }
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    public String getSkills() { return skills; }
    public void setSkills(String skills) { this.skills = skills; }
    public String getEducation() { return education; }
    public void setEducation(String education) { this.education = education; }
    public Integer getGraduationYear() { return graduationYear; }
    public void setGraduationYear(Integer graduationYear) { this.graduationYear = graduationYear; }
    public String getCurrentCompany() { return currentCompany; }
    public void setCurrentCompany(String currentCompany) { this.currentCompany = currentCompany; }
    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static ProfileDtoBuilder builder() { return new ProfileDtoBuilder(); }

    public static class ProfileDtoBuilder {
        private Long id;
        private Long userId;
        private String fullName;
        private String email;
        private String phone;
        private String profilePicture;
        private String bio;
        private String skills;
        private String education;
        private Integer graduationYear;
        private String currentCompany;
        private String designation;
        private String location;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public ProfileDtoBuilder id(Long id) { this.id = id; return this; }
        public ProfileDtoBuilder userId(Long userId) { this.userId = userId; return this; }
        public ProfileDtoBuilder fullName(String fullName) { this.fullName = fullName; return this; }
        public ProfileDtoBuilder email(String email) { this.email = email; return this; }
        public ProfileDtoBuilder phone(String phone) { this.phone = phone; return this; }
        public ProfileDtoBuilder profilePicture(String profilePicture) { this.profilePicture = profilePicture; return this; }
        public ProfileDtoBuilder bio(String bio) { this.bio = bio; return this; }
        public ProfileDtoBuilder skills(String skills) { this.skills = skills; return this; }
        public ProfileDtoBuilder education(String education) { this.education = education; return this; }
        public ProfileDtoBuilder graduationYear(Integer graduationYear) { this.graduationYear = graduationYear; return this; }
        public ProfileDtoBuilder currentCompany(String currentCompany) { this.currentCompany = currentCompany; return this; }
        public ProfileDtoBuilder designation(String designation) { this.designation = designation; return this; }
        public ProfileDtoBuilder location(String location) { this.location = location; return this; }
        public ProfileDtoBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public ProfileDtoBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public ProfileDto build() {
            ProfileDto p = new ProfileDto();
            p.setId(this.id);
            p.setUserId(this.userId);
            p.setFullName(this.fullName);
            p.setEmail(this.email);
            p.setPhone(this.phone);
            p.setProfilePicture(this.profilePicture);
            p.setBio(this.bio);
            p.setSkills(this.skills);
            p.setEducation(this.education);
            p.setGraduationYear(this.graduationYear);
            p.setCurrentCompany(this.currentCompany);
            p.setDesignation(this.designation);
            p.setLocation(this.location);
            p.setCreatedAt(this.createdAt);
            p.setUpdatedAt(this.updatedAt);
            return p;
        }
    }
}
