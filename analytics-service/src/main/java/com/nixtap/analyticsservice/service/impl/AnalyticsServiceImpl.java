package com.nixtap.analyticsservice.service.impl;

import com.nixtap.analyticsservice.dto.request.AnalyticsEventRequest;
import com.nixtap.analyticsservice.dto.response.AnalyticsEventResponse;
import com.nixtap.analyticsservice.dto.response.AnalyticsSummaryResponse;
import com.nixtap.analyticsservice.entity.AnalyticsEvent;
import com.nixtap.analyticsservice.exception.AnalyticsAccessDeniedException;
import com.nixtap.analyticsservice.mapper.AnalyticsMapper;
import com.nixtap.analyticsservice.repository.AnalyticsRepository;
import com.nixtap.analyticsservice.security.AuthenticatedUser;
import com.nixtap.analyticsservice.service.AnalyticsService;
import com.nixtap.analyticsservice.util.UserAgentParserUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class AnalyticsServiceImpl implements AnalyticsService {

    private final AnalyticsRepository analyticsRepository;
    private final AnalyticsMapper     analyticsMapper;

    // -----------------------------------------------------------------------
    // Security helpers
    // -----------------------------------------------------------------------

    /**
     * Extracts the authenticated user's ID from the SecurityContext.
     * Returns null when the request is unauthenticated (public event recording).
     */
    @SuppressWarnings("unused")
    private Long getAuthenticatedUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof AuthenticatedUser principal)) {
            return null;
        }
        return principal.getUserId();
    }

    /**
     * Asserts that the currently authenticated user is the owner of the requested data.
     * Uses String comparison because ownerId is a String in the analytics domain
     * (userId from the JWT is a Long, so we convert for comparison).
     *
     * @throws AnalyticsAccessDeniedException when identity does not match
     * @throws ResponseStatusException (401)   when no authentication is present
     */
    private void assertOwner(String ownerId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof AuthenticatedUser principal)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                    "Authentication required.");
        }
        // ownerId in the analytics domain is the string representation of userId
        String callerId = String.valueOf(principal.getUserId());
        if (!ownerId.equals(callerId)) {
            throw new AnalyticsAccessDeniedException(
                    "You do not have permission to access analytics for owner: " + ownerId);
        }
    }

    // -----------------------------------------------------------------------
    // Service operations
    // -----------------------------------------------------------------------

    @Override
    @Transactional
    public AnalyticsEventResponse recordEvent(AnalyticsEventRequest request) {
        // Parse user-agent into structured fields using the utility
        String deviceType = UserAgentParserUtil.parseDeviceType(request.getUserAgent());
        String browser    = UserAgentParserUtil.parseBrowser(request.getUserAgent());

        AnalyticsEvent event = AnalyticsEvent.builder()
                .ownerId(request.getOwnerId())
                .targetType(request.getTargetType())
                .targetId(request.getTargetId())
                .eventType(request.getEventType())
                .ipAddress(request.getIpAddress())
                .userAgent(request.getUserAgent())
                .deviceType(deviceType)
                .browser(browser)
                .referrer(request.getReferrer())
                .build();

        AnalyticsEvent saved = analyticsRepository.save(event);
        return analyticsMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public AnalyticsSummaryResponse getDashboardSummary(String ownerId) {
        assertOwner(ownerId);

        // Aggregate top-level counts
        long totalEvents = analyticsRepository.countByOwnerId(ownerId);
        long totalViews  = analyticsRepository.countByOwnerIdAndEventType(ownerId, "VIEW");
        long totalScans  = analyticsRepository.countByOwnerIdAndEventType(ownerId, "SCAN");
        long totalTaps   = analyticsRepository.countByOwnerIdAndEventType(ownerId, "TAP");

        // Breakdown by target type
        Map<String, Long> viewsByTargetType = new HashMap<>();
        for (String targetType : List.of("CARD", "PORTFOLIO", "QR")) {
            long count = analyticsRepository.countByOwnerIdAndTargetType(ownerId, targetType);
            viewsByTargetType.put(targetType, count);
        }

        // Device type aggregation from JPQL GROUP BY query
        Map<String, Long> viewsByDevice = toMap(
                analyticsRepository.countGroupedByDeviceType(ownerId));

        // Browser aggregation from JPQL GROUP BY query
        Map<String, Long> viewsByBrowser = toMap(
                analyticsRepository.countGroupedByBrowser(ownerId));

        // 10 most recent events — uses Top10 derived query (no in-memory limit)
        List<AnalyticsEventResponse> recentEvents = analyticsRepository
                .findTop10ByOwnerIdOrderByCreatedAtDesc(ownerId)
                .stream()
                .map(analyticsMapper::toResponse)
                .toList();

        return AnalyticsSummaryResponse.builder()
                .ownerId(ownerId)
                .totalEvents(totalEvents)
                .totalViews(totalViews)
                .totalScans(totalScans)
                .totalTaps(totalTaps)
                .viewsByTargetType(viewsByTargetType)
                .viewsByDevice(viewsByDevice)
                .viewsByBrowser(viewsByBrowser)
                .recentEvents(recentEvents)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AnalyticsEventResponse> getEventsByOwner(String ownerId, Pageable pageable) {
        assertOwner(ownerId);
        return analyticsRepository
                .findByOwnerIdOrderByCreatedAtDesc(ownerId, pageable)
                .map(analyticsMapper::toResponse);
    }

    // -----------------------------------------------------------------------
    // Private helpers
    // -----------------------------------------------------------------------

    /**
     * Converts the raw Object[2] rows returned by JPQL GROUP BY queries into a
     * typed Map<String, Long>. Null group keys (e.g. events with no parsed device)
     * are mapped to "UNKNOWN" to keep the response consistent.
     */
    private Map<String, Long> toMap(List<Object[]> rows) {
        Map<String, Long> result = new HashMap<>();
        for (Object[] row : rows) {
            String key   = row[0] != null ? row[0].toString() : "UNKNOWN";
            Long   count = ((Number) row[1]).longValue();
            result.put(key, count);
        }
        return result;
    }
}
