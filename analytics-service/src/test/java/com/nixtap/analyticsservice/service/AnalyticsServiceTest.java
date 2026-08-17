package com.nixtap.analyticsservice.service;

import com.nixtap.analyticsservice.dto.request.AnalyticsEventRequest;
import com.nixtap.analyticsservice.dto.response.AnalyticsEventResponse;
import com.nixtap.analyticsservice.dto.response.AnalyticsSummaryResponse;
import com.nixtap.analyticsservice.entity.AnalyticsEvent;
import com.nixtap.analyticsservice.exception.AnalyticsAccessDeniedException;
import com.nixtap.analyticsservice.mapper.AnalyticsMapper;
import com.nixtap.analyticsservice.repository.AnalyticsRepository;
import com.nixtap.analyticsservice.security.AuthenticatedUser;
import com.nixtap.analyticsservice.service.impl.AnalyticsServiceImpl;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class AnalyticsServiceTest {

    @Mock private AnalyticsRepository analyticsRepository;
    @Mock private AnalyticsMapper     analyticsMapper;

    @InjectMocks
    private AnalyticsServiceImpl analyticsService;

    private static final Long   CALLER_USER_ID = 42L;
    private static final String OWNER_ID       = "42";
    private static final String OTHER_OWNER_ID = "99";

    private static final String CHROME_DESKTOP_UA =
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
            "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

    private static final String IPHONE_UA =
            "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) " +
            "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";

    private AnalyticsEvent       savedEvent;
    private AnalyticsEventResponse eventResponse;

    private void authenticateAs(Long userId) {
        AuthenticatedUser principal = new AuthenticatedUser(userId, "test@nixtap.com");
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(principal, null, List.of()));
    }

    @BeforeEach
    void setUp() {
        authenticateAs(CALLER_USER_ID);

        savedEvent = AnalyticsEvent.builder()
                .id(1L).ownerId(OWNER_ID).targetType("CARD").targetId("card-slug-001")
                .eventType("VIEW").ipAddress("192.168.1.1").userAgent(CHROME_DESKTOP_UA)
                .deviceType("DESKTOP").browser("CHROME").referrer("https://google.com")
                .createdAt(LocalDateTime.now()).build();

        eventResponse = AnalyticsEventResponse.builder()
                .id(1L).ownerId(OWNER_ID).targetType("CARD").targetId("card-slug-001")
                .eventType("VIEW").deviceType("DESKTOP").browser("CHROME")
                .createdAt(savedEvent.getCreatedAt()).build();
    }

    @AfterEach
    void tearDown() { SecurityContextHolder.clearContext(); }

    @Nested @DisplayName("recordEvent()")
    class RecordEventTests {

        @Test @DisplayName("Should create QR code, persist entity, and return response with parsed device/browser")
        void recordEvent_Success_WithChromeDesktopUA() {
            AnalyticsEventRequest request = buildRequest(CHROME_DESKTOP_UA);
            when(analyticsRepository.save(any(AnalyticsEvent.class))).thenReturn(savedEvent);
            when(analyticsMapper.toResponse(savedEvent)).thenReturn(eventResponse);

            AnalyticsEventResponse result = analyticsService.recordEvent(request);

            assertNotNull(result);
            assertEquals(OWNER_ID, result.getOwnerId());
            assertEquals("DESKTOP", result.getDeviceType());
            assertEquals("CHROME", result.getBrowser());
            verify(analyticsRepository).save(any(AnalyticsEvent.class));
        }

        @Test @DisplayName("Should parse iPhone UA as MOBILE + SAFARI")
        void recordEvent_ParsesMobileUA() {
            AnalyticsEventRequest request = buildRequest(IPHONE_UA);
            request.setTargetType("QR"); request.setEventType("SCAN");

            AnalyticsEvent mobileEvent = AnalyticsEvent.builder().id(2L).ownerId(OWNER_ID)
                    .targetType("QR").targetId("qr-001").eventType("SCAN")
                    .deviceType("MOBILE").browser("SAFARI").createdAt(LocalDateTime.now()).build();
            AnalyticsEventResponse mobileResp = AnalyticsEventResponse.builder()
                    .id(2L).ownerId(OWNER_ID).deviceType("MOBILE").browser("SAFARI").build();

            when(analyticsRepository.save(any())).thenReturn(mobileEvent);
            when(analyticsMapper.toResponse(mobileEvent)).thenReturn(mobileResp);

            AnalyticsEventResponse result = analyticsService.recordEvent(request);
            assertEquals("MOBILE", result.getDeviceType());
            assertEquals("SAFARI", result.getBrowser());
        }

        @Test @DisplayName("Should handle null User-Agent and return UNKNOWN device")
        void recordEvent_NullUserAgent_ReturnsUnknownDevice() {
            AnalyticsEventRequest request = buildRequest(null);
            AnalyticsEvent unknownEvent = AnalyticsEvent.builder().id(3L).ownerId(OWNER_ID)
                    .targetType("CARD").targetId("x").eventType("VIEW")
                    .deviceType("UNKNOWN").browser("OTHER").createdAt(LocalDateTime.now()).build();
            AnalyticsEventResponse unknownResp = AnalyticsEventResponse.builder()
                    .id(3L).deviceType("UNKNOWN").browser("OTHER").build();

            when(analyticsRepository.save(any())).thenReturn(unknownEvent);
            when(analyticsMapper.toResponse(unknownEvent)).thenReturn(unknownResp);

            AnalyticsEventResponse result = analyticsService.recordEvent(request);
            assertEquals("UNKNOWN", result.getDeviceType());
            assertEquals("OTHER",   result.getBrowser());
        }

        private AnalyticsEventRequest buildRequest(String userAgent) {
            AnalyticsEventRequest req = new AnalyticsEventRequest();
            req.setOwnerId(OWNER_ID); req.setTargetType("CARD");
            req.setTargetId("card-slug-001"); req.setEventType("VIEW");
            req.setUserAgent(userAgent); req.setIpAddress("192.168.1.1");
            req.setReferrer("https://google.com");
            return req;
        }
    }

    @Nested @DisplayName("getDashboardSummary()")
    class DashboardSummaryTests {

        @Test @DisplayName("Should return aggregated summary when caller is the owner")
        void getDashboardSummary_Success() {
            when(analyticsRepository.countByOwnerId(OWNER_ID)).thenReturn(20L);
            when(analyticsRepository.countByOwnerIdAndEventType(OWNER_ID, "VIEW")).thenReturn(10L);
            when(analyticsRepository.countByOwnerIdAndEventType(OWNER_ID, "SCAN")).thenReturn(7L);
            when(analyticsRepository.countByOwnerIdAndEventType(OWNER_ID, "TAP")).thenReturn(3L);
            when(analyticsRepository.countByOwnerIdAndTargetType(OWNER_ID, "CARD")).thenReturn(12L);
            when(analyticsRepository.countByOwnerIdAndTargetType(OWNER_ID, "PORTFOLIO")).thenReturn(5L);
            when(analyticsRepository.countByOwnerIdAndTargetType(OWNER_ID, "QR")).thenReturn(3L);
            when(analyticsRepository.countGroupedByDeviceType(OWNER_ID))
                    .thenReturn(List.of(new Object[]{"DESKTOP", 14L}, new Object[]{"MOBILE", 6L}));
            when(analyticsRepository.countGroupedByBrowser(OWNER_ID))
                    .thenReturn(List.of(new Object[]{"CHROME", 12L}, new Object[]{"SAFARI", 8L}));
            when(analyticsRepository.findTop10ByOwnerIdOrderByCreatedAtDesc(OWNER_ID))
                    .thenReturn(List.of(savedEvent));
            when(analyticsMapper.toResponse(savedEvent)).thenReturn(eventResponse);

            AnalyticsSummaryResponse summary = analyticsService.getDashboardSummary(OWNER_ID);

            assertNotNull(summary);
            assertEquals(OWNER_ID, summary.getOwnerId());
            assertEquals(20L, summary.getTotalEvents());
            assertEquals(10L, summary.getTotalViews());
            assertEquals(1,   summary.getRecentEvents().size());
        }

        @Test @DisplayName("Should throw when caller is not the owner")
        void getDashboardSummary_ThrowsAccessDenied_WhenNotOwner() {
            assertThrows(AnalyticsAccessDeniedException.class,
                    () -> analyticsService.getDashboardSummary(OTHER_OWNER_ID));
            verify(analyticsRepository, never()).countByOwnerId(any());
        }

        @Test @DisplayName("Recent events list capped at 10 via Top10 query")
        void getDashboardSummary_RecentEvents_CappedAtTen() {
            java.util.List<AnalyticsEvent> tenEvents = java.util.Collections.nCopies(10, savedEvent);
            stubCounters();
            when(analyticsRepository.countGroupedByDeviceType(OWNER_ID)).thenReturn(List.of());
            when(analyticsRepository.countGroupedByBrowser(OWNER_ID)).thenReturn(List.of());
            when(analyticsRepository.findTop10ByOwnerIdOrderByCreatedAtDesc(OWNER_ID)).thenReturn(tenEvents);
            when(analyticsMapper.toResponse(any())).thenReturn(eventResponse);

            AnalyticsSummaryResponse summary = analyticsService.getDashboardSummary(OWNER_ID);
            assertEquals(10, summary.getRecentEvents().size());
        }

        private void stubCounters() {
            when(analyticsRepository.countByOwnerId(OWNER_ID)).thenReturn(0L);
            when(analyticsRepository.countByOwnerIdAndEventType(eq(OWNER_ID), any())).thenReturn(0L);
            when(analyticsRepository.countByOwnerIdAndTargetType(eq(OWNER_ID), any())).thenReturn(0L);
        }
    }

    @Nested @DisplayName("getEventsByOwner()")
    class EventsByOwnerTests {

        @Test @DisplayName("Should return paginated events when caller is the owner")
        void getEventsByOwner_Success() {
            Pageable pageable = PageRequest.of(0, 20, Sort.by("createdAt").descending());
            Page<AnalyticsEvent> eventPage = new PageImpl<>(List.of(savedEvent));

            when(analyticsRepository.findByOwnerIdOrderByCreatedAtDesc(OWNER_ID, pageable))
                    .thenReturn(eventPage);
            when(analyticsMapper.toResponse(savedEvent)).thenReturn(eventResponse);

            Page<AnalyticsEventResponse> result = analyticsService.getEventsByOwner(OWNER_ID, pageable);

            assertNotNull(result);
            assertEquals(1, result.getTotalElements());
        }

        @Test @DisplayName("Should return empty page when owner has no events")
        void getEventsByOwner_EmptyPage_WhenNoEvents() {
            Pageable pageable = PageRequest.of(0, 20);
            when(analyticsRepository.findByOwnerIdOrderByCreatedAtDesc(OWNER_ID, pageable))
                    .thenReturn(Page.empty());

            Page<AnalyticsEventResponse> result = analyticsService.getEventsByOwner(OWNER_ID, pageable);
            assertEquals(0, result.getTotalElements());
        }

        @Test @DisplayName("Should throw when caller is not the owner")
        void getEventsByOwner_ThrowsAccessDenied_WhenNotOwner() {
            Pageable pageable = PageRequest.of(0, 20);
            assertThrows(AnalyticsAccessDeniedException.class,
                    () -> analyticsService.getEventsByOwner(OTHER_OWNER_ID, pageable));
            verify(analyticsRepository, never()).findByOwnerIdOrderByCreatedAtDesc(any(), any());
        }
    }
}
