package com.nixtap.profileservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "social_links", indexes = {
        @Index(name = "idx_social_user_id", columnList = "user_id"),
        @Index(name = "idx_social_card_id", columnList = "card_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SocialLink {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    /** Null = appears on all cards; non-null = scoped to one card. */
    @Column(name = "card_id")
    private Long cardId;

    /**
     * LINKEDIN | GITHUB | INSTAGRAM | FACEBOOK | WHATSAPP |
     * TWITTER | YOUTUBE | WEBSITE | CUSTOM
     */
    @Column(name = "platform", nullable = false, length = 30)
    private String platform;

    @Column(name = "url", nullable = false, length = 500)
    private String url;

    @Column(name = "display_label", length = 100)
    private String displayLabel;

    @Column(name = "icon_class", length = 100)
    private String iconClass;

    @Column(name = "is_visible", nullable = false)
    @Builder.Default
    private boolean isVisible = true;

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private Integer sortOrder = 0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
