package com.nixtap.nfcservice.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class NfcTagLinkRequest {

    @NotNull(message = "cardId is required")
    private Long cardId;

    @NotBlank(message = "linkedUrl is required")
    @Size(max = 500, message = "linkedUrl cannot exceed 500 characters")
    private String linkedUrl;
}
