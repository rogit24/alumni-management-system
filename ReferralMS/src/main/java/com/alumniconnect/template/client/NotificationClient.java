package com.alumniconnect.template.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.alumniconnect.template.dto.NotificationDto;

@FeignClient(name = "NOTIFICATION-SERVICE")
public interface NotificationClient {

    @PostMapping("/api/v1/notifications")
    NotificationDto createNotification(@RequestBody NotificationDto notificationDto);

}