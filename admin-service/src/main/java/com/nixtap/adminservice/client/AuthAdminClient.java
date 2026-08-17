package com.nixtap.adminservice.client;

import org.springframework.cloud.openfeign.FeignClient;

/**
 * Feign client for auth-service user management.
 * NOTE: These endpoints must exist in auth-service controllers.
 * Currently auth-service exposes user data only for self-service.
 * Admin user-list endpoints should be added to auth-service when needed.
 * Using /api/v1/auth endpoints that actually exist for now.
 */
@FeignClient(name = "AUTH-SERVICE", path = "/api/v1/auth")
public interface AuthAdminClient {

    /**
     * Count total users — calls the actuator health endpoint as a proxy
     * to verify service is alive. Actual user count requires a dedicated endpoint
     * in auth-service (to be implemented).
     * Placeholder returns 0L until auth-service exposes /admin/users/count.
     */
    // TODO: Add GET /api/v1/auth/admin/users/count to auth-service AuthController
    // @GetMapping("/admin/users/count")
    // long countUsers();

    // For now admin-service only uses what actually exists in auth-service
}
