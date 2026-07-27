package com.alumniconnect.notification.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.alumniconnect.notification.dto.NotificationDto;
import com.alumniconnect.notification.entity.Notification;
import com.alumniconnect.notification.service.NotificationService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    // Create Notification
    @PostMapping
    public NotificationDto createNotification(
            @Valid @RequestBody NotificationDto dto) {

        return notificationService.createNotification(dto);
    }

    // Get All Notifications
    @GetMapping
    public List<Notification> getAllNotifications() {

        return notificationService.getAllNotifications();
    }

    // Get Notification By Id
    @GetMapping("/{id}")
    public Notification getNotificationById(
            @PathVariable Long id) {

        return notificationService.getNotificationById(id);
    }

    // Get Notifications of User
    @GetMapping("/user/{userId}")
    public List<Notification> getUserNotifications(
            @PathVariable Long userId) {

        return notificationService.getUserNotifications(userId);
    }

    // Get Read/Unread Notifications
    @GetMapping("/status/{isRead}")
    public List<Notification> getNotificationsByReadStatus(
            @PathVariable Boolean isRead) {

        return notificationService.getNotificationsByReadStatus(isRead);
    }

    // Mark Notification As Read
    @PutMapping("/{id}/read")
    public Notification markAsRead(
            @PathVariable Long id) {

        return notificationService.markAsRead(id);
    }

    // Delete Notification
    @DeleteMapping("/{id}")
    public void deleteNotification(
            @PathVariable Long id) {

        notificationService.deleteNotification(id);
    }
}