package com.reyan.chat.repository;

import com.reyan.chat.model.entity.MessageStatus;
import com.reyan.chat.model.enums.MessageDeliveryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MessageStatusRepository extends JpaRepository<MessageStatus, UUID> {

    List<MessageStatus> findByMessageId(UUID messageId);

    Optional<MessageStatus> findByMessageIdAndUserId(UUID messageId, UUID userId);

    @Query("SELECT COUNT(ms) FROM MessageStatus ms JOIN Message m ON ms.message.id = m.id " +
           "WHERE m.chat.id = :chatId AND ms.user.id = :userId AND ms.status <> 'READ'")
    long countUnreadMessagesInChat(@Param("chatId") UUID chatId, @Param("userId") UUID userId);

    @Query("SELECT ms FROM MessageStatus ms JOIN Message m ON ms.message.id = m.id " +
           "WHERE m.chat.id = :chatId AND ms.user.id = :userId AND ms.status <> 'READ'")
    List<MessageStatus> findUnreadStatusesInChat(@Param("chatId") UUID chatId, @Param("userId") UUID userId);
}
