package com.nixtap.feedbackservice.controller;

import com.nixtap.feedbackservice.dto.request.FeedbackRequest;
import com.nixtap.feedbackservice.dto.response.ApiResponse;
import com.nixtap.feedbackservice.dto.response.FeedbackResponse;
import com.nixtap.feedbackservice.dto.response.FeedbackSummaryResponse;
import com.nixtap.feedbackservice.service.FeedbackService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/feedback")
@RequiredArgsConstructor
@Tag(name = "Feedback Management", description = "Visitor ratings and comments for NIXTAP business cards")
public class FeedbackController {

    private final FeedbackService service;

    @PostMapping
    @Operation(summary = "Submit feedback for a business card (public)")
    public ResponseEntity<ApiResponse<FeedbackResponse>> submit(
            @Valid @RequestBody FeedbackRequest request, HttpServletRequest httpRequest) {
        request.setVisitorIp(resolveIp(httpRequest));
        return new ResponseEntity<>(ApiResponse.success("Feedback submitted — pending approval",
                service.submitFeedback(request)), HttpStatus.CREATED);
    }

    @GetMapping("/card/{cardId}")
    @Operation(summary = "Get approved feedback for a card (public)")
    public ResponseEntity<ApiResponse<List<FeedbackResponse>>> getApproved(@PathVariable Long cardId) {
        return ResponseEntity.ok(ApiResponse.success("Feedback retrieved", service.getApprovedFeedback(cardId)));
    }

    @GetMapping("/card/{cardId}/all")
    @Operation(summary = "Get all feedback for a card including unapproved (owner only)")
    public ResponseEntity<ApiResponse<List<FeedbackResponse>>> getAll(@PathVariable Long cardId) {
        return ResponseEntity.ok(ApiResponse.success("All feedback retrieved", service.getAllFeedback(cardId)));
    }

    @GetMapping("/card/{cardId}/summary")
    @Operation(summary = "Get feedback summary — average rating and counts (public)")
    public ResponseEntity<ApiResponse<FeedbackSummaryResponse>> getSummary(@PathVariable Long cardId) {
        return ResponseEntity.ok(ApiResponse.success("Summary retrieved", service.getSummary(cardId)));
    }

    @PutMapping("/{id}/approve")
    @Operation(summary = "Approve a feedback entry (owner only)")
    public ResponseEntity<ApiResponse<FeedbackResponse>> approve(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Feedback approved", service.approve(id)));
    }

    @PutMapping("/{id}/reject")
    @Operation(summary = "Reject/hide a feedback entry (owner only)")
    public ResponseEntity<ApiResponse<FeedbackResponse>> reject(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Feedback rejected", service.reject(id)));
    }

    @GetMapping("/owner/{ownerId}")
    @Operation(summary = "Get all feedback across owner's cards (owner only)")
    public ResponseEntity<ApiResponse<List<FeedbackResponse>>> getByOwner(@PathVariable Long ownerId) {
        return ResponseEntity.ok(ApiResponse.success("Owner feedback retrieved", service.getFeedbackByOwner(ownerId)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a feedback entry (owner only)")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.deleteFeedback(id);
        return ResponseEntity.ok(ApiResponse.success("Feedback deleted", null));
    }

    private String resolveIp(HttpServletRequest req) {
        String forwarded = req.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(forwarded)) return forwarded.split(",")[0].trim();
        String realIp = req.getHeader("X-Real-IP");
        if (StringUtils.hasText(realIp)) return realIp.trim();
        return req.getRemoteAddr();
    }
}
