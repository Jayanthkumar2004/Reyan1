package com.reyan.chat.repository;

import com.reyan.chat.model.entity.BlockedUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BlockedUserRepository extends JpaRepository<BlockedUser, UUID> {

    List<BlockedUser> findByBlockerId(UUID blockerId);

    boolean existsByBlockerIdAndBlockedId(UUID blockerId, UUID blockedId);

    Optional<BlockedUser> findByBlockerIdAndBlockedId(UUID blockerId, UUID blockedId);

    void deleteByBlockerIdAndBlockedId(UUID blockerId, UUID blockedId);

    @Query("SELECT CASE WHEN COUNT(b) > 0 THEN true ELSE false END FROM BlockedUser b " +
           "WHERE (b.blocker.id = :user1Id AND b.blocked.id = :user2Id) OR " +
           "(b.blocker.id = :user2Id AND b.blocked.id = :user1Id)")
    boolean isEitherBlocked(@Param("user1Id") UUID user1Id, @Param("user2Id") UUID user2Id);
}
