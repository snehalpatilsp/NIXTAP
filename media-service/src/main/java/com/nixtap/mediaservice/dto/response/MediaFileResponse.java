package com.nixtap.mediaservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class MediaFileResponse {
    private Long   id;
    private Long   userId;
    private String mediaType;
    private Long   referenceId;
    private String fileName;
    private String originalName;
    private String mimeType;
    private Long   fileSize;
    /** The URL to store in other services and use for display. */
    private String publicUrl;
    private LocalDateTime createdAt;
}
