package com.reyan.chat.controller;

import com.reyan.chat.dto.UpdateProfileRequest;
import com.reyan.chat.dto.UserProfileResponse;
import com.reyan.chat.security.UserPrincipal;
import com.reyan.chat.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getCurrentUser(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        UserProfileResponse response = userService.getUserProfile(userPrincipal.getId());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/me")
    public ResponseEntity<UserProfileResponse> updateProfile(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody UpdateProfileRequest request) {
        UserProfileResponse response = userService.updateProfile(userPrincipal.getId(), request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    public ResponseEntity<List<UserProfileResponse>> searchUsers(
            @RequestParam("query") String query,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<UserProfileResponse> results = userService.searchUsers(query, userPrincipal.getId());
        return ResponseEntity.ok(results);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserProfileResponse> getUserById(@PathVariable("userId") UUID userId) {
        UserProfileResponse response = userService.getUserProfile(userId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/presence")
    public ResponseEntity<Void> updatePresence(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody java.util.Map<String, Boolean> request) {
        Boolean isOnline = request.get("isOnline");
        if (isOnline != null) {
            userService.updateOnlinePresence(userPrincipal.getId(), isOnline);
        }
        return ResponseEntity.ok().build();
    }
}
