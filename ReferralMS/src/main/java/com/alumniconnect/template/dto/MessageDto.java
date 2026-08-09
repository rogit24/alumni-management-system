package com.alumniconnect.template.dto;

import lombok.Data;

@Data
public class MessageDto {
    private Long id;
    private Long senderId;
    private Long receiverId;
    private String senderEmail;
    private String receiverEmail;
    private String messageContent;
    private String sentAt;
    private Boolean readStatus;
}
