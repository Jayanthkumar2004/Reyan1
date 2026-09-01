package com.reyan.chat.repository;

import com.reyan.chat.model.entity.UserSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserSettingsRepository extends JpaRepository<UserSettings, UUID> {

    @Query("SELECT s FROM UserSettings s WHERE s.user.id = :userId")
    Optional<UserSettings> findByUserId(@Param("userId") UUID userId);
}
