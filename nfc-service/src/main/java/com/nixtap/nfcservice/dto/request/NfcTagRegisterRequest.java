package com.nixtap.nfcservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class NfcTagRegisterRequest {

    @NotNull(message = "userId is required")
    private Long userId;

    @NotBlank(message = "tagUid is required")
    @Size(max = 64, message = "tagUid cannot exceed 64 characters")
    private String tagUid;

    @Pattern(
        regexp = "^(NTAG213|NTAG215|NTAG216|UNKNOWN)$",
        message = "tagType must be one of: NTAG213, NTAG215, NTAG216, UNKNOWN"
    )
    private String tagType = "UNKNOWN";

    @Size(max = 255, message = "notes cannot exceed 255 characters")
    private String notes;
}
