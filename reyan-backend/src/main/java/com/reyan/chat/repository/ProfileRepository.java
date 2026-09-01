package com.reyan.chat.repository;

import com.reyan.chat.model.entity.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProfileRepository extends JpaRepository<Profile, UUID> {

    Optional<Profile> findByUsername(String username);

    Optional<Profile> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    @Query("SELECT p FROM Profile p WHERE " +
           "(:query IS NULL OR :query = '' OR " +
           "LOWER(p.username) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.fullName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.email) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "p.id <> :currentUserId")
    List<Profile> searchUsers(@Param("query") String query, @Param("currentUserId") UUID currentUserId);
}
