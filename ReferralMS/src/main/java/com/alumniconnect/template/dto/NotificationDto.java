package com.alumniconnect.template.dto;

import lombok.Data;

@Data
public class NotificationDto {

    private Long userId;

    private String title;

    private String message;

    private String type;

    private Boolean isRead;

    private String createdAt;

}