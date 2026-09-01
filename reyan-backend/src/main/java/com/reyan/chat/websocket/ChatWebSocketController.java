package com.reyan.chat.websocket;

import com.reyan.chat.dto.*;
import com.reyan.chat.security.UserPrincipal;
import com.reyan.chat.service.MessageService;
import com.reyan.chat.service.NotificationService;
import com.reyan.chat.service.PresenceService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.UUID;

@Controller
public class ChatWebSocketController {

    private static final Logger logger = LoggerFactory.getLogger(ChatWebSocketController.class);

    private final MessageService messageService;
    private final PresenceService presenceService;
    private final NotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatWebSocketController(MessageService messageService,
                                  PresenceService presenceService,
                                  NotificationService notificationService,
                                  SimpMessagingTemplate messagingTemplate) {
        this.messageService = messageService;
        this.presenceService = presenceService;
        this.notificationService = notificationService;
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload SendMessageRequest request, Principal principal) {
        if (principal == null) return;
        UserPrincipal userPrincipal = (UserPrincipal) ((Authentication) principal).getPrincipal();
        UUID senderId = userPrincipal.getId();

        logger.info("STOMP WebSocket message received from user {} for chat {}", senderId, request.getChatId());

        MessageResponse response = messageService.sendMessage(senderId, request);

        // Broadcast to chat topic for active receivers
        messagingTemplate.convertAndSend("/topic/chat/" + request.getChatId(), response);
    }

    @MessageMapping("/typing")
    public void handleTyping(@Payload TypingEvent event, Principal principal) {
        if (principal == null) return;
        UserPrincipal userPrincipal = (UserPrincipal) ((Authentication) principal).getPrincipal();
        event.setUserId(userPrincipal.getId());
        event.setUsername(userPrincipal.getUsername());

        messagingTemplate.convertAndSend("/topic/chat/" + event.getChatId() + "/typing", event);
    }

    @MessageMapping("/message.read")
    public void handleMessageRead(@Payload MessageStatusEvent event, Principal principal) {
        if (principal == null) return;
        UserPrincipal userPrincipal = (UserPrincipal) ((Authentication) principal).getPrincipal();
        
        messageService.markMessagesAsRead(event.getChatId(), userPrincipal.getId());

        event.setUserId(userPrincipal.getId());
        messagingTemplate.convertAndSend("/topic/chat/" + event.getChatId() + "/status", event);
    }

    @MessageMapping("/presence")
    public void handlePresence(@Payload PresenceEvent event, Principal principal) {
        if (principal == null) return;
        UserPrincipal userPrincipal = (UserPrincipal) ((Authentication) principal).getPrincipal();

        presenceService.setOnlineStatus(userPrincipal.getId(), event.isOnline());
        event.setUserId(userPrincipal.getId());

        messagingTemplate.convertAndSend("/topic/user/" + userPrincipal.getId() + "/presence", event);
    }
}
