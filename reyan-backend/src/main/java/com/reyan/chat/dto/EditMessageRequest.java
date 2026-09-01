package com.reyan.chat.dto;

import jakarta.validation.constraints.NotBlank;

public class EditMessageRequest {

    @NotBlank(message = "Message content is required")
    private String content;

    public EditMessageRequest() {}

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}
