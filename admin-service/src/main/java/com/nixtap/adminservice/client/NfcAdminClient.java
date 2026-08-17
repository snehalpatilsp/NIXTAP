package com.nixtap.adminservice.client;

import org.springframework.cloud.openfeign.FeignClient;

/**
 * Feign client for NFC tag admin operations (via business-card-service).
 * NOTE: business-card-service does not expose /admin/tags endpoints.
 *
 * TODO: Add admin endpoints to business-card-service NfcTagController:
 *   GET  /api/v1/nfc/admin/tags
 *   PUT  /api/v1/nfc/admin/tags/{id}/deactivate
 *   GET  /api/v1/nfc/admin/tags/count
 */
@FeignClient(name = "BUSINESS-CARD-SERVICE", contextId = "nfcAdminClient", path = "/api/v1/nfc")
public interface NfcAdminClient {
    // Admin endpoints to be implemented in business-card-service
}
