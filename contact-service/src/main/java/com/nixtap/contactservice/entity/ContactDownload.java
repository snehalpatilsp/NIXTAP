package com.nixtap.contactservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "contact_downloads", indexes = {
    @Index(name = "idx_cd_user_id",  columnList = "user_id"),
    @Index(name = "idx_cd_card_id",  columnList = "card_id")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ContactDownload {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Owner of the card whose vCard was downloaded. */
    @Column(name = "user_id", nullable = false)
    private Long userId;

    /** Optional: card-scoped download vs. user-global download. */
    @Column(name = "card_id")
    private Long cardId;

    @Column(name = "downloader_ip", length = 45)
    private String downloaderIp;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
