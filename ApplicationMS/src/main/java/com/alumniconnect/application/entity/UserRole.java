package com.alumniconnect.application.entity;

public enum UserRole {
ALUMNI,ADMIN,STUDENT;
	
	public static UserRole fromString(String userRole) {
		if(userRole == null) {
			return null;
		}
		for(UserRole r : UserRole.values() ) {
			if(r.name().equalsIgnoreCase(userRole)) {
				return r;
			}
		}
		throw new IllegalArgumentException("Unknown role: " + userRole);
	}
}
