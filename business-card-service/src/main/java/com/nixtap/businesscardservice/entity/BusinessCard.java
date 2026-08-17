package com.nixtap.businesscardservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "business_cards", indexes = {
    @Index(name = "idx_card_user_id", columnList = "user_id"),
    @Index(name = "idx_card_slug",    columnList = "slug", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BusinessCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "card_title", nullable = false, length = 100)
    private String cardTitle;

    @Column(length = 100)
    private String company;

    @Column(length = 100)
    private String designation;

    @Column(nullable = false, length = 50)
    private String theme;

    @Column(nullable = false, unique = true, length = 100)
    private String slug;

    @Column(name = "is_public", nullable = false)
    private boolean isPublic;

    @Column(name = "profile_image", length = 500)
    private String profileImage;

    @Column(name = "cover_image", length = 500)
    private String coverImage;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}