package com.reyan.chat.dto;

import com.reyan.chat.model.enums.ChatType;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public class ChatResponse {

    private UUID id;
    private ChatType type;
    private String name;
    private String description;
    private String avatarUrl;
    private UserProfileResponse otherUser; // For DIRECT chat UI convenience
    private List<UserProfileResponse> members;
    private MessageResponse lastMessage;
    private long unreadCount;
    private boolean muted;
    private boolean pinned;
    private boolean archived;
    private OffsetDateTime updatedAt;

    public ChatResponse() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public ChatType getType() { return type; }
    public void setType(ChatType type) { this.type = type; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public UserProfileResponse getOtherUser() { return otherUser; }
    public void setOtherUser(UserProfileResponse otherUser) { this.otherUser = otherUser; }

    public List<UserProfileResponse> getMembers() { return members; }
    public void setMembers(List<UserProfileResponse> members) { this.members = members; }

    public MessageResponse getLastMessage() { return lastMessage; }
    public void setLastMessage(MessageResponse lastMessage) { this.lastMessage = lastMessage; }

    public long getUnreadCount() { return unreadCount; }
    public void setUnreadCount(long unreadCount) { this.unreadCount = unreadCount; }

    public boolean isMuted() { return muted; }
    public void setMuted(boolean muted) { this.muted = muted; }

    public boolean isPinned() { return pinned; }
    public void setPinned(boolean pinned) { this.pinned = pinned; }

    public boolean isArchived() { return archived; }
    public void setArchived(boolean archived) { this.archived = archived; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}
