package com.nixtap.mediaservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "media_files", indexes = {
    @Index(name = "idx_media_user_id",   columnList = "user_id"),
    @Index(name = "idx_media_type",      columnList = "media_type"),
    @Index(name = "idx_media_ref_id",    columnList = "reference_id")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MediaFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Owner of this file — maps to userId in auth-service. */
    @Column(name = "user_id", nullable = false)
    private Long userId;

    /**
     * Logical category of this file.
     * PROFILE_IMAGE | COVER_IMAGE | RESUME | CERTIFICATE |
     * PORTFOLIO_IMAGE | AWARD_IMAGE | OTHER
     */
    @Column(name = "media_type", nullable = false, length = 30)
    private String mediaType;

    /**
     * Optional: ID of the entity this file is attached to.
     * e.g. cardId for COVER_IMAGE, portfolioId for PORTFOLIO_IMAGE.
     */
    @Column(name = "reference_id")
    private Long referenceId;

    /** UUID-based filename on disk (e.g. 550e8400-e29b-41d4-a716-446655440000.jpg) */
    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;

    /** Original filename as supplied by the client (kept for display only). */
    @Column(name = "original_name", nullable = false, length = 255)
    private String originalName;

    /** MIME type — e.g. image/jpeg, image/png, application/pdf */
    @Column(name = "mime_type", nullable = false, length = 100)
    private String mimeType;

    /** File size in bytes. */
    @Column(name = "file_size", nullable = false)
    private Long fileSize;

    /** Absolute path to the file on the server's local disk. */
    @Column(name = "file_path", nullable = false, length = 500)
    private String filePath;

    /**
     * Publicly accessible URL returned in API responses.
     * Other services store this URL in their own entities.
     * Format: {media.base-url}/api/v1/media/files/{id}/download
     */
    @Column(name = "public_url", nullable = false, length = 500)
    private String publicUrl;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
