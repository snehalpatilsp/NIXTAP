package com.nixtap.feedbackservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class FeedbackResponse {
    private Long id;
    private Long cardId;
    private Long ownerId;
    private String visitorName;
    private String visitorEmail;
    private Integer rating;
    private String comment;
    private boolean isApproved;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
