package com.reyan.chat.service;

import com.reyan.chat.model.entity.Profile;
import com.reyan.chat.repository.ProfileRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class PresenceService {

    private static final Logger logger = LoggerFactory.getLogger(PresenceService.class);

    private final ProfileRepository profileRepository;
    private final SimpMessagingTemplate messagingTemplate;

    // Track active WebSocket session IDs per user to prevent premature offline status
    private final Map<UUID, Set<String>> userSessions = new ConcurrentHashMap<>();

    public PresenceService(ProfileRepository profileRepository, @Lazy SimpMessagingTemplate messagingTemplate) {
        this.profileRepository = profileRepository;
        this.messagingTemplate = messagingTemplate;
    }

    public synchronized void userConnected(UUID userId, String sessionId) {
        if (userId == null) return;
        String activeSession = (sessionId != null && !sessionId.isBlank()) ? sessionId : UUID.randomUUID().toString();
        Set<String> sessions = userSessions.computeIfAbsent(userId, k -> ConcurrentHashMap.newKeySet());
        sessions.add(activeSession);
        logger.info("User {} connected session {}. Total active sessions: {}", userId, activeSession, sessions.size());
        setOnlineStatusInternal(userId, true);
    }

    public synchronized void userDisconnected(UUID userId, String sessionId) {
        if (userId == null) return;
        Set<String> sessions = userSessions.get(userId);
        if (sessions != null && !sessions.isEmpty()) {
            if (sessionId != null) {
                sessions.remove(sessionId);
            }
            if (sessions.isEmpty()) {
                userSessions.remove(userId);
                setOnlineStatusInternal(userId, false);
                logger.info("User {} disconnected all sessions. Set to OFFLINE.", userId);
            } else {
                logger.info("User {} disconnected session {}. Remaining active sessions: {}", userId, sessionId, sessions.size());
            }
        } else {
            userSessions.remove(userId);
            setOnlineStatusInternal(userId, false);
            logger.info("User {} had no active sessions. Set to OFFLINE.", userId);
        }
    }

    @Transactional
    public void setOnlineStatus(UUID userId, boolean isOnline) {
        if (userId == null) return;
        if (isOnline) {
            setOnlineStatusInternal(userId, true);
        } else {
            userSessions.remove(userId);
            setOnlineStatusInternal(userId, false);
        }
    }

    @Transactional
    private void setOnlineStatusInternal(UUID userId, boolean isOnline) {
        Profile profile = profileRepository.findById(userId).orElse(null);
        if (profile != null) {
            profile.setOnline(isOnline);
            profile.setLastSeen(OffsetDateTime.now());
            profileRepository.saveAndFlush(profile);
            logger.info("Updated online presence in DB for user {}: isOnline={}", userId, isOnline);

            try {
                Map<String, Object> presenceEvent = new HashMap<>();
                presenceEvent.put("userId", userId.toString());
                presenceEvent.put("isOnline", isOnline);
                presenceEvent.put("lastSeen", profile.getLastSeen().toString());

                messagingTemplate.convertAndSend("/topic/presence", presenceEvent);
            } catch (Exception e) {
                logger.error("Failed to broadcast presence update for user {}: {}", userId, e.getMessage());
            }
        }
    }
}
