package com.nixtap.qrservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "qr_codes", indexes = {
    @Index(name = "idx_qr_user_id", columnList = "user_id"),
    @Index(name = "idx_qr_card_id", columnList = "card_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QrCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "card_id")
    private Long cardId;

    @Column(name = "qr_code_path", nullable = false, length = 500)
    private String qrCodePath;

    @Column(name = "target_url", nullable = false, length = 1000)
    private String targetUrl;

    @Column(name = "foreground_color", nullable = false, length = 10)
    @Builder.Default
    private String foregroundColor = "#000000";

    @Column(name = "background_color", nullable = false, length = 10)
    @Builder.Default
    private String backgroundColor = "#FFFFFF";

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
