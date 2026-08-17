package com.nixtap.feedbackservice.service;

import com.nixtap.feedbackservice.dto.request.FeedbackRequest;
import com.nixtap.feedbackservice.dto.response.FeedbackResponse;
import com.nixtap.feedbackservice.dto.response.FeedbackSummaryResponse;

import java.util.List;

public interface FeedbackService {
    FeedbackResponse submitFeedback(FeedbackRequest request);
    List<FeedbackResponse> getApprovedFeedback(Long cardId);
    List<FeedbackResponse> getAllFeedback(Long cardId);
    FeedbackSummaryResponse getSummary(Long cardId);
    FeedbackResponse approve(Long id);
    FeedbackResponse reject(Long id);
    List<FeedbackResponse> getFeedbackByOwner(Long ownerId);
    void deleteFeedback(Long id);
}
