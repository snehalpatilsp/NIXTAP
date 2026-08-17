package com.nixtap.adminservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class AdminDashboardResponse {
    private long totalUsers;
    private long totalCards;
    private long totalQrCodes;
    private long totalNfcTags;
    private long totalAnalyticsEvents;
    private long totalFeedback;
    private long totalMeetingRequests;
    private long pendingMeetingRequests;
    private long pendingFeedback;
}
