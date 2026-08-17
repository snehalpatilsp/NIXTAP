package com.nixtap.themeservice.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ApplyThemeRequest {

    @NotNull(message = "userId is required")
    private Long userId;

    @NotNull(message = "cardId is required")
    private Long cardId;

    @NotNull(message = "themeId is required")
    private Long themeId;
}
