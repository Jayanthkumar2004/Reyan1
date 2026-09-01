package com.reyan.chat.service;

import com.reyan.chat.dto.UpdateProfileRequest;
import com.reyan.chat.dto.UserProfileResponse;
import com.reyan.chat.exception.BadRequestException;
import com.reyan.chat.exception.ResourceNotFoundException;
import com.reyan.chat.model.entity.Profile;
import com.reyan.chat.repository.ProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final ProfileRepository profileRepository;
    private final PresenceService presenceService;

    public UserService(ProfileRepository profileRepository, PresenceService presenceService) {
        this.profileRepository = profileRepository;
        this.presenceService = presenceService;
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getUserProfile(UUID userId) {
        Profile profile = profileRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User profile not found with ID: " + userId));
        return UserProfileResponse.fromEntity(profile);
    }

    @Transactional
    public UserProfileResponse updateProfile(UUID userId, UpdateProfileRequest request) {
        Profile profile = profileRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User profile not found with ID: " + userId));

        if (request.getUsername() != null && !request.getUsername().equalsIgnoreCase(profile.getUsername())) {
            if (profileRepository.existsByUsername(request.getUsername())) {
                throw new BadRequestException("Username is already taken");
            }
            profile.setUsername(request.getUsername());
        }

        if (request.getFullName() != null) profile.setFullName(request.getFullName());
        if (request.getPhone() != null) profile.setPhone(request.getPhone());
        if (request.getAbout() != null) profile.setAbout(request.getAbout());
        if (request.getAvatarUrl() != null) profile.setAvatarUrl(request.getAvatarUrl());

        Profile updated = profileRepository.save(profile);
        return UserProfileResponse.fromEntity(updated);
    }

    @Transactional(readOnly = true)
    public List<UserProfileResponse> searchUsers(String query, UUID currentUserId) {
        String searchQuery = query != null ? query.trim() : "";
        return profileRepository.searchUsers(searchQuery, currentUserId)
                .stream()
                .map(UserProfileResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public void updateOnlinePresence(UUID userId, boolean isOnline) {
        presenceService.setOnlineStatus(userId, isOnline);
    }
}
