package com.alumniconnect.dto.profile;

import lombok.Data;

@Data
public class ProfileRequest {
    private String bio;
    private String skills;
    private String company;
    private String location;
}
