package com.nixtap.mediaservice.util;

import com.nixtap.mediaservice.exception.InvalidFileException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

/**
 * Handles all file I/O: validation, saving to disk, reading, deleting.
 * Uses the same pattern as QrGeneratorUtil in qr-service.
 */
@Slf4j
@Component
public class FileStorageUtil {

    @Value("${media.storage.path}")
    private String storagePath;

    @Value("${media.max-file-size-bytes}")
    private long maxFileSizeBytes;

    @Value("${media.allowed-types}")
    private List<String> allowedTypes;

    // -----------------------------------------------------------------------
    // Public API
    // -----------------------------------------------------------------------

    /**
     * Validates the file, saves it under a UUID-based filename inside a user-scoped
     * subdirectory, and returns the saved filename (not the full path).
     *
     * @param file   incoming multipart file
     * @param userId owner — used to create a subdirectory per user
     * @return UUID-based filename (e.g. "550e8400-uuid.jpg")
     * @throws InvalidFileException if type or size validation fails
     */
    public String save(MultipartFile file, Long userId) {
        validateFile(file);

        try {
            // Create user-scoped subdirectory: {storagePath}/{userId}/
            Path userDir = Paths.get(storagePath, String.valueOf(userId));
            if (!Files.exists(userDir)) {
                Files.createDirectories(userDir);
                log.info("Created media directory for userId={}: {}", userId, userDir.toAbsolutePath());
            }

            String extension  = extractExtension(file.getOriginalFilename());
            String uniqueName = UUID.randomUUID() + extension;
            Path   targetPath = userDir.resolve(uniqueName);

            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
            log.info("Saved media file: {}", targetPath.toAbsolutePath());

            return uniqueName;

        } catch (IOException e) {
            throw new com.nixtap.mediaservice.exception.InvalidFileException(
                    "Failed to save file: " + e.getMessage());
        }
    }

    /**
     * Reads a file from disk and returns its raw bytes for streaming to the client.
     *
     * @param filePath absolute path to the file
     * @return raw bytes
     */
    public byte[] readBytes(String filePath) {
        try {
            Path path = Paths.get(filePath);
            if (!Files.exists(path)) {
                throw new com.nixtap.mediaservice.exception.ResourceNotFoundException(
                        "File not found on disk: " + filePath);
            }
            return Files.readAllBytes(path);
        } catch (IOException e) {
            throw new com.nixtap.mediaservice.exception.InvalidFileException(
                    "Failed to read file: " + e.getMessage());
        }
    }

    /**
     * Deletes a file from disk. Silently ignores missing files — deletion is
     * best-effort during record cleanup.
     *
     * @param filePath absolute path to the file
     */
    public void delete(String filePath) {
        if (filePath == null || filePath.isBlank()) return;
        try {
            Path path = Paths.get(filePath);
            Files.deleteIfExists(path);
            log.info("Deleted media file: {}", filePath);
        } catch (IOException e) {
            log.warn("Could not delete file {}: {}", filePath, e.getMessage());
        }
    }

    /**
     * Builds the absolute file path from storagePath + userId + fileName.
     */
    public String buildAbsolutePath(Long userId, String fileName) {
        return Paths.get(storagePath, String.valueOf(userId), fileName)
                .toAbsolutePath().toString();
    }

    // -----------------------------------------------------------------------
    // Private helpers
    // -----------------------------------------------------------------------

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidFileException("File must not be empty.");
        }

        // Size check
        if (file.getSize() > maxFileSizeBytes) {
            throw new InvalidFileException(
                    "File size " + formatSize(file.getSize()) + " exceeds the maximum allowed 10 MB.");
        }

        // MIME type check — getContentType() is client-supplied but we check extension too
        String contentType = file.getContentType();
        if (contentType == null || !allowedTypes.contains(contentType.toLowerCase())) {
            throw new InvalidFileException(
                    "File type '" + contentType + "' is not allowed. " +
                    "Accepted types: JPEG, PNG, WebP, GIF, PDF.");
        }

        // Extension check — secondary guard against content-type spoofing
        String originalName = file.getOriginalFilename();
        if (originalName == null || originalName.isBlank() || !originalName.contains(".")) {
            throw new InvalidFileException("File must have a valid extension.");
        }

        String ext = originalName.substring(originalName.lastIndexOf('.')).toLowerCase();
        List<String> allowedExtensions = List.of(".jpg", ".jpeg", ".png", ".webp", ".gif", ".pdf");
        if (!allowedExtensions.contains(ext)) {
            throw new InvalidFileException(
                    "Extension '" + ext + "' is not allowed. Accepted: " + allowedExtensions);
        }
    }

    private String extractExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "";
        return filename.substring(filename.lastIndexOf('.')).toLowerCase();
    }

    private String formatSize(long bytes) {
        if (bytes < 1024)       return bytes + " B";
        if (bytes < 1048576)    return String.format("%.1f KB", bytes / 1024.0);
        return String.format("%.1f MB", bytes / 1048576.0);
    }
}
