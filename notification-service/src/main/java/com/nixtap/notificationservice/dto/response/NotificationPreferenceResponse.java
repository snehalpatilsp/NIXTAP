package com.nixtap.notificationservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class NotificationPreferenceResponse {
    private Long id;
    private Long userId;
    private boolean emailEnabled;
    private boolean smsEnabled;
    private boolean pushEnabled;
    private boolean notifyOnView;
    private boolean notifyOnMeetingRequest;
    private boolean notifyOnFeedback;
    private LocalDateTime updatedAt;
}
