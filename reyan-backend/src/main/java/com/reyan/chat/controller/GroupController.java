package com.reyan.chat.controller;

import com.reyan.chat.security.UserPrincipal;
import com.reyan.chat.service.GroupService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/groups")
public class GroupController {

    private final GroupService groupService;

    public GroupController(GroupService groupService) {
        this.groupService = groupService;
    }

    @PostMapping("/{groupId}/members/{userId}")
    public ResponseEntity<Void> addMember(
            @PathVariable("groupId") UUID groupId,
            @PathVariable("userId") UUID userId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        groupService.addMember(groupId, userId, userPrincipal.getId());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{groupId}/members/{userId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable("groupId") UUID groupId,
            @PathVariable("userId") UUID userId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        groupService.removeMember(groupId, userId, userPrincipal.getId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{groupId}/admins/{userId}")
    public ResponseEntity<Void> promoteAdmin(
            @PathVariable("groupId") UUID groupId,
            @PathVariable("userId") UUID userId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        groupService.promoteAdmin(groupId, userId, userPrincipal.getId());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{groupId}/admins/{userId}")
    public ResponseEntity<Void> demoteAdmin(
            @PathVariable("groupId") UUID groupId,
            @PathVariable("userId") UUID userId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        groupService.demoteAdmin(groupId, userId, userPrincipal.getId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{groupId}/leave")
    public ResponseEntity<Void> leaveGroup(
            @PathVariable("groupId") UUID groupId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        groupService.leaveGroup(groupId, userPrincipal.getId());
        return ResponseEntity.ok().build();
    }
}
