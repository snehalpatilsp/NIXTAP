package com.nixtap.meetingservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class MeetingStatsResponse {
    private Long ownerId;
    private long totalRequests;
    private long pendingRequests;
    private long acceptedRequests;
    private long rejectedRequests;
    private long cancelledRequests;
}
