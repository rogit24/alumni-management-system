package com.alumniconnect.messageservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sender_id", nullable = false)
    private Long senderId;

    @Column(name = "receiver_id", nullable = false)
    private Long receiverId;

    @Column(name = "sender_email", nullable = false)
    private String senderEmail;

    @Column(name = "receiver_email", nullable = false)
    private String receiverEmail;

    @Column(name = "message_content", columnDefinition = "TEXT", nullable = false)
    private String messageContent;

    @Column(name = "sent_at", nullable = false, updatable = false)
    private LocalDateTime sentAt;

    @Column(name = "read_status", nullable = false)
    private Boolean readStatus;

    @PrePersist
    protected void onCreate() {
        this.sentAt = LocalDateTime.now();
        if (this.readStatus == null) {
            this.readStatus = false;
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getSenderId() { return senderId; }
    public void setSenderId(Long senderId) { this.senderId = senderId; }
    public Long getReceiverId() { return receiverId; }
    public void setReceiverId(Long receiverId) { this.receiverId = receiverId; }
    public String getSenderEmail() { return senderEmail; }
    public void setSenderEmail(String senderEmail) { this.senderEmail = senderEmail; }
    public String getReceiverEmail() { return receiverEmail; }
    public void setReceiverEmail(String receiverEmail) { this.receiverEmail = receiverEmail; }
    public String getMessageContent() { return messageContent; }
    public void setMessageContent(String messageContent) { this.messageContent = messageContent; }
    public LocalDateTime getSentAt() { return sentAt; }
    public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }
    public Boolean getReadStatus() { return readStatus; }
    public void setReadStatus(Boolean readStatus) { this.readStatus = readStatus; }

    public static MessageBuilder builder() { return new MessageBuilder(); }

    public static class MessageBuilder {
        private Long id;
        private Long senderId;
        private Long receiverId;
        private String senderEmail;
        private String receiverEmail;
        private String messageContent;
        private LocalDateTime sentAt;
        private Boolean readStatus;

        public MessageBuilder id(Long id) { this.id = id; return this; }
        public MessageBuilder senderId(Long senderId) { this.senderId = senderId; return this; }
        public MessageBuilder receiverId(Long receiverId) { this.receiverId = receiverId; return this; }
        public MessageBuilder senderEmail(String senderEmail) { this.senderEmail = senderEmail; return this; }
        public MessageBuilder receiverEmail(String receiverEmail) { this.receiverEmail = receiverEmail; return this; }
        public MessageBuilder messageContent(String messageContent) { this.messageContent = messageContent; return this; }
        public MessageBuilder sentAt(LocalDateTime sentAt) { this.sentAt = sentAt; return this; }
        public MessageBuilder readStatus(Boolean readStatus) { this.readStatus = readStatus; return this; }

        public Message build() {
            Message m = new Message();
            m.setId(this.id);
            m.setSenderId(this.senderId);
            m.setReceiverId(this.receiverId);
            m.setSenderEmail(this.senderEmail);
            m.setReceiverEmail(this.receiverEmail);
            m.setMessageContent(this.messageContent);
            m.setSentAt(this.sentAt);
            m.setReadStatus(this.readStatus);
            return m;
        }
    }
}
