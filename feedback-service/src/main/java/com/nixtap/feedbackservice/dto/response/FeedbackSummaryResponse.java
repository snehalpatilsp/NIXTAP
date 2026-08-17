package com.nixtap.feedbackservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class FeedbackSummaryResponse {
    private Long cardId;
    private long totalFeedback;
    private long approvedFeedback;
    private double averageRating;
}
