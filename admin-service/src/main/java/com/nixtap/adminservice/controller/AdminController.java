package com.nixtap.adminservice.controller;

import com.nixtap.adminservice.dto.feign.*;
import com.nixtap.adminservice.dto.response.AdminAuditLogResponse;
import com.nixtap.adminservice.dto.response.AdminDashboardResponse;
import com.nixtap.adminservice.dto.response.ApiResponse;
import com.nixtap.adminservice.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Tag(name = "Admin Panel", description = "Admin-only management endpoints for NIXTAP — ROLE_ADMIN required")
public class AdminController {

    private final AdminService service;

    // -----------------------------------------------------------------------
    // Dashboard
    // -----------------------------------------------------------------------

    @GetMapping("/dashboard")
    @Operation(summary = "System dashboard — aggregated platform-wide counts")
    public ResponseEntity<ApiResponse<AdminDashboardResponse>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.success("Dashboard retrieved", service.getDashboard()));
    }

    // -----------------------------------------------------------------------
    // User Management
    // -----------------------------------------------------------------------

    @GetMapping("/users")
    @Operation(summary = "Paginated list of all registered users")
    public ResponseEntity<ApiResponse<PagedResponse<UserSummary>>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PagedResponse<UserSummary> result = service.getUsers(page, size);
        if (result.getContent() == null) {
            return ResponseEntity.status(501)
                    .body(ApiResponse.success("User listing not yet implemented — requires auth-service admin endpoints", result));
        }
        return ResponseEntity.ok(ApiResponse.success("Users retrieved", result));
    }

    @GetMapping("/users/{id}")
    @Operation(summary = "Get user details by ID")
    public ResponseEntity<ApiResponse<UserSummary>> getUserById(@PathVariable Long id) {
        UserSummary user = service.getUserById(id);
        if (user == null) {
            return ResponseEntity.status(501)
                    .body(ApiResponse.success("User management not yet implemented — requires auth-service admin endpoints", null));
        }
        return ResponseEntity.ok(ApiResponse.success("User retrieved", user));
    }

    @PutMapping("/users/{id}/enable")
    @Operation(summary = "Enable a user account")
    public ResponseEntity<ApiResponse<Void>> enableUser(@PathVariable Long id) {
        service.enableUser(id);
        return ResponseEntity.ok(ApiResponse.success("User account activated successfully", null));
    }

    @PutMapping("/users/{id}/disable")
    @Operation(summary = "Disable a user account")
    public ResponseEntity<ApiResponse<Void>> disableUser(@PathVariable Long id) {
        service.disableUser(id);
        return ResponseEntity.ok(ApiResponse.success("User account suspended successfully", null));
    }

    @DeleteMapping("/users/{id}")
    @Operation(summary = "Permanently delete a user account from the platform")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        service.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User account permanently deleted", null));
    }

    // -----------------------------------------------------------------------
    // Card Management
    // -----------------------------------------------------------------------

    @GetMapping("/cards")
    @Operation(summary = "Paginated list of all business cards across the platform")
    public ResponseEntity<ApiResponse<PagedResponse<BusinessCardSummary>>> getCards(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success("Cards retrieved", service.getCards(page, size)));
    }

    @PutMapping("/cards/{id}/deactivate")
    @Operation(summary = "Deactivate a business card (make private)")
    public ResponseEntity<ApiResponse<Void>> deactivateCard(@PathVariable Long id) {
        service.deactivateCard(id);
        return ResponseEntity.ok(ApiResponse.success("Card deactivated", null));
    }

    @DeleteMapping("/cards/{id}")
    @Operation(summary = "Delete a business card")
    public ResponseEntity<ApiResponse<Void>> deleteCard(@PathVariable Long id) {
        service.deleteCard(id);
        return ResponseEntity.ok(ApiResponse.success("Card deleted", null));
    }

    // -----------------------------------------------------------------------
    // NFC Management
    // -----------------------------------------------------------------------

    @GetMapping("/nfc/tags")
    @Operation(summary = "Paginated list of all NFC tags across the platform")
    public ResponseEntity<ApiResponse<PagedResponse<NfcTagSummary>>> getNfcTags(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success("NFC tags retrieved", service.getNfcTags(page, size)));
    }

    @PutMapping("/nfc/tags/{id}/deactivate")
    @Operation(summary = "Deactivate an NFC tag")
    public ResponseEntity<ApiResponse<Void>> deactivateNfcTag(@PathVariable Long id) {
        service.deactivateNfcTag(id);
        return ResponseEntity.ok(ApiResponse.success("NFC tag deactivated", null));
    }

    // -----------------------------------------------------------------------
    // Feedback Management
    // -----------------------------------------------------------------------

    @GetMapping("/feedback/pending")
    @Operation(summary = "Paginated list of all unapproved feedback")
    public ResponseEntity<ApiResponse<PagedResponse<FeedbackSummary>>> getPendingFeedback(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success("Pending feedback retrieved",
                service.getPendingFeedback(page, size)));
    }

    @PutMapping("/feedback/{id}/approve")
    @Operation(summary = "Approve a feedback entry")
    public ResponseEntity<ApiResponse<Void>> approveFeedback(@PathVariable Long id) {
        service.approveFeedback(id);
        return ResponseEntity.ok(ApiResponse.success("Feedback approved", null));
    }

    @DeleteMapping("/feedback/{id}")
    @Operation(summary = "Delete a feedback entry")
    public ResponseEntity<ApiResponse<Void>> deleteFeedback(@PathVariable Long id) {
        service.deleteFeedback(id);
        return ResponseEntity.ok(ApiResponse.success("Feedback deleted", null));
    }

    // -----------------------------------------------------------------------
    // Audit Logs
    // -----------------------------------------------------------------------

    @GetMapping("/audit-logs")
    @Operation(summary = "Paginated admin action audit log")
    public ResponseEntity<ApiResponse<Page<AdminAuditLogResponse>>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(ApiResponse.success("Audit logs retrieved",
                service.getAuditLogs(pageable)));
    }

    @GetMapping("/audit-logs/{adminId}")
    @Operation(summary = "Audit logs filtered by a specific admin user")
    public ResponseEntity<ApiResponse<Page<AdminAuditLogResponse>>> getAuditLogsByAdmin(
            @PathVariable Long adminId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(ApiResponse.success("Audit logs retrieved",
                service.getAuditLogsByAdmin(adminId, pageable)));
    }
}
