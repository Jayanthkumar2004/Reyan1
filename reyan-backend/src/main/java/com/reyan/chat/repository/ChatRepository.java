package com.reyan.chat.repository;

import com.reyan.chat.model.entity.Chat;
import com.reyan.chat.model.enums.ChatType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ChatRepository extends JpaRepository<Chat, UUID> {

    @Query("SELECT c FROM Chat c JOIN ChatMember cm1 ON c.id = cm1.chat.id " +
           "JOIN ChatMember cm2 ON c.id = cm2.chat.id " +
           "WHERE c.type = 'DIRECT' AND cm1.user.id = :user1Id AND cm2.user.id = :user2Id")
    Optional<Chat> findDirectChatBetweenUsers(@Param("user1Id") UUID user1Id, @Param("user2Id") UUID user2Id);

    @Query("SELECT DISTINCT c FROM Chat c JOIN ChatMember cm ON c.id = cm.chat.id " +
           "WHERE cm.user.id = :userId ORDER BY c.updatedAt DESC")
    List<Chat> findChatsByUserId(@Param("userId") UUID userId);
}
