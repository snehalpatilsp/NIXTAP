package com.nixtap.themeservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_theme_selections", indexes = {
    @Index(name = "idx_uts_user_id",  columnList = "user_id"),
    @Index(name = "idx_uts_card_id",  columnList = "card_id", unique = true)
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserThemeSelection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    /** One active theme per card — enforced by unique index on card_id. */
    @Column(name = "card_id", nullable = false, unique = true)
    private Long cardId;

    /** FK reference to themes.id — logical only, cross-service style. */
    @Column(name = "theme_id", nullable = false)
    private Long themeId;

    @CreationTimestamp
    @Column(name = "applied_at", updatable = false)
    private LocalDateTime appliedAt;
}
