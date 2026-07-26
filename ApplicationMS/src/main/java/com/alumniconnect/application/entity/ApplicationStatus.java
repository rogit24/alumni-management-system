package com.alumniconnect.application.entity;

public enum ApplicationStatus {

	ACCEPTED,PENDING,REJECTED,REVIEWED;
	
	public static ApplicationStatus fromString(String status) {
		if(status == null) {
			return PENDING;
		}
		for(ApplicationStatus s : ApplicationStatus.values()) {
			if(s.name().equalsIgnoreCase(status)) {
				return s;
			}
		}
		throw new IllegalArgumentException("Invalid application status: " + status + " Allowed values: PENDING, REVIEWED, ACCEPTED, REJECTED");
	}
}
