package com.alumniconnect.messageservice.service;

import com.alumniconnect.messageservice.dto.MessageDto;

import java.util.List;

public interface MessageService {
    MessageDto sendMessage(MessageDto messageDto, Long loggedInUserId, String userEmail, String userRole);
    List<MessageDto> getConversation(Long otherUserId, Long loggedInUserId, String userEmail, String userRole);
    List<MessageDto> getInbox(Long targetUserId, Long loggedInUserId, String userEmail, String userRole);
    MessageDto markAsRead(Long id, Long loggedInUserId, String userEmail, String userRole);
    void deleteMessage(Long id, Long loggedInUserId, String userEmail, String userRole);
}
