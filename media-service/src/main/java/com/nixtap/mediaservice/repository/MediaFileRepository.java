package com.nixtap.mediaservice.repository;

import com.nixtap.mediaservice.entity.MediaFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MediaFileRepository extends JpaRepository<MediaFile, Long> {

    /** All files uploaded by a user, newest first. */
    List<MediaFile> findByUserIdOrderByCreatedAtDesc(Long userId);

    /** Files filtered by media type for a user. */
    List<MediaFile> findByUserIdAndMediaTypeOrderByCreatedAtDesc(Long userId, String mediaType);

    /** Find current file for a user by media type — useful for replacing profile images. */
    Optional<MediaFile> findFirstByUserIdAndMediaTypeOrderByCreatedAtDesc(Long userId, String mediaType);

    /** All files attached to a specific entity (e.g. all images for a card). */
    List<MediaFile> findByReferenceIdAndMediaType(Long referenceId, String mediaType);

    /** Total storage used by a user in bytes. */
    @org.springframework.data.jpa.repository.Query(
        "SELECT COALESCE(SUM(f.fileSize), 0) FROM MediaFile f WHERE f.userId = :userId")
    Long sumFileSizeByUserId(@org.springframework.data.repository.query.Param("userId") Long userId);

    /** Count files per user. */
    long countByUserId(Long userId);
}
