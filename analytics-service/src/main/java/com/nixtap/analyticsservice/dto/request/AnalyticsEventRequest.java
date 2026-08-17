package com.nixtap.analyticsservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AnalyticsEventRequest {

    @NotBlank(message = "Owner ID is required")
    @Size(max = 100, message = "Owner ID cannot exceed 100 characters")
    private String ownerId;

    @NotBlank(message = "Target type is required")
    @Pattern(
        regexp = "^(CARD|PORTFOLIO|QR)$",
        message = "Target type must be one of: CARD, PORTFOLIO, QR"
    )
    private String targetType;

    @NotBlank(message = "Target ID is required")
    @Size(max = 100, message = "Target ID cannot exceed 100 characters")
    private String targetId;

    @NotBlank(message = "Event type is required")
    @Pattern(
        regexp = "^(VIEW|SCAN|TAP)$",
        message = "Event type must be one of: VIEW, SCAN, TAP"
    )
    private String eventType;

    /** Populated by the controller from HttpServletRequest — not supplied by API callers. */
    private String ipAddress;

    /** Raw User-Agent header — populated by the controller from HttpServletRequest. */
    private String userAgent;

    /** HTTP Referer header — optional, populated by the controller when present. */
    private String referrer;
}
