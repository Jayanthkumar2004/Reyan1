package com.reyan.chat.repository;

import com.reyan.chat.model.entity.Message;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MessageRepository extends JpaRepository<Message, UUID> {

    List<Message> findByChatIdOrderByCreatedAtAsc(UUID chatId);

    List<Message> findByChatIdOrderByCreatedAtDesc(UUID chatId, Pageable pageable);

    @Query("SELECT m FROM Message m WHERE m.chat.id = :chatId ORDER BY m.createdAt DESC")
    List<Message> findLatestMessageByChatId(@Param("chatId") UUID chatId, Pageable pageable);

    @Query("SELECT m FROM Message m WHERE m.chat.id = :chatId AND LOWER(m.content) LIKE LOWER(CONCAT('%', :query, '%')) ORDER BY m.createdAt DESC")
    List<Message> searchMessagesInChat(@Param("chatId") UUID chatId, @Param("query") String query);

    @Query("SELECT m FROM Message m JOIN ChatMember cm ON m.chat.id = cm.chat.id " +
           "WHERE cm.user.id = :userId AND LOWER(m.content) LIKE LOWER(CONCAT('%', :query, '%')) ORDER BY m.createdAt DESC")
    List<Message> searchGlobalMessages(@Param("userId") UUID userId, @Param("query") String query);
}
