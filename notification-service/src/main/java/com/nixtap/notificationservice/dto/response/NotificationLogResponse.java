package com.nixtap.notificationservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class NotificationLogResponse {
    private Long id;
    private Long userId;
    private String channel;
    private String type;
    private String subject;
    private String body;
    private String status;
    private boolean isRead;
    private LocalDateTime sentAt;
}
