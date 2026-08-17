package com.nixtap.mediaservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class StorageStatsResponse {
    private Long userId;
    private long totalFiles;
    private long totalSizeBytes;
    private String totalSizeReadable;   // e.g. "2.4 MB"
}
