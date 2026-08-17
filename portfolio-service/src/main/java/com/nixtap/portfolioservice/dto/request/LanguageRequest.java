package com.nixtap.portfolioservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class LanguageRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "Language name is required")
    private String name;

    @NotBlank(message = "Proficiency is required")
    private String proficiency;
}