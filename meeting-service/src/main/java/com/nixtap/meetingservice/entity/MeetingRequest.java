package com.nixtap.meetingservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "meeting_requests", indexes = {
    @Index(name = "idx_meeting_owner_id",  columnList = "owner_id"),
    @Index(name = "idx_meeting_card_id",   columnList = "card_id"),
    @Index(name = "idx_meeting_status",    columnList = "status")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MeetingRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "owner_id", nullable = false)
    private Long ownerId;

    @Column(name = "card_id", nullable = false)
    private Long cardId;

    @Column(name = "requester_name", nullable = false, length = 100)
    private String requesterName;

    @Column(name = "requester_email", nullable = false, length = 100)
    private String requesterEmail;

    @Column(name = "requester_phone", length = 20)
    private String requesterPhone;

    @Column(name = "purpose", nullable = false, length = 200)
    private String purpose;

    @Column(name = "preferred_date", nullable = false)
    private LocalDate preferredDate;

    @Column(name = "preferred_time", length = 20)
    private String preferredTime;

    @Column(name = "message", columnDefinition = "TEXT")
    private String message;

    /** PENDING | ACCEPTED | REJECTED | CANCELLED */
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private String status = "PENDING";

    @Column(name = "owner_note", length = 500)
    private String ownerNote;

    /** One-time token emailed to the requester so they can cancel without a JWT. */
    @Column(name = "cancel_token", length = 64, unique = true)
    private String cancelToken;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
