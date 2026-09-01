package com.reyan.chat.service;

import com.reyan.chat.dto.*;
import com.reyan.chat.exception.BadRequestException;
import com.reyan.chat.exception.ResourceNotFoundException;
import com.reyan.chat.exception.UnauthorizedException;
import com.reyan.chat.model.entity.Profile;
import com.reyan.chat.model.entity.RefreshToken;
import com.reyan.chat.model.entity.UserSettings;
import com.reyan.chat.repository.ProfileRepository;
import com.reyan.chat.repository.RefreshTokenRepository;
import com.reyan.chat.repository.UserSettingsRepository;
import com.reyan.chat.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
public class AuthService {

    private final ProfileRepository profileRepository;
    private final UserSettingsRepository userSettingsRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    @Value("${app.jwt.refresh-expiration-ms}")
    private long refreshExpirationMs;

    private final PresenceService presenceService;

    public AuthService(ProfileRepository profileRepository,
                       UserSettingsRepository userSettingsRepository,
                       RefreshTokenRepository refreshTokenRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider,
                       PresenceService presenceService) {
        this.profileRepository = profileRepository;
        this.userSettingsRepository = userSettingsRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.presenceService = presenceService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (profileRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username is already taken");
        }
        if (profileRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        Profile profile = new Profile(
                request.getUsername(),
                request.getFullName(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword())
        );

        if (request.getPhone() != null) profile.setPhone(request.getPhone());
        if (request.getAvatarUrl() != null) profile.setAvatarUrl(request.getAvatarUrl());

        Profile savedProfile = profileRepository.save(profile);

        // Create default settings for user
        UserSettings settings = new UserSettings(savedProfile);
        userSettingsRepository.save(settings);

        String accessToken = tokenProvider.generateTokenFromUserId(savedProfile.getId());
        String refreshToken = createRefreshToken(savedProfile).getToken();

        return new AuthResponse(accessToken, refreshToken, UserProfileResponse.fromEntity(savedProfile));
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsernameOrEmail(), request.getPassword())
        );

        Profile profile = profileRepository.findByUsername(request.getUsernameOrEmail())
                .orElseGet(() -> profileRepository.findByEmail(request.getUsernameOrEmail())
                        .orElseThrow(() -> new ResourceNotFoundException("User not found")));

        presenceService.setOnlineStatus(profile.getId(), true);

        String accessToken = tokenProvider.generateToken(authentication);
        String refreshToken = createRefreshToken(profile).getToken();

        return new AuthResponse(accessToken, refreshToken, UserProfileResponse.fromEntity(profile));
    }

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken token = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        if (token.getExpiryDate().isBefore(OffsetDateTime.now())) {
            refreshTokenRepository.delete(token);
            throw new UnauthorizedException("Refresh token has expired. Please log in again.");
        }

        Profile user = token.getUser();
        String newAccessToken = tokenProvider.generateTokenFromUserId(user.getId());

        return new AuthResponse(newAccessToken, token.getToken(), UserProfileResponse.fromEntity(user));
    }

    @Transactional
    public void logout(UUID userId, String refreshToken) {
        presenceService.setOnlineStatus(userId, false);

        if (refreshToken != null) {
            refreshTokenRepository.deleteByToken(refreshToken);
        } else {
            refreshTokenRepository.deleteByUserId(userId);
        }
    }

    private RefreshToken createRefreshToken(Profile user) {
        refreshTokenRepository.deleteByUserId(user.getId());

        RefreshToken refreshToken = new RefreshToken(
                user,
                UUID.randomUUID().toString(),
                OffsetDateTime.now().plusSeconds(refreshExpirationMs / 1000)
        );

        return refreshTokenRepository.save(refreshToken);
    }
}
