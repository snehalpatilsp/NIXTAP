package com.nixtap.analyticsservice.controller;

import com.nixtap.analyticsservice.dto.request.AnalyticsEventRequest;
import com.nixtap.analyticsservice.dto.response.AnalyticsEventResponse;
import com.nixtap.analyticsservice.dto.response.AnalyticsSummaryResponse;
import com.nixtap.analyticsservice.dto.response.ApiResponse;
import com.nixtap.analyticsservice.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics", description = "Event recording and metrics aggregation for NIXTAP NFC Business Cards")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    // -----------------------------------------------------------------------
    // POST /api/v1/analytics/events  — PUBLIC (no JWT required)
    // -----------------------------------------------------------------------

    @PostMapping("/events")
    @Operation(
        summary     = "Record an analytics event",
        description = "Public endpoint invoked when a card is viewed, a QR code is scanned, "
                    + "or an NFC tag is tapped. The server automatically extracts the visitor's "
                    + "IP address and User-Agent from the HTTP request. No authentication required."
    )
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "201", description = "Event recorded successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "422", description = "Validation failed — missing or invalid fields")
    })
    public ResponseEntity<ApiResponse<AnalyticsEventResponse>> recordEvent(
            @Valid @RequestBody AnalyticsEventRequest request,
            HttpServletRequest httpRequest) {

        // Populate request from HTTP headers — not exposed to the API caller
        request.setIpAddress(resolveClientIp(httpRequest));
        request.setUserAgent(httpRequest.getHeader("User-Agent"));
        request.setReferrer(httpRequest.getHeader("Referer"));

        AnalyticsEventResponse response = analyticsService.recordEvent(request);
        return new ResponseEntity<>(
                ApiResponse.success("Event recorded successfully", response),
                HttpStatus.CREATED);
    }

    // -----------------------------------------------------------------------
    // GET /api/v1/analytics/dashboard/{ownerId}  — AUTHENTICATED
    // -----------------------------------------------------------------------

    @GetMapping("/dashboard/{ownerId}")
    @Operation(
        summary     = "Get analytics dashboard summary",
        description = "Returns aggregated metrics for the given owner: total events, "
                    + "event type breakdown, target type counts, device and browser distributions, "
                    + "and the 10 most recent events. Caller must be the owner."
    )
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200", description = "Summary retrieved successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401", description = "Authentication required"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "403", description = "Access denied — caller is not the owner")
    })
    public ResponseEntity<ApiResponse<AnalyticsSummaryResponse>> getDashboardSummary(
            @Parameter(description = "Owner ID (userId from auth-service)", required = true)
            @PathVariable String ownerId) {
        AnalyticsSummaryResponse summary = analyticsService.getDashboardSummary(ownerId);
        return ResponseEntity.ok(
                ApiResponse.success("Dashboard summary retrieved successfully", summary));
    }

    // -----------------------------------------------------------------------
    // GET /api/v1/analytics/events/owner/{ownerId}  — AUTHENTICATED
    // -----------------------------------------------------------------------

    @GetMapping("/events/owner/{ownerId}")
    @Operation(summary = "Get all events for an owner — paginated", description = "Caller must be the owner.")
    public ResponseEntity<ApiResponse<Page<AnalyticsEventResponse>>> getEventsByOwner(
            @PathVariable String ownerId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<AnalyticsEventResponse> events = analyticsService.getEventsByOwner(ownerId, pageable);
        return ResponseEntity.ok(ApiResponse.success("Events retrieved successfully", events));
    }

    // -----------------------------------------------------------------------
    // Private helpers
    // -----------------------------------------------------------------------

    /**
     * Resolves the real client IP address, honouring standard proxy headers.
     * Falls back to the direct remote address when no proxy headers are present.
     */
    private String resolveClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(forwarded)) {
            // X-Forwarded-For may be a comma-separated list; the first entry is the origin
            return forwarded.split(",")[0].trim();
        }
        String realIp = request.getHeader("X-Real-IP");
        if (StringUtils.hasText(realIp)) {
            return realIp.trim();
        }
        return request.getRemoteAddr();
    }
}
