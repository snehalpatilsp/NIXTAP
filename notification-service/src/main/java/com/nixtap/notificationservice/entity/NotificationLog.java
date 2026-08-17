package com.nixtap.notificationservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notification_logs", indexes = {
    @Index(name = "idx_notif_log_user_id", columnList = "user_id"),
    @Index(name = "idx_notif_log_status",  columnList = "status")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NotificationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    /** EMAIL | SMS | PUSH */
    @Column(name = "channel", nullable = false, length = 10)
    private String channel;

    /** MEETING_REQUEST | FEEDBACK_RECEIVED | PROFILE_VIEW_MILESTONE | WELCOME | PASSWORD_RESET */
    @Column(name = "type", nullable = false, length = 50)
    private String type;

    @Column(name = "subject", length = 200)
    private String subject;

    @Column(name = "body", columnDefinition = "TEXT")
    private String body;

    /** SENT | FAILED | SKIPPED */
    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @Column(name = "error_message", length = 500)
    private String errorMessage;

    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private boolean isRead = false;

    @CreationTimestamp
    @Column(name = "sent_at", updatable = false)
    private LocalDateTime sentAt;
}
