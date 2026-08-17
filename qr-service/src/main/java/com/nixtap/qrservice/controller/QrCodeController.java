package com.nixtap.qrservice.controller;

import com.nixtap.qrservice.dto.request.QrCodeRequest;
import com.nixtap.qrservice.dto.response.ApiResponse;
import com.nixtap.qrservice.dto.response.QrCodeResponse;
import com.nixtap.qrservice.service.QrCodeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/qr")
@RequiredArgsConstructor
@Tag(name = "QR Code Management", description = "Generate, download, and manage QR codes for NIXTAP NFC Business Cards")
public class QrCodeController {

    private final QrCodeService qrCodeService;

    // -----------------------------------------------------------------------
    // POST /api/v1/qr/generate
    // -----------------------------------------------------------------------

    @PostMapping("/generate")
    @Operation(
        summary = "Generate a new QR code",
        description = "Generates a PNG QR code image for the given target URL with optional custom colors, "
                    + "saves the file to local storage, and returns the metadata record."
    )
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "201", description = "QR code generated successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "422", description = "Validation failed"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "500", description = "QR generation failed")
    })
    public ResponseEntity<ApiResponse<QrCodeResponse>> generate(
            @Valid @RequestBody QrCodeRequest request) {
        QrCodeResponse response = qrCodeService.generate(request);
        return new ResponseEntity<>(
                ApiResponse.success("QR code generated successfully", response),
                HttpStatus.CREATED);
    }

    // -----------------------------------------------------------------------
    // GET /api/v1/qr/download/{id}
    // -----------------------------------------------------------------------

    @GetMapping(value = "/download/{id}", produces = MediaType.IMAGE_PNG_VALUE)
    @Operation(
        summary = "Download QR code image",
        description = "Returns the raw PNG byte array for the QR code with the given ID. "
                    + "This endpoint is public — no JWT required. "
                    + "Suitable for embedding in <img> tags or direct browser download.",
        responses = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                responseCode = "200",
                description = "PNG image bytes",
                content = @Content(mediaType = "image/png",
                                   schema = @Schema(type = "string", format = "binary"))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                responseCode = "404", description = "QR code not found")
        }
    )
    public ResponseEntity<byte[]> download(
            @Parameter(description = "QR code database ID", required = true)
            @PathVariable Long id) {
        byte[] imageBytes = qrCodeService.download(id);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.IMAGE_PNG);
        headers.setContentLength(imageBytes.length);
        headers.set(HttpHeaders.CONTENT_DISPOSITION,
                "inline; filename=\"qr-" + id + ".png\"");
        return new ResponseEntity<>(imageBytes, headers, HttpStatus.OK);
    }

    // -----------------------------------------------------------------------
    // GET /api/v1/qr/user/{userId}
    // -----------------------------------------------------------------------

    @GetMapping("/user/{userId}")
    @Operation(
        summary = "Get all QR codes for a user",
        description = "Returns metadata for every QR code belonging to the authenticated user. "
                    + "The caller must be the owner of the userId supplied."
    )
    public ResponseEntity<ApiResponse<List<QrCodeResponse>>> getByUserId(
            @Parameter(description = "User ID to fetch QR codes for", required = true)
            @PathVariable Long userId) {
        List<QrCodeResponse> response = qrCodeService.getByUserId(userId);
        return ResponseEntity.ok(
                ApiResponse.success("QR codes retrieved successfully", response));
    }

    // -----------------------------------------------------------------------
    // GET /api/v1/qr/card/{cardId}
    // -----------------------------------------------------------------------

    @GetMapping("/card/{cardId}")
    @Operation(
        summary = "Get QR code by card ID",
        description = "Returns the QR code metadata associated with the given business card ID."
    )
    public ResponseEntity<ApiResponse<QrCodeResponse>> getByCardId(
            @Parameter(description = "Business card ID", required = true)
            @PathVariable Long cardId) {
        QrCodeResponse response = qrCodeService.getByCardId(cardId);
        return ResponseEntity.ok(
                ApiResponse.success("QR code retrieved successfully", response));
    }

    // -----------------------------------------------------------------------
    // PUT /api/v1/qr/regenerate/{id}
    // -----------------------------------------------------------------------

    @PutMapping("/regenerate/{id}")
    @Operation(
        summary = "Regenerate a QR code",
        description = "Updates the target URL and/or colors of an existing QR code record, "
                    + "deletes the old PNG file, generates a fresh PNG, and returns updated metadata."
    )
    public ResponseEntity<ApiResponse<QrCodeResponse>> regenerate(
            @Parameter(description = "QR code database ID", required = true)
            @PathVariable Long id,
            @Valid @RequestBody QrCodeRequest request) {
        QrCodeResponse response = qrCodeService.regenerate(id, request);
        return ResponseEntity.ok(
                ApiResponse.success("QR code regenerated successfully", response));
    }

    // -----------------------------------------------------------------------
    // DELETE /api/v1/qr/{id}
    // -----------------------------------------------------------------------

    @DeleteMapping("/{id}")
    @Operation(
        summary = "Delete a QR code",
        description = "Removes the QR code record from the database and deletes the PNG file from disk."
    )
    public ResponseEntity<ApiResponse<Void>> delete(
            @Parameter(description = "QR code database ID", required = true)
            @PathVariable Long id) {
        qrCodeService.delete(id);
        return ResponseEntity.ok(
                ApiResponse.success("QR code deleted successfully", null));
    }
}
