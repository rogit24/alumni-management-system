package com.alumniconnect.notification.dto;

import com.alumniconnect.notification.enums.NotificationType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class NotificationDto {

    @NotNull(message = "User Id is required")
    private Long userId;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Message is required")
    private String message;

    @NotNull(message = "Notification Type is required")
    private NotificationType type;

    private Boolean isRead = false;

    private String createdAt;
}