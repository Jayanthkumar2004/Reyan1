package com.reyan.chat.model.entity;

import com.reyan.chat.model.enums.ThemeSetting;
import com.reyan.chat.model.enums.VisibilitySetting;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "user_settings")
public class UserSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private Profile user;

    @Enumerated(EnumType.STRING)
    @Column(name = "last_seen_visibility", length = 20)
    private VisibilitySetting lastSeenVisibility = VisibilitySetting.EVERYONE;

    @Enumerated(EnumType.STRING)
    @Column(name = "online_visibility", length = 20)
    private VisibilitySetting onlineVisibility = VisibilitySetting.EVERYONE;

    @Enumerated(EnumType.STRING)
    @Column(name = "profile_photo_visibility", length = 20)
    private VisibilitySetting profilePhotoVisibility = VisibilitySetting.EVERYONE;

    @Enumerated(EnumType.STRING)
    @Column(name = "about_visibility", length = 20)
    private VisibilitySetting aboutVisibility = VisibilitySetting.EVERYONE;

    @Column(name = "read_receipts")
    private boolean readReceipts = true;

    @Column(name = "typing_indicator")
    private boolean typingIndicator = true;

    @Column(name = "notification_enabled")
    private boolean notificationEnabled = true;

    @Enumerated(EnumType.STRING)
    @Column(name = "dark_mode", length = 20)
    private ThemeSetting darkMode = ThemeSetting.SYSTEM;

    public UserSettings() {}

    public UserSettings(Profile user) {
        this.user = user;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Profile getUser() { return user; }
    public void setUser(Profile user) { this.user = user; }

    public UUID getUserId() { return user != null ? user.getId() : null; }

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
