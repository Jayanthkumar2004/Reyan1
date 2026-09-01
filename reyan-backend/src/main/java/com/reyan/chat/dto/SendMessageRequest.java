package com.reyan.chat.dto;

import com.reyan.chat.model.enums.MessageType;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class SendMessageRequest {

    @NotNull(message = "Chat ID is required")
    private UUID chatId;

    private MessageType messageType = MessageType.TEXT;
    private String content;
    private String mediaUrl;
    private String mediaFilename;
    private Long mediaSize;
    private UUID replyToMessageId;
    private String clientMessageId; // For PWA offline sync & deduplication

    public SendMessageRequest() {}

    public UUID getChatId() { return chatId; }
    public void setChatId(UUID chatId) { this.chatId = chatId; }

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

    public UUID getReplyToMessageId() { return replyToMessageId; }
    public void setReplyToMessageId(UUID replyToMessageId) { this.replyToMessageId = replyToMessageId; }

    public String getClientMessageId() { return clientMessageId; }
    public void setClientMessageId(String clientMessageId) { this.clientMessageId = clientMessageId; }
}
