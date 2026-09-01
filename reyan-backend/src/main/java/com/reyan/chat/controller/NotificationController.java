package com.reyan.chat.controller;

import com.reyan.chat.security.UserPrincipal;
import com.reyan.chat.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @PostMapping("/device-token")
    public ResponseEntity<Void> registerDeviceToken(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody Map<String, String> body) {
        String token = body.get("token");
        String deviceType = body.getOrDefault("deviceType", "WEB_PWA");
        if (token != null && !token.isEmpty()) {
            notificationService.registerDeviceToken(userPrincipal.getId(), token, deviceType);
        }
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/device-token")
    public ResponseEntity<Void> removeDeviceToken(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody Map<String, String> body) {
        String token = body.get("token");
        if (token != null && !token.isEmpty()) {
            notificationService.removeDeviceToken(userPrincipal.getId(), token);
        }
        return ResponseEntity.noContent().build();
    }
}
