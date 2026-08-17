package com.nixtap.adminservice.client;

import org.springframework.cloud.openfeign.FeignClient;

/**
 * Feign client for feedback-service admin operations.
 * NOTE: feedback-service does not expose /admin/** endpoints.
 *
 * TODO: Add admin endpoints to feedback-service:
 *   GET  /api/v1/feedback/admin/pending
 *   PUT  /api/v1/feedback/admin/{id}/approve
 *   DELETE /api/v1/feedback/admin/{id}
 *   GET  /api/v1/feedback/admin/count/pending
 *   GET  /api/v1/feedback/admin/count/total
 */
@FeignClient(name = "FEEDBACK-SERVICE", path = "/api/v1/feedback")
public interface FeedbackAdminClient {
    // Admin endpoints to be implemented in feedback-service
}
