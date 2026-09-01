package com.reyan.chat.controller;

import com.reyan.chat.dto.ChatResponse;
import com.reyan.chat.dto.CreateDirectChatRequest;
import com.reyan.chat.dto.CreateGroupChatRequest;
import com.reyan.chat.security.UserPrincipal;
import com.reyan.chat.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/chats")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @GetMapping
    public ResponseEntity<List<ChatResponse>> getUserChats(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<ChatResponse> chats = chatService.getUserChats(userPrincipal.getId());
        return ResponseEntity.ok(chats);
    }

    @PostMapping("/direct")
    public ResponseEntity<ChatResponse> createDirectChat(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody CreateDirectChatRequest request) {
        ChatResponse chat = chatService.getOrCreateDirectChat(userPrincipal.getId(), request);
        return ResponseEntity.ok(chat);
    }

    @PostMapping("/group")
    public ResponseEntity<ChatResponse> createGroupChat(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody CreateGroupChatRequest request) {
        ChatResponse chat = chatService.createGroupChat(userPrincipal.getId(), request);
        return ResponseEntity.ok(chat);
    }

    @GetMapping("/{chatId}")
    public ResponseEntity<ChatResponse> getChatById(
            @PathVariable("chatId") UUID chatId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        ChatResponse chat = chatService.getChatById(chatId, userPrincipal.getId());
        return ResponseEntity.ok(chat);
    }

    @PutMapping("/{chatId}/pin")
    public ResponseEntity<Void> pinChat(
            @PathVariable("chatId") UUID chatId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        chatService.togglePinChat(chatId, userPrincipal.getId());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{chatId}/mute")
    public ResponseEntity<Void> muteChat(
            @PathVariable("chatId") UUID chatId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        chatService.toggleMuteChat(chatId, userPrincipal.getId());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{chatId}/archive")
    public ResponseEntity<Void> archiveChat(
            @PathVariable("chatId") UUID chatId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        chatService.toggleArchiveChat(chatId, userPrincipal.getId());
        return ResponseEntity.ok().build();
    }
}
