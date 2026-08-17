package com.nixtap.businesscardservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class UserThemeSelectionResponse {
    private Long id;
    private Long userId;
    private Long cardId;
    private Long themeId;
    private ThemeResponse theme;
    private LocalDateTime appliedAt;
}
