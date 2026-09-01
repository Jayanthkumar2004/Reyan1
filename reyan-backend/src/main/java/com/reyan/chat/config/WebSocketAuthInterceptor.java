package com.reyan.chat.config;

import com.reyan.chat.security.CustomUserDetailsService;
import com.reyan.chat.security.JwtTokenProvider;
import com.reyan.chat.security.UserPrincipal;
import com.reyan.chat.service.PresenceService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.UUID;

@Component
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketAuthInterceptor.class);

    private final JwtTokenProvider tokenProvider;
    private final CustomUserDetailsService customUserDetailsService;
    private final PresenceService presenceService;

    public WebSocketAuthInterceptor(JwtTokenProvider tokenProvider,
                                   CustomUserDetailsService customUserDetailsService,
                                   @Lazy PresenceService presenceService) {
        this.tokenProvider = tokenProvider;
        this.customUserDetailsService = customUserDetailsService;
        this.presenceService = presenceService;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null) {
            if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                String token = accessor.getFirstNativeHeader("Authorization");
                if (!StringUtils.hasText(token)) {
                    token = accessor.getFirstNativeHeader("token");
                }

                if (StringUtils.hasText(token) && token.startsWith("Bearer ")) {
                    token = token.substring(7);
                }

                if (StringUtils.hasText(token) && tokenProvider.validateToken(token)) {
                    UUID userId = tokenProvider.getUserIdFromJWT(token);
                    UserDetails userDetails = customUserDetailsService.loadUserById(userId);
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

                    accessor.setUser(authentication);
                    presenceService.userConnected(userId, accessor.getSessionId());
                    logger.info("WebSocket user authenticated: {} (sessionId={})", userDetails.getUsername(), accessor.getSessionId());
                } else {
                    logger.warn("WebSocket CONNECT attempted without valid JWT token");
                }
            } else if (StompCommand.DISCONNECT.equals(accessor.getCommand())) {
                if (accessor.getUser() instanceof UsernamePasswordAuthenticationToken auth) {
                    if (auth.getPrincipal() instanceof UserPrincipal userPrincipal) {
                        presenceService.userDisconnected(userPrincipal.getId(), accessor.getSessionId());
                        logger.info("WebSocket session disconnected: {} (sessionId={})", userPrincipal.getUsername(), accessor.getSessionId());
                    }
                }
            }
        }
        return message;
    }
}
