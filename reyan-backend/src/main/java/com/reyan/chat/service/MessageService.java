package com.reyan.chat.service;

import com.reyan.chat.dto.EditMessageRequest;
import com.reyan.chat.dto.MessageResponse;
import com.reyan.chat.dto.SendMessageRequest;
import com.reyan.chat.dto.UserProfileResponse;
import com.reyan.chat.exception.ResourceNotFoundException;
import com.reyan.chat.exception.UnauthorizedException;
import com.reyan.chat.model.entity.*;
import com.reyan.chat.model.enums.MessageDeliveryStatus;
import com.reyan.chat.repository.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class MessageService {

    private final MessageRepository messageRepository;
    private final ChatRepository chatRepository;
    private final ChatMemberRepository chatMemberRepository;
    private final ProfileRepository profileRepository;
    private final MessageStatusRepository messageStatusRepository;
    private final StarredMessageRepository starredMessageRepository;
    private final BlockedUserRepository blockedUserRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public MessageService(MessageRepository messageRepository,
                          ChatRepository chatRepository,
                          ChatMemberRepository chatMemberRepository,
                          ProfileRepository profileRepository,
                          MessageStatusRepository messageStatusRepository,
                          StarredMessageRepository starredMessageRepository,
                          BlockedUserRepository blockedUserRepository,
                          SimpMessagingTemplate messagingTemplate) {
        this.messageRepository = messageRepository;
        this.chatRepository = chatRepository;
        this.chatMemberRepository = chatMemberRepository;
        this.profileRepository = profileRepository;
        this.messageStatusRepository = messageStatusRepository;
        this.starredMessageRepository = starredMessageRepository;
        this.blockedUserRepository = blockedUserRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional
    public MessageResponse sendMessage(UUID senderId, SendMessageRequest request) {
        Chat chat = chatRepository.findById(request.getChatId())
                .orElseThrow(() -> new ResourceNotFoundException("Chat not found"));

        if (!chatMemberRepository.existsByChatIdAndUserId(chat.getId(), senderId)) {
            throw new UnauthorizedException("Sender is not a member of this chat");
        }

        Profile sender = profileRepository.findById(senderId)
                .orElseThrow(() -> new ResourceNotFoundException("Sender user not found"));

        Message message = new Message(chat, sender, request.getMessageType(), request.getContent());
        if (request.getMediaUrl() != null) message.setMediaUrl(request.getMediaUrl());
        if (request.getMediaFilename() != null) message.setMediaFilename(request.getMediaFilename());
        if (request.getMediaSize() != null) message.setMediaSize(request.getMediaSize());

        if (request.getReplyToMessageId() != null) {
            messageRepository.findById(request.getReplyToMessageId())
                    .ifPresent(message::setReplyToMessage);
        }

        Message savedMessage = messageRepository.save(message);

        // Touch chat updated_at timestamp
        chat.setUpdatedAt(OffsetDateTime.now());
        chatRepository.save(chat);

        // Initialize status records for all other members in chat
        List<UUID> memberUserIds = chatMemberRepository.findUserIdsByChatId(chat.getId());
        for (UUID memberUserId : memberUserIds) {
            if (!memberUserId.equals(senderId)) {
                Profile memberProfile = profileRepository.getReferenceById(memberUserId);
                MessageStatus status = new MessageStatus(savedMessage, memberProfile, MessageDeliveryStatus.SENT);
                messageStatusRepository.save(status);
            }
        }

        MessageResponse response = mapToMessageResponse(savedMessage, senderId);

        // Real-time WebSocket Broadcast to Chat topic & User topics
        try {
            messagingTemplate.convertAndSend("/topic/chat/" + chat.getId(), response);
            for (UUID memberUserId : memberUserIds) {
                if (!memberUserId.equals(senderId)) {
                    messagingTemplate.convertAndSend("/topic/user/" + memberUserId + "/messages", response);
                }
            }
        } catch (Exception e) {
            System.err.println("WebSocket message broadcast error: " + e.getMessage());
        }

        return response;
    }

    @Transactional(readOnly = true)
    public List<MessageResponse> getChatMessages(UUID chatId, UUID currentUserId) {
        if (!chatMemberRepository.existsByChatIdAndUserId(chatId, currentUserId)) {
            throw new UnauthorizedException("You are not a member of this chat");
        }

        List<Message> messages = messageRepository.findByChatIdOrderByCreatedAtAsc(chatId);
        return messages.stream()
                .map(m -> mapToMessageResponse(m, currentUserId))
                .collect(Collectors.toList());
    }

    @Transactional
    public MessageResponse editMessage(UUID messageId, UUID currentUserId, EditMessageRequest request) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found"));

        if (!message.getSender().getId().equals(currentUserId)) {
            throw new UnauthorizedException("You can only edit your own messages");
        }

        message.setContent(request.getContent());
        message.setEdited(true);
        Message updated = messageRepository.save(message);

        MessageResponse response = mapToMessageResponse(updated, currentUserId);

        // Real-time WebSocket Broadcast edit update
        try {
            messagingTemplate.convertAndSend("/topic/chat/" + message.getChat().getId(), response);
        } catch (Exception e) {
            System.err.println("WebSocket edit broadcast error: " + e.getMessage());
        }

        return response;
    }

    @Transactional
    public void deleteMessageForEveryone(UUID messageId, UUID currentUserId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found"));

        if (!message.getSender().getId().equals(currentUserId)) {
            throw new UnauthorizedException("You can only delete your own messages for everyone");
        }

        message.setDeletedAt(OffsetDateTime.now());
        message.setContent("This message was deleted");
        message.setMediaUrl(null);
        Message saved = messageRepository.save(message);

        MessageResponse response = mapToMessageResponse(saved, currentUserId);

        // Real-time WebSocket Broadcast deletion for everyone
        try {
            messagingTemplate.convertAndSend("/topic/chat/" + message.getChat().getId(), response);
        } catch (Exception e) {
            System.err.println("WebSocket delete broadcast error: " + e.getMessage());
        }
    }

    @Transactional
    public void markMessagesAsRead(UUID chatId, UUID currentUserId) {
        List<MessageStatus> unreadStatuses = messageStatusRepository.findUnreadStatusesInChat(chatId, currentUserId);
        for (MessageStatus status : unreadStatuses) {
            status.setStatus(MessageDeliveryStatus.READ);
            messageStatusRepository.save(status);
        }

        // Real-time WebSocket Broadcast read status update to sender
        try {
            Map<String, Object> statusEvent = new HashMap<>();
            statusEvent.put("chatId", chatId);
            statusEvent.put("userId", currentUserId);
            statusEvent.put("status", "READ");
            messagingTemplate.convertAndSend("/topic/chat/" + chatId + "/status", statusEvent);
        } catch (Exception e) {
            System.err.println("WebSocket status broadcast error: " + e.getMessage());
        }
    }

    @Transactional
    public void starMessage(UUID messageId, UUID currentUserId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found"));
        Profile user = profileRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!starredMessageRepository.existsByUserIdAndMessageId(currentUserId, messageId)) {
            StarredMessage starred = new StarredMessage(user, message);
            starredMessageRepository.save(starred);
        }
    }

    @Transactional
    public void unstarMessage(UUID messageId, UUID currentUserId) {
        starredMessageRepository.deleteByUserIdAndMessageId(currentUserId, messageId);
    }

    @Transactional(readOnly = true)
    public List<MessageResponse> searchMessages(UUID chatId, String query, UUID currentUserId) {
        List<Message> messages;
        if (chatId != null) {
            messages = messageRepository.searchMessagesInChat(chatId, query);
        } else {
            messages = messageRepository.searchGlobalMessages(currentUserId, query);
        }
        return messages.stream()
                .map(m -> mapToMessageResponse(m, currentUserId))
                .collect(Collectors.toList());
    }

    public MessageResponse mapToMessageResponse(Message message, UUID currentUserId) {
        MessageResponse dto = new MessageResponse();
        dto.setId(message.getId());
        dto.setChatId(message.getChat().getId());
        dto.setSender(UserProfileResponse.fromEntity(message.getSender()));
        dto.setMessageType(message.getMessageType());

        if (message.getDeletedAt() != null) {
            dto.setContent("This message was deleted");
            dto.setDeleted(true);
        } else {
            dto.setContent(message.getContent());
            dto.setMediaUrl(message.getMediaUrl());
            dto.setMediaFilename(message.getMediaFilename());
            dto.setMediaSize(message.getMediaSize());
        }

        if (message.getReplyToMessage() != null) {
            dto.setReplyToMessage(mapToMessageResponse(message.getReplyToMessage(), currentUserId));
        }

        dto.setEdited(message.isEdited());
        dto.setCreatedAt(message.getCreatedAt());
        dto.setUpdatedAt(message.getUpdatedAt());

        // Compute delivery status (if outgoing, pick status from MessageStatus)
        if (message.getSender().getId().equals(currentUserId)) {
            List<MessageStatus> statuses = messageStatusRepository.findByMessageId(message.getId());
            if (!statuses.isEmpty()) {
                boolean allRead = statuses.stream().allMatch(s -> s.getStatus() == MessageDeliveryStatus.READ);
                boolean anyDelivered = statuses.stream().anyMatch(s -> s.getStatus() == MessageDeliveryStatus.DELIVERED || s.getStatus() == MessageDeliveryStatus.READ);
                if (allRead) {
                    dto.setStatus(MessageDeliveryStatus.READ);
                } else if (anyDelivered) {
                    dto.setStatus(MessageDeliveryStatus.DELIVERED);
                } else {
                    dto.setStatus(MessageDeliveryStatus.SENT);
                }
            } else {
                dto.setStatus(MessageDeliveryStatus.SENT);
            }
        } else {
            dto.setStatus(MessageDeliveryStatus.READ);
        }

        boolean isStarred = starredMessageRepository.existsByUserIdAndMessageId(currentUserId, message.getId());
        dto.setStarred(isStarred);

        return dto;
    }
}
