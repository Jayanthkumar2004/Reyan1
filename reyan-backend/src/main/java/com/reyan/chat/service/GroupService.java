package com.reyan.chat.service;

import com.reyan.chat.dto.ChatResponse;
import com.reyan.chat.exception.BadRequestException;
import com.reyan.chat.exception.ResourceNotFoundException;
import com.reyan.chat.exception.UnauthorizedException;
import com.reyan.chat.model.entity.Chat;
import com.reyan.chat.model.entity.ChatMember;
import com.reyan.chat.model.entity.Profile;
import com.reyan.chat.model.enums.ChatType;
import com.reyan.chat.model.enums.MemberRole;
import com.reyan.chat.repository.ChatMemberRepository;
import com.reyan.chat.repository.ChatRepository;
import com.reyan.chat.repository.ProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class GroupService {

    private final ChatRepository chatRepository;
    private final ChatMemberRepository chatMemberRepository;
    private final ProfileRepository profileRepository;
    private final ChatService chatService;

    public GroupService(ChatRepository chatRepository,
                        ChatMemberRepository chatMemberRepository,
                        ProfileRepository profileRepository,
                        ChatService chatService) {
        this.chatRepository = chatRepository;
        this.chatMemberRepository = chatMemberRepository;
        this.profileRepository = profileRepository;
        this.chatService = chatService;
    }

    @Transactional
    public void addMember(UUID groupId, UUID targetUserId, UUID currentUserId) {
        verifyAdminPermission(groupId, currentUserId);

        Chat chat = chatRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found"));
        Profile targetUser = profileRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!chatMemberRepository.existsByChatIdAndUserId(groupId, targetUserId)) {
            ChatMember newMember = new ChatMember(chat, targetUser, MemberRole.MEMBER);
            chatMemberRepository.save(newMember);
        }
    }

    @Transactional
    public void removeMember(UUID groupId, UUID targetUserId, UUID currentUserId) {
        verifyAdminPermission(groupId, currentUserId);
        chatMemberRepository.deleteByChatIdAndUserId(groupId, targetUserId);
    }

    @Transactional
    public void promoteAdmin(UUID groupId, UUID targetUserId, UUID currentUserId) {
        verifyAdminPermission(groupId, currentUserId);
        ChatMember member = chatMemberRepository.findByChatIdAndUserId(groupId, targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found in group"));
        member.setRole(MemberRole.ADMIN);
        chatMemberRepository.save(member);
    }

    @Transactional
    public void demoteAdmin(UUID groupId, UUID targetUserId, UUID currentUserId) {
        verifyAdminPermission(groupId, currentUserId);
        ChatMember member = chatMemberRepository.findByChatIdAndUserId(groupId, targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found in group"));
        member.setRole(MemberRole.MEMBER);
        chatMemberRepository.save(member);
    }

    @Transactional
    public void leaveGroup(UUID groupId, UUID currentUserId) {
        ChatMember member = chatMemberRepository.findByChatIdAndUserId(groupId, currentUserId)
                .orElseThrow(() -> new BadRequestException("You are not in this group"));
        chatMemberRepository.delete(member);
    }

    private void verifyAdminPermission(UUID groupId, UUID userId) {
        ChatMember member = chatMemberRepository.findByChatIdAndUserId(groupId, userId)
                .orElseThrow(() -> new UnauthorizedException("You are not a member of this group"));
        if (member.getRole() != MemberRole.ADMIN) {
            throw new UnauthorizedException("Only group admins can perform this action");
        }
    }
}
