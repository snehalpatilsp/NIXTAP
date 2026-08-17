package com.nixtap.analyticsservice.service;

import com.nixtap.analyticsservice.dto.request.AnalyticsEventRequest;
import com.nixtap.analyticsservice.dto.response.AnalyticsEventResponse;
import com.nixtap.analyticsservice.dto.response.AnalyticsSummaryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AnalyticsService {
    AnalyticsEventResponse recordEvent(AnalyticsEventRequest request);
    AnalyticsSummaryResponse getDashboardSummary(String ownerId);
    /** Paginated event history — replaces unbounded List return. */
    Page<AnalyticsEventResponse> getEventsByOwner(String ownerId, Pageable pageable);
}
