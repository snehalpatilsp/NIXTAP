package com.nixtap.businesscardservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "themes", indexes = {
    @Index(name = "idx_theme_slug",   columnList = "slug",      unique = true),
    @Index(name = "idx_theme_active", columnList = "is_active")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Theme {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 100)
    private String slug;

    @Column(length = 500)
    private String description;

    @Column(name = "primary_color",    length = 10) private String primaryColor;
    @Column(name = "secondary_color",  length = 10) private String secondaryColor;
    @Column(name = "background_color", length = 10) private String backgroundColor;
    @Column(name = "text_color",       length = 10) private String textColor;

    @Column(name = "preview_image_url", length = 500)
    private String previewImageUrl;

    @Column(name = "is_active", nullable = false)
    @Builder.Default private boolean isActive  = true;

    @Column(name = "is_premium", nullable = false)
    @Builder.Default private boolean isPremium = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
