package com.nixtap.mediaservice.service.impl;

import com.nixtap.mediaservice.dto.response.MediaFileResponse;
import com.nixtap.mediaservice.dto.response.StorageStatsResponse;
import com.nixtap.mediaservice.entity.MediaFile;
import com.nixtap.mediaservice.exception.MediaAccessDeniedException;
import com.nixtap.mediaservice.exception.ResourceNotFoundException;
import com.nixtap.mediaservice.repository.MediaFileRepository;
import com.nixtap.mediaservice.security.AuthenticatedUser;
import com.nixtap.mediaservice.service.MediaService;
import com.nixtap.mediaservice.util.FileStorageUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class MediaServiceImpl implements MediaService {

    private final MediaFileRepository repository;
    private final FileStorageUtil      fileStorageUtil;

    @Value("${media.base-url}")
    private String baseUrl;

    // -----------------------------------------------------------------------
    // Security helpers
    // -----------------------------------------------------------------------

    private Long getAuthenticatedUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof AuthenticatedUser principal)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required.");
        }
        return principal.getUserId();
    }

    private void assertOwner(MediaFile file) {
        if (!file.getUserId().equals(getAuthenticatedUserId())) {
            throw new MediaAccessDeniedException("You do not have permission to access this file.");
        }
    }

    // -----------------------------------------------------------------------
    // Upload
    // -----------------------------------------------------------------------

    @Override
    @Transactional
    public MediaFileResponse upload(MultipartFile file, String mediaType, Long referenceId) {
        Long callerId = getAuthenticatedUserId();

        // Save file to disk — FileStorageUtil handles validation + I/O
        String savedFileName = fileStorageUtil.save(file, callerId);
        String absolutePath  = fileStorageUtil.buildAbsolutePath(callerId, savedFileName);

        // Persist entity — publicUrl is built after save using DB-generated ID
        MediaFile entity = MediaFile.builder()
                .userId(callerId)
                .mediaType(mediaType != null ? mediaType.toUpperCase() : "OTHER")
                .referenceId(referenceId)
                .fileName(savedFileName)
                .originalName(file.getOriginalFilename() != null ? file.getOriginalFilename() : savedFileName)
                .mimeType(file.getContentType() != null ? file.getContentType() : "application/octet-stream")
                .fileSize(file.getSize())
                .filePath(absolutePath)
                .publicUrl("") // set below after ID is known
                .build();

        MediaFile saved = repository.save(entity);

        // Build publicUrl using the DB-generated ID and update with a single additional save.
        // This is intentional — Spring's @GeneratedValue ID is only available post-persist.
        saved.setPublicUrl(baseUrl + "/api/v1/media/files/" + saved.getId() + "/download");
        saved = repository.save(saved);

        return toResponse(saved);
    }

    // -----------------------------------------------------------------------
    // Download
    // -----------------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public byte[] downloadBytes(Long fileId) {
        // Download is public — no ownership check
        MediaFile file = repository.findById(fileId)
                .orElseThrow(() -> new ResourceNotFoundException("Media file not found: " + fileId));
        return fileStorageUtil.readBytes(file.getFilePath());
    }

    @Override
    @Transactional(readOnly = true)
    public String getMimeType(Long fileId) {
        return repository.findById(fileId)
                .orElseThrow(() -> new ResourceNotFoundException("Media file not found: " + fileId))
                .getMimeType();
    }

    // -----------------------------------------------------------------------
    // List / Query
    // -----------------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public List<MediaFileResponse> getMyFiles() {
        return repository.findByUserIdOrderByCreatedAtDesc(getAuthenticatedUserId())
                .stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<MediaFileResponse> getMyFilesByType(String mediaType) {
        return repository.findByUserIdAndMediaTypeOrderByCreatedAtDesc(
                        getAuthenticatedUserId(), mediaType.toUpperCase())
                .stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<MediaFileResponse> getFilesByReference(Long referenceId, String mediaType) {
        return repository.findByReferenceIdAndMediaType(referenceId, mediaType.toUpperCase())
                .stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public StorageStatsResponse getMyStorageStats() {
        Long userId       = getAuthenticatedUserId();
        long totalFiles   = repository.countByUserId(userId);
        long totalBytes   = repository.sumFileSizeByUserId(userId);
        return StorageStatsResponse.builder()
                .userId(userId)
                .totalFiles(totalFiles)
                .totalSizeBytes(totalBytes)
                .totalSizeReadable(formatSize(totalBytes))
                .build();
    }

    // -----------------------------------------------------------------------
    // Delete
    // -----------------------------------------------------------------------

    @Override
    @Transactional
    public void deleteFile(Long fileId) {
        MediaFile file = repository.findById(fileId)
                .orElseThrow(() -> new ResourceNotFoundException("Media file not found: " + fileId));
        assertOwner(file);
        // Best-effort disk delete before DB delete
        fileStorageUtil.delete(file.getFilePath());
        repository.delete(file);
    }

    // -----------------------------------------------------------------------
    // Private helpers
    // -----------------------------------------------------------------------

    private MediaFileResponse toResponse(MediaFile f) {
        return MediaFileResponse.builder()
                .id(f.getId()).userId(f.getUserId()).mediaType(f.getMediaType())
                .referenceId(f.getReferenceId()).fileName(f.getFileName())
                .originalName(f.getOriginalName()).mimeType(f.getMimeType())
                .fileSize(f.getFileSize()).publicUrl(f.getPublicUrl())
                .createdAt(f.getCreatedAt()).build();
    }

    private String formatSize(long bytes) {
        if (bytes < 1024)    return bytes + " B";
        if (bytes < 1048576) return String.format("%.1f KB", bytes / 1024.0);
        return String.format("%.1f MB", bytes / 1048576.0);
    }
}
