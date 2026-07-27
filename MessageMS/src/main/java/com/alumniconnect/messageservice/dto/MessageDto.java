package com.alumniconnect.messageservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageDto {

    @Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "Auto-generated message ID")
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long id;

    @Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "System-assigned authenticated Sender User ID")
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long senderId;

    @NotNull(message = "Receiver ID is required")
    private Long receiverId;

    @Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "System-assigned Sender Email")
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String senderEmail;

    private String receiverEmail;

    @NotBlank(message = "Message content cannot be blank")
    @Size(max = 2000, message = "Message content cannot exceed 2000 characters")
    private String messageContent;

    @Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "Timestamp of message creation")
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private LocalDateTime sentAt;

    @Schema(accessMode = Schema.AccessMode.READ_ONLY, description = "Message read status flag")
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Boolean readStatus;

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

    public static MessageDtoBuilder builder() { return new MessageDtoBuilder(); }

    public static class MessageDtoBuilder {
        private Long id;
        private Long senderId;
        private Long receiverId;
        private String senderEmail;
        private String receiverEmail;
        private String messageContent;
        private LocalDateTime sentAt;
        private Boolean readStatus;

        public MessageDtoBuilder id(Long id) { this.id = id; return this; }
        public MessageDtoBuilder senderId(Long senderId) { this.senderId = senderId; return this; }
        public MessageDtoBuilder receiverId(Long receiverId) { this.receiverId = receiverId; return this; }
        public MessageDtoBuilder senderEmail(String senderEmail) { this.senderEmail = senderEmail; return this; }
        public MessageDtoBuilder receiverEmail(String receiverEmail) { this.receiverEmail = receiverEmail; return this; }
        public MessageDtoBuilder messageContent(String messageContent) { this.messageContent = messageContent; return this; }
        public MessageDtoBuilder sentAt(LocalDateTime sentAt) { this.sentAt = sentAt; return this; }
        public MessageDtoBuilder readStatus(Boolean readStatus) { this.readStatus = readStatus; return this; }

        public MessageDto build() {
            MessageDto m = new MessageDto();
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
