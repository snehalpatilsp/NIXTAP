package com.nixtap.mediaservice.service;

import com.nixtap.mediaservice.dto.response.MediaFileResponse;
import com.nixtap.mediaservice.dto.response.StorageStatsResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface MediaService {

    /**
     * Upload a file. Validates type and size, saves to disk, persists metadata,
     * and returns the response containing the {@code publicUrl} to store elsewhere.
     *
     * @param file        incoming multipart file
     * @param mediaType   logical category (PROFILE_IMAGE, COVER_IMAGE, RESUME, etc.)
     * @param referenceId optional entity ID this file belongs to
     */
    MediaFileResponse upload(MultipartFile file, String mediaType, Long referenceId);

    /**
     * Reads the file bytes from disk for streaming.
     * This endpoint is public — no auth required.
     *
     * @param fileId database ID of the MediaFile record
     * @return raw file bytes + MIME type info
     */
    byte[] downloadBytes(Long fileId);

    /**
     * Returns the MIME type for a file — needed by the download endpoint to set
     * the correct Content-Type response header.
     */
    String getMimeType(Long fileId);

    /**
     * All files uploaded by the authenticated user, newest first.
     */
    List<MediaFileResponse> getMyFiles();

    /**
     * Files filtered by media type for the authenticated user.
     */
    List<MediaFileResponse> getMyFilesByType(String mediaType);

    /**
     * Files attached to a specific entity (e.g. all images for a card).
     */
    List<MediaFileResponse> getFilesByReference(Long referenceId, String mediaType);

    /**
     * Storage usage summary for the authenticated user.
     */
    StorageStatsResponse getMyStorageStats();

    /**
     * Delete a file — removes from disk and DB. Owner only.
     *
     * @param fileId database ID of the MediaFile record
     */
    void deleteFile(Long fileId);
}
