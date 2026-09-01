package com.reyan.chat.dto;

import java.util.UUID;

public class TypingEvent {

    private UUID chatId;
    private UUID userId;
    private String username;
    private boolean typing;

    public TypingEvent() {}

    public TypingEvent(UUID chatId, UUID userId, String username, boolean typing) {
        this.chatId = chatId;
        this.userId = userId;
        this.username = username;
        this.typing = typing;
    }

    public UUID getChatId() { return chatId; }
    public void setChatId(UUID chatId) { this.chatId = chatId; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public boolean isTyping() { return typing; }
    public void setTyping(boolean typing) { this.typing = typing; }
}
