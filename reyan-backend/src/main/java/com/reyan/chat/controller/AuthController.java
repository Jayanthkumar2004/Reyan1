package com.reyan.chat.controller;

import com.reyan.chat.dto.*;
import com.reyan.chat.security.UserPrincipal;
import com.reyan.chat.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/")
    public ResponseEntity<java.util.Map<String, String>> rootHealthCheck() {
        return ResponseEntity.ok(java.util.Map.of(
            "status", "UP",
            "app", "Reyan PWA Real-Time Chat Backend",
            "version", "1.0.0"
        ));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        AuthResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@AuthenticationPrincipal UserPrincipal userPrincipal,
                                      @RequestBody(required = false) RefreshTokenRequest request) {
        if (userPrincipal != null) {
            String refreshToken = request != null ? request.getRefreshToken() : null;
            authService.logout(userPrincipal.getId(), refreshToken);
        }
        return ResponseEntity.noContent().build();
    }
}
