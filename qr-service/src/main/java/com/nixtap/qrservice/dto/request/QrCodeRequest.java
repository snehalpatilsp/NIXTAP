package com.nixtap.qrservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class QrCodeRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    // cardId is optional — a QR code may point to a URL not tied to a specific card
    private Long cardId;

    @NotBlank(message = "Target URL is required")
    @Size(max = 1000, message = "Target URL cannot exceed 1000 characters")
    private String targetUrl;

    @Pattern(
        regexp = "^#([A-Fa-f0-9]{6})$",
        message = "Foreground color must be a valid hex color code (e.g. #000000)"
    )
    private String foregroundColor = "#000000";

    @Pattern(
        regexp = "^#([A-Fa-f0-9]{6})$",
        message = "Background color must be a valid hex color code (e.g. #FFFFFF)"
    )
    private String backgroundColor = "#FFFFFF";
}
