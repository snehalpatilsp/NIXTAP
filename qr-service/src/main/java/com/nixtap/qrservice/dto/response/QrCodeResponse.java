package com.nixtap.qrservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class QrCodeResponse {

    private Long id;
    private Long userId;
    private Long cardId;
    private String qrCodePath;
    private String targetUrl;
    private String foregroundColor;
    private String backgroundColor;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
