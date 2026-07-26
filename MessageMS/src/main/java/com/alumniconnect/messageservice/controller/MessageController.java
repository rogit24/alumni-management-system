package com.alumniconnect.messageservice.controller;

import com.alumniconnect.messageservice.dto.MessageDto;
import com.alumniconnect.messageservice.service.MessageService;
import com.alumniconnect.messageservice.util.SecurityContextUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/messages")
public class MessageController {

    private final MessageService messageService;
    private final SecurityContextUtil securityContextUtil;

    public MessageController(MessageService messageService, SecurityContextUtil securityContextUtil) {
        this.messageService = messageService;
        this.securityContextUtil = securityContextUtil;
    }

    @PostMapping
    public ResponseEntity<MessageDto> sendMessage(
            @Valid @RequestBody MessageDto messageDto,
            HttpServletRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestHeader(value = "X-User-Email", required = false) String headerUserEmail,
            @RequestHeader(value = "X-User-Role", required = false) String headerUserRole) {

        SecurityContextUtil.UserSecurityDetails userDetails =
                securityContextUtil.extractUserSecurityDetails(request, headerUserId, headerUserEmail, headerUserRole);

        MessageDto sentMessage = messageService.sendMessage(
                messageDto, userDetails.getUserId(), userDetails.getEmail(), userDetails.getRole());
        return ResponseEntity.status(HttpStatus.CREATED).body(sentMessage);
    }

    @GetMapping("/inbox/me")
    public ResponseEntity<List<MessageDto>> getMyInbox(
            HttpServletRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestHeader(value = "X-User-Email", required = false) String headerUserEmail,
            @RequestHeader(value = "X-User-Role", required = false) String headerUserRole) {

        SecurityContextUtil.UserSecurityDetails userDetails =
                securityContextUtil.extractUserSecurityDetails(request, headerUserId, headerUserEmail, headerUserRole);

        List<MessageDto> inbox = messageService.getInbox(
                userDetails.getUserId(), userDetails.getUserId(), userDetails.getEmail(), userDetails.getRole());
        return ResponseEntity.ok(inbox);
    }

    @GetMapping("/inbox/{userId}")
    public ResponseEntity<List<MessageDto>> getInbox(
            @PathVariable("userId") Long targetUserId,
            HttpServletRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestHeader(value = "X-User-Email", required = false) String headerUserEmail,
            @RequestHeader(value = "X-User-Role", required = false) String headerUserRole) {

        SecurityContextUtil.UserSecurityDetails userDetails =
                securityContextUtil.extractUserSecurityDetails(request, headerUserId, headerUserEmail, headerUserRole);

        List<MessageDto> inbox = messageService.getInbox(
                targetUserId, userDetails.getUserId(), userDetails.getEmail(), userDetails.getRole());
        return ResponseEntity.ok(inbox);
    }

    @GetMapping("/conversation/{otherUserId}")
    public ResponseEntity<List<MessageDto>> getConversation(
            @PathVariable("otherUserId") Long otherUserId,
            HttpServletRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestHeader(value = "X-User-Email", required = false) String headerUserEmail,
            @RequestHeader(value = "X-User-Role", required = false) String headerUserRole) {

        SecurityContextUtil.UserSecurityDetails userDetails =
                securityContextUtil.extractUserSecurityDetails(request, headerUserId, headerUserEmail, headerUserRole);

        List<MessageDto> conversation = messageService.getConversation(
                otherUserId, userDetails.getUserId(), userDetails.getEmail(), userDetails.getRole());
        return ResponseEntity.ok(conversation);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<MessageDto> markAsRead(
            @PathVariable("id") Long id,
            HttpServletRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestHeader(value = "X-User-Email", required = false) String headerUserEmail,
            @RequestHeader(value = "X-User-Role", required = false) String headerUserRole) {

        SecurityContextUtil.UserSecurityDetails userDetails =
                securityContextUtil.extractUserSecurityDetails(request, headerUserId, headerUserEmail, headerUserRole);

        MessageDto updatedMessage = messageService.markAsRead(
                id, userDetails.getUserId(), userDetails.getEmail(), userDetails.getRole());
        return ResponseEntity.ok(updatedMessage);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteMessage(
            @PathVariable("id") Long id,
            HttpServletRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestHeader(value = "X-User-Email", required = false) String headerUserEmail,
            @RequestHeader(value = "X-User-Role", required = false) String headerUserRole) {

        SecurityContextUtil.UserSecurityDetails userDetails =
                securityContextUtil.extractUserSecurityDetails(request, headerUserId, headerUserEmail, headerUserRole);

        messageService.deleteMessage(
                id, userDetails.getUserId(), userDetails.getEmail(), userDetails.getRole());
        return ResponseEntity.ok("Message deleted successfully with ID: " + id);
    }
}
