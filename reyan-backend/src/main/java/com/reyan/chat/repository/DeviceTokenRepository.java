package com.reyan.chat.repository;

import com.reyan.chat.model.entity.DeviceToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DeviceTokenRepository extends JpaRepository<DeviceToken, UUID> {

    List<DeviceToken> findByUserId(UUID userId);

    Optional<DeviceToken> findByUserIdAndFcmToken(UUID userId, String fcmToken);

    void deleteByUserIdAndFcmToken(UUID userId, String fcmToken);
}
