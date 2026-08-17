package com.nixtap.analyticsservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "analytics_events", indexes = {
    @Index(name = "idx_owner_id", columnList = "owner_id"),
    @Index(name = "idx_owner_target_type", columnList = "owner_id, target_type"),
    @Index(name = "idx_owner_event_type", columnList = "owner_id, event_type")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalyticsEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The ID of the resource owner — maps to userId in auth-service (stored as String for flexibility). */
    @Column(name = "owner_id", nullable = false)
    private String ownerId;

    /** Type of the resource being tracked: CARD, PORTFOLIO, QR */
    @Column(name = "target_type", nullable = false, length = 20)
    private String targetType;

    /** The ID of the specific card / portfolio / QR code being interacted with. */
    @Column(name = "target_id", nullable = false, length = 100)
    private String targetId;

    /** Interaction type: VIEW, SCAN, TAP */
    @Column(name = "event_type", nullable = false, length = 20)
    private String eventType;

    /** IPv4 or IPv6 address of the visitor. */
    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    /** Raw User-Agent header from the visitor's browser / device. */
    @Column(name = "user_agent", length = 500)
    private String userAgent;

    /** Parsed device category: MOBILE, DESKTOP, TABLET, UNKNOWN */
    @Column(name = "device_type", length = 20)
    private String deviceType;

    /** Parsed browser: CHROME, SAFARI, FIREFOX, EDGE, OTHER */
    @Column(name = "browser", length = 20)
    private String browser;

    /** HTTP Referer header — where the visitor came from. */
    @Column(name = "referrer", length = 500)
    private String referrer;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
