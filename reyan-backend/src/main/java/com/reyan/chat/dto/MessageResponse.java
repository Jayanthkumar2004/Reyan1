package com.reyan.chat.dto;

import com.reyan.chat.model.enums.MessageDeliveryStatus;
import com.reyan.chat.model.enums.MessageType;
import java.time.OffsetDateTime;
import java.util.UUID;

public class MessageResponse {

    private UUID id;
    private UUID chatId;
    private UserProfileResponse sender;
    private MessageType messageType;
    private String content;
    private String mediaUrl;
    private String mediaFilename;
    private Long mediaSize;
    private MessageResponse replyToMessage;
    private MessageDeliveryStatus status = MessageDeliveryStatus.SENT;
    private boolean edited;
    private boolean deleted;
    private boolean starred;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public MessageResponse() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getChatId() { return chatId; }
    public void setChatId(UUID chatId) { this.chatId = chatId; }

    public UserProfileResponse getSender() { return sender; }
    public void setSender(UserProfileResponse sender) { this.sender = sender; }

    public MessageType getMessageType() { return messageType; }
    public void setMessageType(MessageType messageType) { this.messageType = messageType; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getMediaUrl() { return mediaUrl; }
    public void setMediaUrl(String mediaUrl) { this.mediaUrl = mediaUrl; }

    public String getMediaFilename() { return mediaFilename; }
    public void setMediaFilename(String mediaFilename) { this.mediaFilename = mediaFilename; }

    public Long getMediaSize() { return mediaSize; }
    public void setMediaSize(Long mediaSize) { this.mediaSize = mediaSize; }

    public MessageResponse getReplyToMessage() { return replyToMessage; }
    public void setReplyToMessage(MessageResponse replyToMessage) { this.replyToMessage = replyToMessage; }

    public MessageDeliveryStatus getStatus() { return status; }
    public void setStatus(MessageDeliveryStatus status) { this.status = status; }

    public boolean isEdited() { return edited; }
    public void setEdited(boolean edited) { this.edited = edited; }

    public boolean isDeleted() { return deleted; }
    public void setDeleted(boolean deleted) { this.deleted = deleted; }

    public boolean isStarred() { return starred; }
    public void setStarred(boolean starred) { this.starred = starred; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}
