package com.nixtap.notificationservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Internal request DTO — used by other services via Feign to trigger notifications.
 * Not exposed directly through the API gateway to end-users.
 */
@Data
public class SendNotificationRequest {

    @NotNull(message = "userId is required")
    private Long userId;

    /** The actual recipient email address — resolved by the calling service. */
    @NotBlank(message = "recipientEmail is required")
    @jakarta.validation.constraints.Email(message = "recipientEmail must be a valid email")
    private String recipientEmail;

    /** MEETING_REQUEST | FEEDBACK_RECEIVED | PROFILE_VIEW_MILESTONE | WELCOME | PASSWORD_RESET */
    @NotBlank(message = "type is required")
    private String type;

    @NotBlank(message = "subject is required")
    private String subject;

    @NotBlank(message = "body is required")
    private String body;

    /** Optional: override channel. If null, all enabled channels are used. */
    private String channel;
}
