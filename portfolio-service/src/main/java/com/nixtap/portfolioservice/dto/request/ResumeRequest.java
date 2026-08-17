package com.nixtap.portfolioservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ResumeRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "Resume title is required")
    private String title;

    @NotBlank(message = "File URL is required")
    private String fileUrl;
}