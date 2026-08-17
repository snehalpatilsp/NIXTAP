package com.nixtap.notificationservice.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class NotificationPreferenceRequest {

    @NotNull(message = "emailEnabled must not be null")
    private Boolean emailEnabled;

    @NotNull(message = "smsEnabled must not be null")
    private Boolean smsEnabled;

    @NotNull(message = "pushEnabled must not be null")
    private Boolean pushEnabled;

    @NotNull(message = "notifyOnView must not be null")
    private Boolean notifyOnView;

    @NotNull(message = "notifyOnMeetingRequest must not be null")
    private Boolean notifyOnMeetingRequest;

    @NotNull(message = "notifyOnFeedback must not be null")
    private Boolean notifyOnFeedback;
}
