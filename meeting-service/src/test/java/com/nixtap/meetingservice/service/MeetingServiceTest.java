package com.nixtap.meetingservice.service;

import com.nixtap.meetingservice.dto.request.MeetingActionRequest;
import com.nixtap.meetingservice.dto.request.MeetingRequestDto;
import com.nixtap.meetingservice.dto.response.MeetingRequestResponse;
import com.nixtap.meetingservice.dto.response.MeetingStatsResponse;
import com.nixtap.meetingservice.entity.MeetingRequest;
import com.nixtap.meetingservice.exception.MeetingAccessDeniedException;
import com.nixtap.meetingservice.exception.ResourceNotFoundException;
import com.nixtap.meetingservice.mapper.MeetingMapper;
import com.nixtap.meetingservice.repository.MeetingRepository;
import com.nixtap.meetingservice.security.AuthenticatedUser;
import com.nixtap.meetingservice.service.impl.MeetingServiceImpl;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class MeetingServiceTest {

    @Mock private MeetingRepository repository;
    @Mock private MeetingMapper     mapper;
    @InjectMocks private MeetingServiceImpl service;

    private static final Long OWNER_ID = 1L;
    private static final Long CARD_ID  = 10L;

    private MeetingRequest buildRequest(Long ownerId, String status) {
        return MeetingRequest.builder()
                .id(1L).ownerId(ownerId).cardId(CARD_ID)
                .requesterName("Alice").requesterEmail("alice@test.com")
                .purpose("Demo").preferredDate(LocalDate.now().plusDays(7))
                .status(status).build();
    }

    private void authenticateAs(Long userId) {
        AuthenticatedUser p = new AuthenticatedUser(userId, "owner@nixtap.com");
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(p, null, List.of()));
    }

    @BeforeEach void setUp()    { authenticateAs(OWNER_ID); }
    @AfterEach  void tearDown() { SecurityContextHolder.clearContext(); }

    @Test
    @DisplayName("submitRequest() — saves and returns PENDING response")
    void submitRequest_Success() {
        MeetingRequestDto dto = new MeetingRequestDto();
        dto.setOwnerId(OWNER_ID); dto.setCardId(CARD_ID);
        dto.setRequesterName("Alice"); dto.setRequesterEmail("alice@test.com");
        dto.setPurpose("Demo"); dto.setPreferredDate(LocalDate.now().plusDays(7));

        MeetingRequest saved = buildRequest(OWNER_ID, "PENDING");
        MeetingRequestResponse resp = MeetingRequestResponse.builder()
                .id(1L).status("PENDING").build();

        when(repository.save(any())).thenReturn(saved);
        when(mapper.toResponse(saved)).thenReturn(resp);

        MeetingRequestResponse result = service.submitRequest(dto);
        assertNotNull(result);
        assertEquals("PENDING", result.getStatus());
        verify(repository).save(any(MeetingRequest.class));
    }

    @Test
    @DisplayName("accept() — sets status ACCEPTED and saves owner note")
    void accept_Success() {
        MeetingRequest req = buildRequest(OWNER_ID, "PENDING");
        MeetingRequestResponse resp = MeetingRequestResponse.builder()
                .id(1L).status("ACCEPTED").ownerNote("See you then!").build();

        when(repository.findById(1L)).thenReturn(Optional.of(req));
        when(repository.save(req)).thenReturn(req);
        when(mapper.toResponse(req)).thenReturn(resp);

        MeetingActionRequest action = new MeetingActionRequest();
        action.setNote("See you then!");

        MeetingRequestResponse result = service.accept(1L, action);
        assertEquals("ACCEPTED", result.getStatus());
        assertEquals("See you then!", result.getOwnerNote());
    }

    @Test
    @DisplayName("accept() — throws MeetingAccessDeniedException when not owner")
    void accept_ThrowsAccessDenied_WhenNotOwner() {
        MeetingRequest req = buildRequest(999L, "PENDING");
        when(repository.findById(1L)).thenReturn(Optional.of(req));
        assertThrows(MeetingAccessDeniedException.class, () -> service.accept(1L, null));
    }

    @Test
    @DisplayName("reject() — sets status REJECTED")
    void reject_Success() {
        MeetingRequest req = buildRequest(OWNER_ID, "PENDING");
        MeetingRequestResponse resp = MeetingRequestResponse.builder()
                .id(1L).status("REJECTED").build();

        when(repository.findById(1L)).thenReturn(Optional.of(req));
        when(repository.save(req)).thenReturn(req);
        when(mapper.toResponse(req)).thenReturn(resp);

        MeetingRequestResponse result = service.reject(1L, null);
        assertEquals("REJECTED", result.getStatus());
    }

    @Test
    @DisplayName("cancel() — sets status CANCELLED (public — no auth check)")
    void cancel_Success() {
        MeetingRequest req = buildRequest(OWNER_ID, "PENDING");
        MeetingRequestResponse resp = MeetingRequestResponse.builder()
                .id(1L).status("CANCELLED").build();

        when(repository.findById(1L)).thenReturn(Optional.of(req));
        when(repository.save(req)).thenReturn(req);
        when(mapper.toResponse(req)).thenReturn(resp);

        MeetingRequestResponse result = service.cancel(1L);
        assertEquals("CANCELLED", result.getStatus());
    }

    @Test
    @DisplayName("getStats() — returns correct counts per status")
    void getStats_Success() {
        when(repository.countByOwnerId(OWNER_ID)).thenReturn(10L);
        when(repository.countByOwnerIdAndStatus(OWNER_ID, "PENDING")).thenReturn(5L);
        when(repository.countByOwnerIdAndStatus(OWNER_ID, "ACCEPTED")).thenReturn(3L);
        when(repository.countByOwnerIdAndStatus(OWNER_ID, "REJECTED")).thenReturn(1L);
        when(repository.countByOwnerIdAndStatus(OWNER_ID, "CANCELLED")).thenReturn(1L);

        MeetingStatsResponse stats = service.getStats(OWNER_ID);
        assertEquals(10L, stats.getTotalRequests());
        assertEquals(5L,  stats.getPendingRequests());
        assertEquals(3L,  stats.getAcceptedRequests());
    }

    @Test
    @DisplayName("getRequestsByOwner() — throws when caller is not the owner")
    void getRequestsByOwner_ThrowsAccessDenied_WhenNotOwner() {
        assertThrows(MeetingAccessDeniedException.class,
                () -> service.getRequestsByOwner(999L));
        verify(repository, never()).findByOwnerIdOrderByCreatedAtDesc(any());
    }

    @Test
    @DisplayName("deleteRequest() — throws ResourceNotFoundException when not found")
    void deleteRequest_ThrowsNotFound() {
        when(repository.findById(999L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> service.deleteRequest(999L));
    }

    @Test
    @DisplayName("deleteRequest() — deletes when owner calls")
    void deleteRequest_Success() {
        MeetingRequest req = buildRequest(OWNER_ID, "PENDING");
        when(repository.findById(1L)).thenReturn(Optional.of(req));
        doNothing().when(repository).delete(req);
        assertDoesNotThrow(() -> service.deleteRequest(1L));
        verify(repository).delete(req);
    }
}
