package com.nixtap.feedbackservice.service;

import com.nixtap.feedbackservice.dto.request.FeedbackRequest;
import com.nixtap.feedbackservice.dto.response.FeedbackResponse;
import com.nixtap.feedbackservice.dto.response.FeedbackSummaryResponse;
import com.nixtap.feedbackservice.entity.Feedback;
import com.nixtap.feedbackservice.exception.FeedbackAccessDeniedException;
import com.nixtap.feedbackservice.exception.ResourceNotFoundException;
import com.nixtap.feedbackservice.mapper.FeedbackMapper;
import com.nixtap.feedbackservice.repository.FeedbackRepository;
import com.nixtap.feedbackservice.security.AuthenticatedUser;
import com.nixtap.feedbackservice.service.impl.FeedbackServiceImpl;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class) @SuppressWarnings("null")
class FeedbackServiceTest {

    @Mock private FeedbackRepository repository;
    @Mock private FeedbackMapper     mapper;
    @InjectMocks private FeedbackServiceImpl service;

    private static final Long OWNER_ID = 1L;
    private static final Long CARD_ID  = 10L;

    private Feedback buildFb(Long ownerId, boolean approved) {
        return Feedback.builder().id(1L).cardId(CARD_ID).ownerId(ownerId)
                .visitorName("John").rating(5).isApproved(approved).build();
    }

    private void authenticateAs(Long userId) {
        AuthenticatedUser p = new AuthenticatedUser(userId, "test@nixtap.com");
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(p, null, List.of()));
    }

    @BeforeEach void setUp()    { authenticateAs(OWNER_ID); }
    @AfterEach  void tearDown() { SecurityContextHolder.clearContext(); }

    @Test @DisplayName("submitFeedback() — saves and returns unapproved feedback")
    void submitFeedback_Success() {
        FeedbackRequest req = new FeedbackRequest();
        req.setCardId(CARD_ID); req.setOwnerId(OWNER_ID);
        req.setVisitorName("Alice"); req.setRating(4);
        Feedback saved = buildFb(OWNER_ID, false);
        FeedbackResponse resp = FeedbackResponse.builder().id(1L).rating(4).build();
        when(repository.save(any())).thenReturn(saved);
        when(mapper.toResponse(saved)).thenReturn(resp);
        FeedbackResponse result = service.submitFeedback(req);
        assertNotNull(result);
        verify(repository).save(any(Feedback.class));
    }

    @Test @DisplayName("approve() — sets isApproved=true (owner)")
    void approve_Success() {
        Feedback fb = buildFb(OWNER_ID, false);
        FeedbackResponse resp = FeedbackResponse.builder().id(1L).isApproved(true).build();
        when(repository.findById(1L)).thenReturn(Optional.of(fb));
        when(repository.save(fb)).thenReturn(fb);
        when(mapper.toResponse(fb)).thenReturn(resp);
        FeedbackResponse result = service.approve(1L);
        assertTrue(result.isApproved());
    }

    @Test @DisplayName("approve() — throws FeedbackAccessDeniedException when not owner")
    void approve_ThrowsAccessDenied_WhenNotOwner() {
        Feedback fb = buildFb(999L, false);
        when(repository.findById(1L)).thenReturn(Optional.of(fb));
        assertThrows(FeedbackAccessDeniedException.class, () -> service.approve(1L));
    }

    @Test @DisplayName("getSummary() — returns rounded average rating")
    void getSummary_ReturnsCorrectAverage() {
        when(repository.countByCardId(CARD_ID)).thenReturn(5L);
        when(repository.countByCardIdAndIsApprovedTrue(CARD_ID)).thenReturn(3L);
        when(repository.averageRatingByCardId(CARD_ID)).thenReturn(4.266);
        FeedbackSummaryResponse result = service.getSummary(CARD_ID);
        assertEquals(5L, result.getTotalFeedback());
        assertEquals(3L, result.getApprovedFeedback());
        assertEquals(4.3, result.getAverageRating());
    }

    @Test @DisplayName("deleteFeedback() — throws ResourceNotFoundException when not found")
    void deleteFeedback_ThrowsNotFound() {
        when(repository.findById(999L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> service.deleteFeedback(999L));
    }

    @Test @DisplayName("getFeedbackByOwner() — throws when caller is not the owner")
    void getFeedbackByOwner_ThrowsAccessDenied_WhenNotOwner() {
        assertThrows(FeedbackAccessDeniedException.class, () -> service.getFeedbackByOwner(999L));
        verify(repository, never()).findByOwnerIdOrderByCreatedAtDesc(any());
    }
}
