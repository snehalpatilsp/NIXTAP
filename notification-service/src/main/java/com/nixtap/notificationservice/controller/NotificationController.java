package com.nixtap.notificationservice.controller;

import com.nixtap.notificationservice.dto.request.NotificationPreferenceRequest;
import com.nixtap.notificationservice.dto.request.SendNotificationRequest;
import com.nixtap.notificationservice.dto.response.ApiResponse;
import com.nixtap.notificationservice.dto.response.NotificationLogResponse;
import com.nixtap.notificationservice.dto.response.NotificationPreferenceResponse;
import com.nixtap.notificationservice.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Tag(name = "Notification Management", description = "Preferences and log APIs for NIXTAP notifications")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/preferences")
    @Operation(summary = "Get my notification preferences (auto-created with defaults if absent)")
    public ResponseEntity<ApiResponse<NotificationPreferenceResponse>> getPreferences() {
        return ResponseEntity.ok(ApiResponse.success("Preferences retrieved", notificationService.getMyPreferences()));
    }

    @PutMapping("/preferences")
    @Operation(summary = "Update my notification preferences")
    public ResponseEntity<ApiResponse<NotificationPreferenceResponse>> updatePreferences(
            @Valid @RequestBody NotificationPreferenceRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Preferences updated", notificationService.updateMyPreferences(request)));
    }

    @GetMapping("/logs")
    @Operation(summary = "Get my notification log (paginated, newest first)")
    public ResponseEntity<ApiResponse<Page<NotificationLogResponse>>> getLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(ApiResponse.success("Notification logs retrieved", notificationService.getMyLogs(pageable)));
    }

    @GetMapping("/logs/unread/count")
    @Operation(summary = "Get count of unread notifications")
    public ResponseEntity<ApiResponse<Long>> countUnread() {
        return ResponseEntity.ok(ApiResponse.success("Unread count retrieved", notificationService.countUnread()));
    }

    @PutMapping("/logs/{id}/read")
    @Operation(summary = "Mark a single notification as read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read", null));
    }

    @PutMapping("/logs/read-all")
    @Operation(summary = "Mark all notifications as read")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead() {
        notificationService.markAllAsRead();
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read", null));
    }

    // Internal endpoint — called by other microservices via Feign, not exposed to end-users
    @PostMapping("/internal/send")
    @Operation(summary = "Internal: trigger a notification dispatch (service-to-service only)")
    public ResponseEntity<ApiResponse<Void>> sendNotification(@Valid @RequestBody SendNotificationRequest request) {
        notificationService.sendNotification(request);
        return ResponseEntity.ok(ApiResponse.success("Notification dispatched", null));
    }
}
