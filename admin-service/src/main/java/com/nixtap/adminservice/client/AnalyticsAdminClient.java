package com.nixtap.adminservice.client;

import org.springframework.cloud.openfeign.FeignClient;

/**
 * Feign client for analytics-service admin operations.
 * NOTE: analytics-service does not expose /admin/total-events endpoint.
 *
 * TODO: Add admin endpoint to analytics-service:
 *   GET  /api/v1/analytics/admin/total-events
 */
@FeignClient(name = "ANALYTICS-SERVICE", path = "/api/v1/analytics")
public interface AnalyticsAdminClient {
    // Admin endpoint to be implemented in analytics-service
}
