package com.nixtap.notificationservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notification_preferences")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NotificationPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Column(name = "email_enabled", nullable = false)
    @Builder.Default
    private boolean emailEnabled = true;

    @Column(name = "sms_enabled", nullable = false)
    @Builder.Default
    private boolean smsEnabled = false;

    @Column(name = "push_enabled", nullable = false)
    @Builder.Default
    private boolean pushEnabled = false;

    /** Notify when someone views the card */
    @Column(name = "notify_on_view", nullable = false)
    @Builder.Default
    private boolean notifyOnView = false;

    /** Notify when a meeting request is received */
    @Column(name = "notify_on_meeting_request", nullable = false)
    @Builder.Default
    private boolean notifyOnMeetingRequest = true;

    /** Notify when feedback is submitted on a card */
    @Column(name = "notify_on_feedback", nullable = false)
    @Builder.Default
    private boolean notifyOnFeedback = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
