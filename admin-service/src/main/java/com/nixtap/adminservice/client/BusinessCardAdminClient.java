package com.nixtap.adminservice.client;

import org.springframework.cloud.openfeign.FeignClient;

/**
 * Feign client for business-card-service admin operations.
 * NOTE: The business-card-service does not expose /admin/** endpoints.
 * These need to be added to BusinessCardController when admin panel is fully integrated.
 *
 * TODO: Add admin endpoints to business-card-service:
 *   GET  /api/v1/cards/admin/all   -> paginated all cards
 *   PUT  /api/v1/cards/admin/{id}/deactivate
 *   DELETE /api/v1/cards/admin/{id}
 *   GET  /api/v1/cards/admin/count
 */
@FeignClient(name = "BUSINESS-CARD-SERVICE", contextId = "businessCardAdminClient", path = "/api/v1/cards")
public interface BusinessCardAdminClient {
    // Admin endpoints to be implemented in business-card-service
    // Placeholder — methods commented out until endpoints exist
}
