package com.nixtap.adminservice.dto.feign;

import lombok.Data;

@Data
public class FeedbackSummary {
    private Long id;
    private Long cardId;
    private String visitorName;
    private Integer rating;
    private String comment;
    private boolean isApproved;
}
