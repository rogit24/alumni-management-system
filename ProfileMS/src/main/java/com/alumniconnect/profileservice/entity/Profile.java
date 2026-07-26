package com.alumniconnect.profileservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "profiles", uniqueConstraints = {@UniqueConstraint(name = "uk_profiles_user_id", columnNames = {"user_id"})})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Profile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "phone")
    private String phone;

    @Column(name = "profile_picture", length = 500)
    private String profilePicture;

    @Column(name = "bio", columnDefinition = "TEXT")
    private String bio;

    @Column(name = "skills", columnDefinition = "TEXT")
    private String skills;

    @Column(name = "education")
    private String education;

    @Column(name = "graduation_year")
    private Integer graduationYear;

    @Column(name = "current_company")
    private String currentCompany;

    @Column(name = "designation")
    private String designation;

    @Column(name = "location")
    private String location;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

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

    public static ProfileBuilder builder() { return new ProfileBuilder(); }

    public static class ProfileBuilder {
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

        public ProfileBuilder id(Long id) { this.id = id; return this; }
        public ProfileBuilder userId(Long userId) { this.userId = userId; return this; }
        public ProfileBuilder fullName(String fullName) { this.fullName = fullName; return this; }
        public ProfileBuilder email(String email) { this.email = email; return this; }
        public ProfileBuilder phone(String phone) { this.phone = phone; return this; }
        public ProfileBuilder profilePicture(String profilePicture) { this.profilePicture = profilePicture; return this; }
        public ProfileBuilder bio(String bio) { this.bio = bio; return this; }
        public ProfileBuilder skills(String skills) { this.skills = skills; return this; }
        public ProfileBuilder education(String education) { this.education = education; return this; }
        public ProfileBuilder graduationYear(Integer graduationYear) { this.graduationYear = graduationYear; return this; }
        public ProfileBuilder currentCompany(String currentCompany) { this.currentCompany = currentCompany; return this; }
        public ProfileBuilder designation(String designation) { this.designation = designation; return this; }
        public ProfileBuilder location(String location) { this.location = location; return this; }
        public ProfileBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public ProfileBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public Profile build() {
            Profile p = new Profile();
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
