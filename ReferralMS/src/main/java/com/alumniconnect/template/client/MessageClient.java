package com.alumniconnect.template.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

import com.alumniconnect.template.dto.MessageDto;

@FeignClient(
        name = "MESSAGE-SERVICE",
        path = "/api/v1/messages"
)
public interface MessageClient {

    @PostMapping
    MessageDto sendMessage(
            @RequestBody MessageDto messageDto,
            @RequestHeader("X-User-Id") String headerUserId,
            @RequestHeader("X-User-Email") String headerUserEmail,
            @RequestHeader("X-User-Role") String headerUserRole
    );
}
