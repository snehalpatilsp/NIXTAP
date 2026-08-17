package com.nixtap.adminservice.client;

import org.springframework.cloud.openfeign.FeignClient;

/**
 * Feign client for meeting-service admin operations.
 * NOTE: meeting-service does not expose /admin/** endpoints.
 *
 * TODO: Add admin endpoints to meeting-service:
 *   GET  /api/v1/meetings/admin/count/total
 *   GET  /api/v1/meetings/admin/count/pending
 */
@FeignClient(name = "MEETING-SERVICE", path = "/api/v1/meetings")
public interface MeetingAdminClient {
    // Admin endpoints to be implemented in meeting-service
}
