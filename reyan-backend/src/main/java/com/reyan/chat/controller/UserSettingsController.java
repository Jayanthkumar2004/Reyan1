package com.reyan.chat.controller;

import com.reyan.chat.dto.UpdateSettingsRequest;
import com.reyan.chat.dto.UserSettingsResponse;
import com.reyan.chat.security.UserPrincipal;
import com.reyan.chat.service.UserSettingsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/settings")
public class UserSettingsController {

    private final UserSettingsService userSettingsService;

    public UserSettingsController(UserSettingsService userSettingsService) {
        this.userSettingsService = userSettingsService;
    }

    @GetMapping
    public ResponseEntity<UserSettingsResponse> getSettings(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        UserSettingsResponse response = userSettingsService.getSettings(userPrincipal.getId());
        return ResponseEntity.ok(response);
    }

    @PutMapping
    public ResponseEntity<UserSettingsResponse> updateSettings(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody UpdateSettingsRequest request) {
        UserSettingsResponse response = userSettingsService.updateSettings(userPrincipal.getId(), request);
        return ResponseEntity.ok(response);
    }
}
