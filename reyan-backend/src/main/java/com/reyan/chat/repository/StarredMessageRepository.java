package com.reyan.chat.repository;

import com.reyan.chat.model.entity.StarredMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StarredMessageRepository extends JpaRepository<StarredMessage, UUID> {

    List<StarredMessage> findByUserIdOrderByCreatedAtDesc(UUID userId);

    Optional<StarredMessage> findByUserIdAndMessageId(UUID userId, UUID messageId);

    boolean existsByUserIdAndMessageId(UUID userId, UUID messageId);

    void deleteByUserIdAndMessageId(UUID userId, UUID messageId);
}
