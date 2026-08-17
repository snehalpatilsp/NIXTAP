package com.nixtap.contactservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class ContactDownloadResponse {
    private Long id;
    private Long userId;
    private Long cardId;
    private String downloaderIp;
    private String userAgent;
    private LocalDateTime createdAt;
}
