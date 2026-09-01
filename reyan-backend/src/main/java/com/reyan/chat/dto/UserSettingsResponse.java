package com.reyan.chat.dto;

import com.reyan.chat.model.entity.UserSettings;
import com.reyan.chat.model.enums.ThemeSetting;
import com.reyan.chat.model.enums.VisibilitySetting;
import java.util.UUID;

public class UserSettingsResponse {

    private UUID userId;
    private VisibilitySetting lastSeenVisibility;
    private VisibilitySetting onlineVisibility;
    private VisibilitySetting profilePhotoVisibility;
    private VisibilitySetting aboutVisibility;
    private boolean readReceipts;
    private boolean typingIndicator;
    private boolean notificationEnabled;
    private ThemeSetting darkMode;

    public UserSettingsResponse() {}

    public static UserSettingsResponse fromEntity(UserSettings settings) {
        UserSettingsResponse response = new UserSettingsResponse();
        response.setUserId(settings.getUserId());
        response.setLastSeenVisibility(settings.getLastSeenVisibility());
        response.setOnlineVisibility(settings.getOnlineVisibility());
        response.setProfilePhotoVisibility(settings.getProfilePhotoVisibility());
        response.setAboutVisibility(settings.getAboutVisibility());
        response.setReadReceipts(settings.isReadReceipts());
        response.setTypingIndicator(settings.isTypingIndicator());
        response.setNotificationEnabled(settings.isNotificationEnabled());
        response.setDarkMode(settings.getDarkMode());
        return response;
    }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public VisibilitySetting getLastSeenVisibility() { return lastSeenVisibility; }
    public void setLastSeenVisibility(VisibilitySetting lastSeenVisibility) { this.lastSeenVisibility = lastSeenVisibility; }

    public VisibilitySetting getOnlineVisibility() { return onlineVisibility; }
    public void setOnlineVisibility(VisibilitySetting onlineVisibility) { this.onlineVisibility = onlineVisibility; }

    public VisibilitySetting getProfilePhotoVisibility() { return profilePhotoVisibility; }
    public void setProfilePhotoVisibility(VisibilitySetting profilePhotoVisibility) { this.profilePhotoVisibility = profilePhotoVisibility; }

    public VisibilitySetting getAboutVisibility() { return aboutVisibility; }
    public void setAboutVisibility(VisibilitySetting aboutVisibility) { this.aboutVisibility = aboutVisibility; }

    public boolean isReadReceipts() { return readReceipts; }
    public void setReadReceipts(boolean readReceipts) { this.readReceipts = readReceipts; }

    public boolean isTypingIndicator() { return typingIndicator; }
    public void setTypingIndicator(boolean typingIndicator) { this.typingIndicator = typingIndicator; }

    public boolean isNotificationEnabled() { return notificationEnabled; }
    public void setNotificationEnabled(boolean notificationEnabled) { this.notificationEnabled = notificationEnabled; }

    public ThemeSetting getDarkMode() { return darkMode; }
    public void setDarkMode(ThemeSetting darkMode) { this.darkMode = darkMode; }
}
