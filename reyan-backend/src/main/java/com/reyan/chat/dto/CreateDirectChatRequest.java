package com.reyan.chat.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class CreateDirectChatRequest {

    @NotNull(message = "Recipient user ID is required")
    private UUID recipientId;

    public CreateDirectChatRequest() {}

    public CreateDirectChatRequest(UUID recipientId) {
        this.recipientId = recipientId;
    }

    public UUID getRecipientId() { return recipientId; }
    public void setRecipientId(UUID recipientId) { this.recipientId = recipientId; }
}
