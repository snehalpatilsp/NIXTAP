package com.nixtap.analyticsservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AnalyticsSummaryResponse {

    /** Owner whose metrics are being reported. */
    private String ownerId;

    /** Total number of events recorded for this owner. */
    private long totalEvents;

    /** Total VIEW events. */
    private long totalViews;

    /** Total SCAN events (QR scans). */
    private long totalScans;

    /** Total TAP events (NFC taps). */
    private long totalTaps;

    /**
     * View counts segmented by target type.
     * Key: targetType (CARD, PORTFOLIO, QR) — Value: event count.
     */
    private Map<String, Long> viewsByTargetType;

    /**
     * Event counts segmented by visitor device type.
     * Key: deviceType (MOBILE, DESKTOP, TABLET, UNKNOWN) — Value: count.
     */
    private Map<String, Long> viewsByDevice;

    /**
     * Event counts segmented by visitor browser.
     * Key: browser (CHROME, SAFARI, FIREFOX, EDGE, OTHER) — Value: count.
     */
    private Map<String, Long> viewsByBrowser;

    /** The 10 most recent events for quick preview, ordered newest first. */
    private List<AnalyticsEventResponse> recentEvents;
}
