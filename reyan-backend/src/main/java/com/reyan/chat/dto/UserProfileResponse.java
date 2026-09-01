package com.reyan.chat.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.reyan.chat.model.entity.Profile;

import java.time.OffsetDateTime;
import java.util.UUID;

public class UserProfileResponse {

    private UUID id;
    private String username;
    private String fullName;
    private String email;
    private String phone;
    private String avatarUrl;
    private String about;

    @JsonProperty("isOnline")
    private boolean isOnline;

    private OffsetDateTime lastSeen;

    public UserProfileResponse() {}

    public static UserProfileResponse fromEntity(Profile profile) {
        UserProfileResponse dto = new UserProfileResponse();
        dto.setId(profile.getId());
        dto.setUsername(profile.getUsername());
        dto.setFullName(profile.getFullName());
        dto.setEmail(profile.getEmail());
        dto.setPhone(profile.getPhone());
        dto.setAvatarUrl(profile.getAvatarUrl());
        dto.setAbout(profile.getAbout());
        dto.setOnline(profile.isOnline());
        dto.setLastSeen(profile.getLastSeen());
        return dto;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public String getAbout() { return about; }
    public void setAbout(String about) { this.about = about; }

    @JsonProperty("isOnline")
    public boolean isOnline() { return isOnline; }
    public void setOnline(boolean online) { isOnline = online; }

    public OffsetDateTime getLastSeen() { return lastSeen; }
    public void setLastSeen(OffsetDateTime lastSeen) { this.lastSeen = lastSeen; }
}
