package com.reyan.chat.service;

import com.reyan.chat.dto.ChatResponse;
import com.reyan.chat.dto.CreateDirectChatRequest;
import com.reyan.chat.dto.CreateGroupChatRequest;
import com.reyan.chat.dto.MessageResponse;
import com.reyan.chat.dto.UserProfileResponse;
import com.reyan.chat.exception.BadRequestException;
import com.reyan.chat.exception.ResourceNotFoundException;
import com.reyan.chat.exception.UnauthorizedException;
import com.reyan.chat.model.entity.*;
import com.reyan.chat.model.enums.ChatType;
import com.reyan.chat.model.enums.MemberRole;
import com.reyan.chat.repository.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private final ChatRepository chatRepository;
    private final ChatMemberRepository chatMemberRepository;
    private final ProfileRepository profileRepository;
    private final MessageRepository messageRepository;
    private final MessageStatusRepository messageStatusRepository;
    private final BlockedUserRepository blockedUserRepository;

    public ChatService(ChatRepository chatRepository,
                       ChatMemberRepository chatMemberRepository,
                       ProfileRepository profileRepository,
                       MessageRepository messageRepository,
                       MessageStatusRepository messageStatusRepository,
                       BlockedUserRepository blockedUserRepository) {
        this.chatRepository = chatRepository;
        this.chatMemberRepository = chatMemberRepository;
        this.profileRepository = profileRepository;
        this.messageRepository = messageRepository;
        this.messageStatusRepository = messageStatusRepository;
        this.blockedUserRepository = blockedUserRepository;
    }

    @Transactional(readOnly = true)
    public List<ChatResponse> getUserChats(UUID userId) {
        List<Chat> chats = chatRepository.findChatsByUserId(userId);
        return chats.stream()
                .map(chat -> buildChatResponse(chat, userId))
                .collect(Collectors.toList());
    }

    @Transactional
    public ChatResponse getOrCreateDirectChat(UUID currentUserId, CreateDirectChatRequest request) {
        UUID recipientId = request.getRecipientId();
        if (currentUserId.equals(recipientId)) {
            throw new BadRequestException("Cannot create a direct chat with yourself");
        }

        if (blockedUserRepository.isEitherBlocked(currentUserId, recipientId)) {
            throw new BadRequestException("Cannot create chat. Communication is blocked between these accounts.");
        }

        Profile currentUser = profileRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Profile recipient = profileRepository.findById(recipientId)
                .orElseThrow(() -> new ResourceNotFoundException("Recipient user not found"));

        Optional<Chat> existingChat = chatRepository.findDirectChatBetweenUsers(currentUserId, recipientId);
        if (existingChat.isPresent()) {
            return buildChatResponse(existingChat.get(), currentUserId);
        }

        Chat chat = new Chat(ChatType.DIRECT);
        Chat savedChat = chatRepository.save(chat);

        ChatMember member1 = new ChatMember(savedChat, currentUser, MemberRole.MEMBER);
        ChatMember member2 = new ChatMember(savedChat, recipient, MemberRole.MEMBER);

        chatMemberRepository.save(member1);
        chatMemberRepository.save(member2);

        return buildChatResponse(savedChat, currentUserId);
    }

    @Transactional
    public ChatResponse createGroupChat(UUID currentUserId, CreateGroupChatRequest request) {
        Profile creator = profileRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Chat chat = new Chat(ChatType.GROUP, request.getName(), request.getDescription(), creator);
        if (request.getAvatarUrl() != null) chat.setAvatarUrl(request.getAvatarUrl());

        Chat savedChat = chatRepository.save(chat);

        // Add creator as ADMIN
        ChatMember creatorMember = new ChatMember(savedChat, creator, MemberRole.ADMIN);
        chatMemberRepository.save(creatorMember);

        // Add members
        if (request.getMemberIds() != null) {
            for (UUID memberId : request.getMemberIds()) {
                if (!memberId.equals(currentUserId)) {
                    profileRepository.findById(memberId).ifPresent(user -> {
                        ChatMember member = new ChatMember(savedChat, user, MemberRole.MEMBER);
                        chatMemberRepository.save(member);
                    });
                }
            }
        }

        return buildChatResponse(savedChat, currentUserId);
    }

    @Transactional(readOnly = true)
    public ChatResponse getChatById(UUID chatId, UUID currentUserId) {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new ResourceNotFoundException("Chat not found with ID: " + chatId));

        if (!chatMemberRepository.existsByChatIdAndUserId(chatId, currentUserId)) {
            throw new UnauthorizedException("You are not a member of this chat");
        }

        return buildChatResponse(chat, currentUserId);
    }

    @Transactional
    public void togglePinChat(UUID chatId, UUID userId) {
        ChatMember member = chatMemberRepository.findByChatIdAndUserId(chatId, userId)
                .orElseThrow(() -> new UnauthorizedException("You are not a member of this chat"));
        member.setPinned(!member.isPinned());
        chatMemberRepository.save(member);
    }

    @Transactional
    public void toggleMuteChat(UUID chatId, UUID userId) {
        ChatMember member = chatMemberRepository.findByChatIdAndUserId(chatId, userId)
                .orElseThrow(() -> new UnauthorizedException("You are not a member of this chat"));
        member.setMuted(!member.isMuted());
        chatMemberRepository.save(member);
    }

    @Transactional
    public void toggleArchiveChat(UUID chatId, UUID userId) {
        ChatMember member = chatMemberRepository.findByChatIdAndUserId(chatId, userId)
                .orElseThrow(() -> new UnauthorizedException("You are not a member of this chat"));
        member.setArchived(!member.isArchived());
        chatMemberRepository.save(member);
    }

    public ChatResponse buildChatResponse(Chat chat, UUID currentUserId) {
        ChatResponse dto = new ChatResponse();
        dto.setId(chat.getId());
        dto.setType(chat.getType());
        dto.setName(chat.getName());
        dto.setDescription(chat.getDescription());
        dto.setAvatarUrl(chat.getAvatarUrl());
        dto.setUpdatedAt(chat.getUpdatedAt());

        List<ChatMember> members = chatMemberRepository.findByChatId(chat.getId());
        List<UserProfileResponse> memberDtos = members.stream()
                .map(m -> UserProfileResponse.fromEntity(m.getUser()))
                .collect(Collectors.toList());
        dto.setMembers(memberDtos);

        if (chat.getType() == ChatType.DIRECT) {
            members.stream()
                    .filter(m -> !m.getUser().getId().equals(currentUserId))
                    .findFirst()
                    .ifPresent(m -> {
                        Profile freshProfile = profileRepository.findById(m.getUser().getId()).orElse(m.getUser());
                        dto.setOtherUser(UserProfileResponse.fromEntity(freshProfile));
                    });
        }

        members.stream()
                .filter(m -> m.getUser().getId().equals(currentUserId))
                .findFirst()
                .ifPresent(m -> {
                    dto.setMuted(m.isMuted());
                    dto.setPinned(m.isPinned());
                    dto.setArchived(m.isArchived());
                });

        // Unread message count
        long unread = messageStatusRepository.countUnreadMessagesInChat(chat.getId(), currentUserId);
        dto.setUnreadCount(unread);

        // Fetch latest message
        List<Message> latest = messageRepository.findLatestMessageByChatId(chat.getId(), PageRequest.of(0, 1));
        if (!latest.isEmpty()) {
            Message msg = latest.get(0);
            MessageResponse msgDto = new MessageResponse();
            msgDto.setId(msg.getId());
            msgDto.setChatId(msg.getChat().getId());
            msgDto.setSender(UserProfileResponse.fromEntity(msg.getSender()));
            msgDto.setMessageType(msg.getMessageType());
            msgDto.setContent(msg.getContent());
            msgDto.setMediaUrl(msg.getMediaUrl());
            msgDto.setEdited(msg.isEdited());
            msgDto.setDeleted(msg.getDeletedAt() != null);
            msgDto.setCreatedAt(msg.getCreatedAt());
            dto.setLastMessage(msgDto);
        }

        return dto;
    }
}
