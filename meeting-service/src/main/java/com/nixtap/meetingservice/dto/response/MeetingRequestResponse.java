package com.nixtap.meetingservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class MeetingRequestResponse {
    private Long id;
    private Long ownerId;
    private Long cardId;
    private String requesterName;
    private String requesterEmail;
    private String requesterPhone;
    private String purpose;
    private LocalDate preferredDate;
    private String preferredTime;
    private String message;
    private String status;
    private String ownerNote;
    /** Returned on creation so the requester can use it for token-based cancellation. */
    private String cancelToken;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
