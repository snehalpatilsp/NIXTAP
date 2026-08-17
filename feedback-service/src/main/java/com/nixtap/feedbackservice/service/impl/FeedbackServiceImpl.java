package com.nixtap.feedbackservice.service.impl;

import com.nixtap.feedbackservice.dto.request.FeedbackRequest;
import com.nixtap.feedbackservice.dto.response.FeedbackResponse;
import com.nixtap.feedbackservice.dto.response.FeedbackSummaryResponse;
import com.nixtap.feedbackservice.entity.Feedback;
import com.nixtap.feedbackservice.exception.FeedbackAccessDeniedException;
import com.nixtap.feedbackservice.exception.ResourceNotFoundException;
import com.nixtap.feedbackservice.mapper.FeedbackMapper;
import com.nixtap.feedbackservice.repository.FeedbackRepository;
import com.nixtap.feedbackservice.security.AuthenticatedUser;
import com.nixtap.feedbackservice.service.FeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service @RequiredArgsConstructor @SuppressWarnings("null")
public class FeedbackServiceImpl implements FeedbackService {

    private final FeedbackRepository repository;
    private final FeedbackMapper     mapper;

    private Long getAuthenticatedUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof AuthenticatedUser principal)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required.");
        }
        return principal.getUserId();
    }

    private void assertOwner(Feedback fb) {
        if (!fb.getOwnerId().equals(getAuthenticatedUserId())) {
            throw new FeedbackAccessDeniedException("You do not have permission to manage this feedback.");
        }
    }

    @Override @Transactional
    public FeedbackResponse submitFeedback(FeedbackRequest request) {
        Feedback fb = Feedback.builder()
                .cardId(request.getCardId()).ownerId(request.getOwnerId())
                .visitorName(request.getVisitorName()).visitorEmail(request.getVisitorEmail())
                .rating(request.getRating()).comment(request.getComment())
                .visitorIp(request.getVisitorIp()).build();
        return mapper.toResponse(repository.save(fb));
    }

    @Override @Transactional(readOnly = true)
    public List<FeedbackResponse> getApprovedFeedback(Long cardId) {
        return repository.findByCardIdAndIsApprovedTrueOrderByCreatedAtDesc(cardId)
                .stream().map(mapper::toResponse).toList();
    }

    @Override @Transactional(readOnly = true)
    public List<FeedbackResponse> getAllFeedback(Long cardId) {
        Long callerId = getAuthenticatedUserId();
        List<Feedback> list = repository.findByCardIdOrderByCreatedAtDesc(cardId);
        if (!list.isEmpty() && !list.get(0).getOwnerId().equals(callerId)) {
            throw new FeedbackAccessDeniedException("You can only view all feedback for your own cards.");
        }
        return list.stream().map(mapper::toResponse).toList();
    }

    @Override @Transactional(readOnly = true)
    public FeedbackSummaryResponse getSummary(Long cardId) {
        long total    = repository.countByCardId(cardId);
        long approved = repository.countByCardIdAndIsApprovedTrue(cardId);
        Double avg    = repository.averageRatingByCardId(cardId);
        return FeedbackSummaryResponse.builder()
                .cardId(cardId).totalFeedback(total).approvedFeedback(approved)
                .averageRating(avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0).build();
    }

    @Override @Transactional
    public FeedbackResponse approve(Long id) {
        Feedback fb = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback not found: " + id));
        assertOwner(fb);
        fb.setApproved(true);
        return mapper.toResponse(repository.save(fb));
    }

    @Override @Transactional
    public FeedbackResponse reject(Long id) {
        Feedback fb = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback not found: " + id));
        assertOwner(fb);
        fb.setApproved(false);
        return mapper.toResponse(repository.save(fb));
    }

    @Override @Transactional(readOnly = true)
    public List<FeedbackResponse> getFeedbackByOwner(Long ownerId) {
        Long callerId = getAuthenticatedUserId();
        if (!ownerId.equals(callerId)) {
            throw new FeedbackAccessDeniedException("You can only view your own feedback.");
        }
        return repository.findByOwnerIdOrderByCreatedAtDesc(ownerId)
                .stream().map(mapper::toResponse).toList();
    }

    @Override @Transactional
    public void deleteFeedback(Long id) {
        Feedback fb = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback not found: " + id));
        assertOwner(fb);
        repository.delete(fb);
    }
}
