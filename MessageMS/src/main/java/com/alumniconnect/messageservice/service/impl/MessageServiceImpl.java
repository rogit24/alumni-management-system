package com.alumniconnect.messageservice.service.impl;

import com.alumniconnect.messageservice.dto.MessageDto;
import com.alumniconnect.messageservice.entity.Message;
import com.alumniconnect.messageservice.exception.AccessDeniedException;
import com.alumniconnect.messageservice.exception.ResourceNotFoundException;
import com.alumniconnect.messageservice.repository.MessageRepository;
import com.alumniconnect.messageservice.service.MessageService;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MessageServiceImpl implements MessageService {

    private final MessageRepository messageRepository;
    private final ModelMapper modelMapper;

    public MessageServiceImpl(MessageRepository messageRepository, ModelMapper modelMapper) {
        this.messageRepository = messageRepository;
        this.modelMapper = modelMapper;
    }

    @Override
    public MessageDto sendMessage(MessageDto messageDto, Long loggedInUserId, String userEmail, String userRole) {
        // Validate receiver existence in system database
        if (messageRepository.countUserById(messageDto.getReceiverId()) == 0) {
            throw new ResourceNotFoundException("Receiver not found");
        }

        String receiverEmail = messageDto.getReceiverEmail();
        if (receiverEmail == null || receiverEmail.trim().isEmpty()) {
            receiverEmail = messageRepository.findUserEmailById(messageDto.getReceiverId())
                    .orElse("user" + messageDto.getReceiverId() + "@alumni.com");
        }

        Message message = modelMapper.map(messageDto, Message.class);
        // Automatically bind sender identity from security token
        message.setSenderId(loggedInUserId);
        message.setSenderEmail(userEmail != null ? userEmail : "user" + loggedInUserId + "@alumni.com");
        message.setReceiverId(messageDto.getReceiverId());
        message.setReceiverEmail(receiverEmail);
        message.setReadStatus(false);

        Message savedMessage = messageRepository.save(message);
        return modelMapper.map(savedMessage, MessageDto.class);
    }

    @Override
    public List<MessageDto> getConversation(Long otherUserId, Long loggedInUserId, String userEmail, String userRole) {
        if (messageRepository.countUserById(otherUserId) == 0) {
            throw new ResourceNotFoundException("User not found with ID: " + otherUserId);
        }

        List<Message> messages = messageRepository.findConversationBetweenUsers(loggedInUserId, otherUserId);
        return messages.stream()
                .map(m -> modelMapper.map(m, MessageDto.class))
                .collect(Collectors.toList());
    }

    @Override
    public List<MessageDto> getInbox(Long targetUserId, Long loggedInUserId, String userEmail, String userRole) {
        // NON-ADMIN users can only view their own inbox
        if (!"ADMIN".equalsIgnoreCase(userRole) && !targetUserId.equals(loggedInUserId)) {
            throw new AccessDeniedException("Access denied: You can only view your own inbox.");
        }

        List<Message> messages = messageRepository.findInboxByUserId(targetUserId);
        return messages.stream()
                .map(m -> modelMapper.map(m, MessageDto.class))
                .collect(Collectors.toList());
    }

    @Override
    public MessageDto markAsRead(Long id, Long loggedInUserId, String userEmail, String userRole) {
        Message message = messageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found with ID: " + id));

        // NON-ADMIN users can only mark incoming messages as read
        if (!"ADMIN".equalsIgnoreCase(userRole) && !message.getReceiverId().equals(loggedInUserId)) {
            throw new AccessDeniedException("Access denied: Only the message receiver can mark it as read.");
        }

        message.setReadStatus(true);
        Message updatedMessage = messageRepository.save(message);
        return modelMapper.map(updatedMessage, MessageDto.class);
    }

    @Override
    public void deleteMessage(Long id, Long loggedInUserId, String userEmail, String userRole) {
        Message message = messageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found with ID: " + id));

        boolean isSender = message.getSenderId().equals(loggedInUserId);
        boolean isReceiver = message.getReceiverId().equals(loggedInUserId);
        boolean isAdmin = "ADMIN".equalsIgnoreCase(userRole);

        if (!isSender && !isReceiver && !isAdmin) {
            throw new AccessDeniedException("Access denied: You can only delete messages you sent or received.");
        }

        messageRepository.delete(message);
    }
}
