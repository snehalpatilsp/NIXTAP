package com.nixtap.analyticsservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AnalyticsEventResponse {

    private Long id;
    private String ownerId;
    private String targetType;
    private String targetId;
    private String eventType;
    private String ipAddress;
    private String userAgent;
    private String deviceType;
    private String browser;
    private String referrer;
    private LocalDateTime createdAt;
}
