package com.reyan.chat.service;

import com.reyan.chat.dto.UpdateSettingsRequest;
import com.reyan.chat.dto.UserSettingsResponse;
import com.reyan.chat.exception.ResourceNotFoundException;
import com.reyan.chat.model.entity.Profile;
import com.reyan.chat.model.entity.UserSettings;
import com.reyan.chat.repository.ProfileRepository;
import com.reyan.chat.repository.UserSettingsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class UserSettingsService {

    private final UserSettingsRepository userSettingsRepository;
    private final ProfileRepository profileRepository;

    public UserSettingsService(UserSettingsRepository userSettingsRepository, ProfileRepository profileRepository) {
        this.userSettingsRepository = userSettingsRepository;
        this.profileRepository = profileRepository;
    }

    @Transactional(readOnly = true)
    public UserSettingsResponse getSettings(UUID userId) {
        UserSettings settings = userSettingsRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Profile profile = profileRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                    UserSettings newSettings = new UserSettings(profile);
                    return userSettingsRepository.save(newSettings);
                });
        return UserSettingsResponse.fromEntity(settings);
    }

    @Transactional
    public UserSettingsResponse updateSettings(UUID userId, UpdateSettingsRequest request) {
        UserSettings settings = userSettingsRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Settings not found for user: " + userId));

        if (request.getLastSeenVisibility() != null) settings.setLastSeenVisibility(request.getLastSeenVisibility());
        if (request.getOnlineVisibility() != null) settings.setOnlineVisibility(request.getOnlineVisibility());
        if (request.getProfilePhotoVisibility() != null) settings.setProfilePhotoVisibility(request.getProfilePhotoVisibility());
        if (request.getAboutVisibility() != null) settings.setAboutVisibility(request.getAboutVisibility());
        if (request.getReadReceipts() != null) settings.setReadReceipts(request.getReadReceipts());
        if (request.getTypingIndicator() != null) settings.setTypingIndicator(request.getTypingIndicator());
        if (request.getNotificationEnabled() != null) settings.setNotificationEnabled(request.getNotificationEnabled());
        if (request.getDarkMode() != null) settings.setDarkMode(request.getDarkMode());

        UserSettings updated = userSettingsRepository.save(settings);
        return UserSettingsResponse.fromEntity(updated);
    }
}
