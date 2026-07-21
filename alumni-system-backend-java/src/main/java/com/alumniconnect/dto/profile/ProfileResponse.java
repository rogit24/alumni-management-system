package com.alumniconnect.dto.profile;

import lombok.Data;

@Data
public class ProfileResponse {
    private String name;
    private String email;
    private String bio;
    private String skills;
    private String company;
    private String location;
}
