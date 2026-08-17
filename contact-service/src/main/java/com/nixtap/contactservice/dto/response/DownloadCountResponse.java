package com.nixtap.contactservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class DownloadCountResponse {
    private Long userId;
    private Long cardId;
    private long totalDownloads;
}
