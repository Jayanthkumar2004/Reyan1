package com.reyan.chat.controller;

import com.reyan.chat.dto.EditMessageRequest;
import com.reyan.chat.dto.MessageResponse;
import com.reyan.chat.dto.SendMessageRequest;
import com.reyan.chat.security.UserPrincipal;
import com.reyan.chat.service.MessageService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/messages")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    @GetMapping("/chat/{chatId}")
    public ResponseEntity<List<MessageResponse>> getChatMessages(
            @PathVariable("chatId") UUID chatId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<MessageResponse> messages = messageService.getChatMessages(chatId, userPrincipal.getId());
        return ResponseEntity.ok(messages);
    }

    @PostMapping
    public ResponseEntity<MessageResponse> sendMessage(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody SendMessageRequest request) {
        MessageResponse message = messageService.sendMessage(userPrincipal.getId(), request);
        return ResponseEntity.ok(message);
    }

    @PutMapping("/{messageId}")
    public ResponseEntity<MessageResponse> editMessage(
            @PathVariable("messageId") UUID messageId,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody EditMessageRequest request) {
        MessageResponse updated = messageService.editMessage(messageId, userPrincipal.getId(), request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{messageId}")
    public ResponseEntity<Void> deleteMessageForEveryone(
            @PathVariable("messageId") UUID messageId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        messageService.deleteMessageForEveryone(messageId, userPrincipal.getId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/chat/{chatId}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable("chatId") UUID chatId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        messageService.markMessagesAsRead(chatId, userPrincipal.getId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{messageId}/star")
    public ResponseEntity<Void> starMessage(
            @PathVariable("messageId") UUID messageId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        messageService.starMessage(messageId, userPrincipal.getId());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{messageId}/star")
    public ResponseEntity<Void> unstarMessage(
            @PathVariable("messageId") UUID messageId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        messageService.unstarMessage(messageId, userPrincipal.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<MessageResponse>> searchMessages(
            @RequestParam(name = "chatId", required = false) UUID chatId,
            @RequestParam(name = "query") String query,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<MessageResponse> results = messageService.searchMessages(chatId, query, userPrincipal.getId());
        return ResponseEntity.ok(results);
    }
}
