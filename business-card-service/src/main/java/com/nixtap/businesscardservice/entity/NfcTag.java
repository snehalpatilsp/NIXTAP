package com.nixtap.businesscardservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "nfc_tags", indexes = {
    @Index(name = "idx_nfc_user_id", columnList = "user_id"),
    @Index(name = "idx_nfc_tag_uid", columnList = "tag_uid", unique = true),
    @Index(name = "idx_nfc_card_id", columnList = "card_id")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NfcTag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "card_id")
    private Long cardId;

    /** Hardware UID of the physical NFC chip — globally unique. */
    @Column(name = "tag_uid", nullable = false, unique = true, length = 64)
    private String tagUid;

    /** NTAG213 | NTAG215 | NTAG216 | UNKNOWN */
    @Column(name = "tag_type", nullable = false, length = 20)
    @Builder.Default
    private String tagType = "UNKNOWN";

    /** ACTIVE | INACTIVE | LOST | REPLACED */
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private String status = "ACTIVE";

    /** URL written to the NFC tag — e.g. https://nixtap.com/card/{slug} */
    @Column(name = "linked_url", length = 500)
    private String linkedUrl;

    /** User-defined label, e.g. "Black Metal Card". */
    @Column(name = "notes", length = 255)
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
