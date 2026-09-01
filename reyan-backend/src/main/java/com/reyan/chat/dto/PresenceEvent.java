package com.reyan.chat.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public class PresenceEvent {

    private UUID userId;
    private boolean isOnline;
    private OffsetDateTime lastSeen;

    public PresenceEvent() {}

    public PresenceEvent(UUID userId, boolean isOnline, OffsetDateTime lastSeen) {
        this.userId = userId;
        this.isOnline = isOnline;
        this.lastSeen = lastSeen;
    }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public boolean isOnline() { return isOnline; }
    public void setOnline(boolean online) { isOnline = online; }

    public OffsetDateTime getLastSeen() { return lastSeen; }
    public void setLastSeen(OffsetDateTime lastSeen) { this.lastSeen = lastSeen; }
}
