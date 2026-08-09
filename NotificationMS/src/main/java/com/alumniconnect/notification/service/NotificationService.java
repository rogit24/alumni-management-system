package com.alumniconnect.notification.service;

import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import com.alumniconnect.notification.dto.NotificationDto;
import com.alumniconnect.notification.entity.Notification;
import com.alumniconnect.notification.exception.ResourceNotFoundException;
import com.alumniconnect.notification.repository.NotificationRepository;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final ModelMapper modelMapper;

    public NotificationService(NotificationRepository notificationRepository,
                               ModelMapper modelMapper) {
        this.notificationRepository = notificationRepository;
        this.modelMapper = modelMapper;
    }

    // Create Notification
    public NotificationDto createNotification(NotificationDto dto) {

        Notification notification =
                modelMapper.map(dto, Notification.class);

        Notification saved =
                notificationRepository.save(notification);

        return modelMapper.map(saved, NotificationDto.class);
    }

    // Get All Notifications
    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }

    // Get Notification By Id
    public Notification getNotificationById(Long id) {

        return notificationRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Notification not found with id : " + id));
    }

    // Get Notifications of Particular User
    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserId(userId);
    }

    // Get Read/Unread Notifications
    public List<Notification> getNotificationsByReadStatus(Boolean isRead) {
        return notificationRepository.findByIsRead(isRead);
    }

    // Mark Notification as Read
    public Notification markAsRead(Long id) {

        Notification notification = getNotificationById(id);

        notification.setIsRead(true);

        return notificationRepository.save(notification);
    }

    // Delete Notification
    public void deleteNotification(Long id) {

        Notification notification = getNotificationById(id);

        notificationRepository.delete(notification);
    }
}