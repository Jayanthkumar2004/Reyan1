package com.reyan.chat.dto;

import com.reyan.chat.model.enums.MessageDeliveryStatus;
import java.util.UUID;

public class MessageStatusEvent {

    private UUID messageId;
    private UUID chatId;
    private UUID userId;
    private MessageDeliveryStatus status;

    public MessageStatusEvent() {}

    public MessageStatusEvent(UUID messageId, UUID chatId, UUID userId, MessageDeliveryStatus status) {
        this.messageId = messageId;
        this.chatId = chatId;
        this.userId = userId;
        this.status = status;
    }

    public UUID getMessageId() { return messageId; }
    public void setMessageId(UUID messageId) { this.messageId = messageId; }

    public UUID getChatId() { return chatId; }
    public void setChatId(UUID chatId) { this.chatId = chatId; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public MessageDeliveryStatus getStatus() { return status; }
    public void setStatus(MessageDeliveryStatus status) { this.status = status; }
}
