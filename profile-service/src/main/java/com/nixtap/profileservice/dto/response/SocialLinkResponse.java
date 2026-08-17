package com.nixtap.profileservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class SocialLinkResponse {
    private Long id;
    private Long userId;
    private Long cardId;
    private String platform;
    private String url;
    private String displayLabel;
    private String iconClass;
    private boolean isVisible;
    private Integer sortOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
