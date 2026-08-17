package com.nixtap.notificationservice.service;

import com.nixtap.notificationservice.dto.request.NotificationPreferenceRequest;
import com.nixtap.notificationservice.dto.request.SendNotificationRequest;
import com.nixtap.notificationservice.dto.response.NotificationLogResponse;
import com.nixtap.notificationservice.dto.response.NotificationPreferenceResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface NotificationService {
    /** Get or auto-create notification preferences for the authenticated user. */
    NotificationPreferenceResponse getMyPreferences();

    /** Update preferences for the authenticated user. */
    NotificationPreferenceResponse updateMyPreferences(NotificationPreferenceRequest request);

    /** Paginated notification log for the authenticated user. */
    Page<NotificationLogResponse> getMyLogs(Pageable pageable);

    /** Count unread notifications for the authenticated user. */
    long countUnread();

    /** Mark a single log entry as read. */
    void markAsRead(Long logId);

    /** Mark all log entries as read for the authenticated user. */
    void markAllAsRead();

    /**
     * Internal: dispatch a notification respecting user preferences.
     * Called by other services via Feign — not exposed to end users.
     */
    void sendNotification(SendNotificationRequest request);
}
