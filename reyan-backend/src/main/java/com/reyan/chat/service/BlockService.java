package com.reyan.chat.service;

import com.reyan.chat.dto.UserProfileResponse;
import com.reyan.chat.exception.BadRequestException;
import com.reyan.chat.exception.ResourceNotFoundException;
import com.reyan.chat.model.entity.BlockedUser;
import com.reyan.chat.model.entity.Profile;
import com.reyan.chat.repository.BlockedUserRepository;
import com.reyan.chat.repository.ProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BlockService {

    private final BlockedUserRepository blockedUserRepository;
    private final ProfileRepository profileRepository;

    public BlockService(BlockedUserRepository blockedUserRepository, ProfileRepository profileRepository) {
        this.blockedUserRepository = blockedUserRepository;
        this.profileRepository = profileRepository;
    }

    @Transactional
    public void blockUser(UUID blockerId, UUID targetUserId) {
        if (blockerId.equals(targetUserId)) {
            throw new BadRequestException("You cannot block yourself");
        }

        Profile blocker = profileRepository.findById(blockerId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Profile blocked = profileRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Target user not found"));

        if (!blockedUserRepository.existsByBlockerIdAndBlockedId(blockerId, targetUserId)) {
            BlockedUser block = new BlockedUser(blocker, blocked);
            blockedUserRepository.save(block);
        }
    }

    @Transactional
    public void unblockUser(UUID blockerId, UUID targetUserId) {
        blockedUserRepository.deleteByBlockerIdAndBlockedId(blockerId, targetUserId);
    }

    @Transactional(readOnly = true)
    public List<UserProfileResponse> getBlockedUsers(UUID blockerId) {
        List<BlockedUser> blocks = blockedUserRepository.findByBlockerId(blockerId);
        return blocks.stream()
                .map(b -> UserProfileResponse.fromEntity(b.getBlocked()))
                .collect(Collectors.toList());
    }
}
