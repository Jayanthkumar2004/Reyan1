package com.reyan.chat.dto;

import com.reyan.chat.model.enums.ThemeSetting;
import com.reyan.chat.model.enums.VisibilitySetting;

public class UpdateSettingsRequest {

    private VisibilitySetting lastSeenVisibility;
    private VisibilitySetting onlineVisibility;
    private VisibilitySetting profilePhotoVisibility;
    private VisibilitySetting aboutVisibility;
    private Boolean readReceipts;
    private Boolean typingIndicator;
    private Boolean notificationEnabled;
    private ThemeSetting darkMode;

    public UpdateSettingsRequest() {}

    public VisibilitySetting getLastSeenVisibility() { return lastSeenVisibility; }
    public void setLastSeenVisibility(VisibilitySetting lastSeenVisibility) { this.lastSeenVisibility = lastSeenVisibility; }

    public VisibilitySetting getOnlineVisibility() { return onlineVisibility; }
    public void setOnlineVisibility(VisibilitySetting onlineVisibility) { this.onlineVisibility = onlineVisibility; }

    public VisibilitySetting getProfilePhotoVisibility() { return profilePhotoVisibility; }
    public void setProfilePhotoVisibility(VisibilitySetting profilePhotoVisibility) { this.profilePhotoVisibility = profilePhotoVisibility; }

    public VisibilitySetting getAboutVisibility() { return aboutVisibility; }
    public void setAboutVisibility(VisibilitySetting aboutVisibility) { this.aboutVisibility = aboutVisibility; }

    public Boolean getReadReceipts() { return readReceipts; }
    public void setReadReceipts(Boolean readReceipts) { this.readReceipts = readReceipts; }

    public Boolean getTypingIndicator() { return typingIndicator; }
    public void setTypingIndicator(Boolean typingIndicator) { this.typingIndicator = typingIndicator; }

    public Boolean getNotificationEnabled() { return notificationEnabled; }
    public void setNotificationEnabled(Boolean notificationEnabled) { this.notificationEnabled = notificationEnabled; }

    public ThemeSetting getDarkMode() { return darkMode; }
    public void setDarkMode(ThemeSetting darkMode) { this.darkMode = darkMode; }
}
