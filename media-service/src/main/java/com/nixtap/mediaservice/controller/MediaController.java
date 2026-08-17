package com.nixtap.mediaservice.controller;

import com.nixtap.mediaservice.dto.response.ApiResponse;
import com.nixtap.mediaservice.dto.response.MediaFileResponse;
import com.nixtap.mediaservice.dto.response.StorageStatsResponse;
import com.nixtap.mediaservice.service.MediaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/media")
@RequiredArgsConstructor
@Tag(name = "Media Management", description = "File upload and download for NIXTAP NFC Business Cards")
public class MediaController {

    private final MediaService service;

    // -----------------------------------------------------------------------
    // POST /api/v1/media/upload  — AUTHENTICATED
    // -----------------------------------------------------------------------

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(
        summary     = "Upload a file",
        description = "Upload a profile image, cover image, resume, or certificate. "
                    + "Returns the publicUrl to store in other services (profile-service, business-card-service, etc.).\n\n"
                    + "**Supported mediaType values:** PROFILE_IMAGE | COVER_IMAGE | RESUME | CERTIFICATE | PORTFOLIO_IMAGE | AWARD_IMAGE | OTHER\n\n"
                    + "**Allowed file types:** JPEG, PNG, WebP, GIF, PDF\n\n"
                    + "**Max file size:** 10 MB"
    )
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "File uploaded successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "422", description = "Invalid file type, size exceeded, or empty file"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Authentication required")
    })
    public ResponseEntity<ApiResponse<MediaFileResponse>> upload(
            @Parameter(description = "File to upload", required = true,
                       content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE,
                                          schema = @Schema(type = "string", format = "binary")))
            @RequestParam("file") MultipartFile file,

            @Parameter(description = "Logical type: PROFILE_IMAGE | COVER_IMAGE | RESUME | CERTIFICATE | PORTFOLIO_IMAGE | AWARD_IMAGE | OTHER")
            @RequestParam(value = "mediaType", defaultValue = "OTHER") String mediaType,

            @Parameter(description = "Optional: ID of the entity this file belongs to (e.g. cardId)")
            @RequestParam(value = "referenceId", required = false) Long referenceId) {

        MediaFileResponse response = service.upload(file, mediaType, referenceId);
        return ResponseEntity.status(201)
                .body(ApiResponse.success("File uploaded successfully", response));
    }

    // -----------------------------------------------------------------------
    // GET /api/v1/media/files/{id}/download  — PUBLIC
    // -----------------------------------------------------------------------

    @GetMapping("/files/{id}/download")
    @Operation(
        summary     = "Download a file by ID",
        description = "Returns the raw file bytes with the correct Content-Type header. "
                    + "This endpoint is **public** — no JWT required. "
                    + "Use the publicUrl returned from /upload to embed images in cards.",
        responses = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200",
                description = "File bytes",
                content = @Content(mediaType = "*/*",
                                   schema = @Schema(type = "string", format = "binary"))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404",
                description = "File not found")
        }
    )
    public ResponseEntity<byte[]> download(
            @Parameter(description = "MediaFile database ID", required = true)
            @PathVariable Long id) {

        byte[]  bytes    = service.downloadBytes(id);
        String  mimeType = service.getMimeType(id);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(mimeType));
        headers.setContentLength(bytes.length);
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"media-" + id + "\"");

        return ResponseEntity.ok().headers(headers).body(bytes);
    }

    // -----------------------------------------------------------------------
    // GET /api/v1/media/files  — AUTHENTICATED
    // -----------------------------------------------------------------------

    @GetMapping("/files")
    @Operation(summary = "List all files uploaded by the authenticated user")
    public ResponseEntity<ApiResponse<List<MediaFileResponse>>> getMyFiles() {
        return ResponseEntity.ok(ApiResponse.success("Files retrieved", service.getMyFiles()));
    }

    // -----------------------------------------------------------------------
    // GET /api/v1/media/files/type/{mediaType}  — AUTHENTICATED
    // -----------------------------------------------------------------------

    @GetMapping("/files/type/{mediaType}")
    @Operation(summary = "List files by type for the authenticated user",
               description = "Valid types: PROFILE_IMAGE, COVER_IMAGE, RESUME, CERTIFICATE, PORTFOLIO_IMAGE, AWARD_IMAGE, OTHER")
    public ResponseEntity<ApiResponse<List<MediaFileResponse>>> getByType(
            @PathVariable String mediaType) {
        return ResponseEntity.ok(ApiResponse.success("Files retrieved",
                service.getMyFilesByType(mediaType)));
    }

    // -----------------------------------------------------------------------
    // GET /api/v1/media/files/reference/{referenceId}  — AUTHENTICATED
    // -----------------------------------------------------------------------

    @GetMapping("/files/reference/{referenceId}")
    @Operation(summary = "List files attached to a specific entity (e.g. all images for a card)")
    public ResponseEntity<ApiResponse<List<MediaFileResponse>>> getByReference(
            @PathVariable Long referenceId,
            @RequestParam(defaultValue = "OTHER") String mediaType) {
        return ResponseEntity.ok(ApiResponse.success("Files retrieved",
                service.getFilesByReference(referenceId, mediaType)));
    }

    // -----------------------------------------------------------------------
    // GET /api/v1/media/storage/stats  — AUTHENTICATED
    // -----------------------------------------------------------------------

    @GetMapping("/storage/stats")
    @Operation(summary = "Get storage usage stats for the authenticated user",
               description = "Returns total file count and total disk usage in bytes and human-readable format.")
    public ResponseEntity<ApiResponse<StorageStatsResponse>> getStats() {
        return ResponseEntity.ok(ApiResponse.success("Storage stats retrieved",
                service.getMyStorageStats()));
    }

    // -----------------------------------------------------------------------
    // DELETE /api/v1/media/files/{id}  — AUTHENTICATED (owner only)
    // -----------------------------------------------------------------------

    @DeleteMapping("/files/{id}")
    @Operation(summary = "Delete a file — removes from disk and database (owner only)")
    public ResponseEntity<ApiResponse<Void>> deleteFile(
            @Parameter(description = "MediaFile database ID", required = true)
            @PathVariable Long id) {
        service.deleteFile(id);
        return ResponseEntity.ok(ApiResponse.success("File deleted successfully", null));
    }
}
