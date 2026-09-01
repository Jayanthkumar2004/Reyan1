package com.reyan.chat.controller;

import com.reyan.chat.dto.UserProfileResponse;
import com.reyan.chat.security.UserPrincipal;
import com.reyan.chat.service.BlockService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/blocks")
public class BlockController {

    private final BlockService blockService;

    public BlockController(BlockService blockService) {
        this.blockService = blockService;
    }

    @GetMapping
    public ResponseEntity<List<UserProfileResponse>> getBlockedUsers(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<UserProfileResponse> blockedUsers = blockService.getBlockedUsers(userPrincipal.getId());
        return ResponseEntity.ok(blockedUsers);
    }

    @PostMapping("/{userId}")
    public ResponseEntity<Void> blockUser(
            @PathVariable("userId") UUID userId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        blockService.blockUser(userPrincipal.getId(), userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> unblockUser(
            @PathVariable("userId") UUID userId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        blockService.unblockUser(userPrincipal.getId(), userId);
        return ResponseEntity.noContent().build();
    }
}
