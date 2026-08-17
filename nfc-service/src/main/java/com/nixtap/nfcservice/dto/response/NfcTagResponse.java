package com.nixtap.nfcservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class NfcTagResponse {
    private Long id;
    private Long userId;
    private Long cardId;
    private String tagUid;
    private String tagType;
    private String status;
    private String linkedUrl;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
