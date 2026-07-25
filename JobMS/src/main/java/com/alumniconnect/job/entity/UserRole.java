package com.alumniconnect.job.entity;

public enum UserRole {
    STUDENT,
    ALUMNI,
    ADMIN;
	

    public static UserRole fromString(String role) {
        if (role == null) {
            return null;
        }
        for (UserRole r : UserRole.values()) {
            if (r.name().equalsIgnoreCase(role)) {
                return r;
            }
        }
        throw new IllegalArgumentException("Unknown role: " + role);
    }
}
