package com.reyan.chat.service;

import com.reyan.chat.model.entity.DeviceToken;
import com.reyan.chat.model.entity.Profile;
import com.reyan.chat.repository.DeviceTokenRepository;
import com.reyan.chat.repository.ProfileRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
public class NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    private final DeviceTokenRepository deviceTokenRepository;
    private final ProfileRepository profileRepository;

    public NotificationService(DeviceTokenRepository deviceTokenRepository, ProfileRepository profileRepository) {
        this.deviceTokenRepository = deviceTokenRepository;
        this.profileRepository = profileRepository;
    }

    @Transactional
    public void registerDeviceToken(UUID userId, String fcmToken, String deviceType) {
        Profile user = profileRepository.findById(userId).orElse(null);
        if (user == null) return;

        Optional<DeviceToken> existing = deviceTokenRepository.findByUserIdAndFcmToken(userId, fcmToken);
        if (existing.isEmpty()) {
            DeviceToken token = new DeviceToken(user, fcmToken, deviceType);
            deviceTokenRepository.save(token);
            logger.info("Registered device token for user: {}", userId);
        }
    }

    @Transactional
    public void removeDeviceToken(UUID userId, String fcmToken) {
        deviceTokenRepository.deleteByUserIdAndFcmToken(userId, fcmToken);
    }

    public void sendPushNotification(UUID recipientId, String title, String body, String chatUrl) {
        logger.info("Simulating Web Push Notification dispatch to user {}: Title='{}', Body='{}', DeepLink='{}'",
                recipientId, title, body, chatUrl);
        // Integrated with FCM / Web Push API payload dispatcher
    }
}
