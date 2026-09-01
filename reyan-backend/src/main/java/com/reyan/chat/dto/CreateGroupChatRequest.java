package com.reyan.chat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;
import java.util.UUID;

public class CreateGroupChatRequest {

    @NotBlank(message = "Group name is required")
    private String name;

    private String description;
    private String avatarUrl;

    @NotEmpty(message = "Member IDs list cannot be empty")
    private List<UUID> memberIds;

    public CreateGroupChatRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public List<UUID> getMemberIds() { return memberIds; }
    public void setMemberIds(List<UUID> memberIds) { this.memberIds = memberIds; }
}
