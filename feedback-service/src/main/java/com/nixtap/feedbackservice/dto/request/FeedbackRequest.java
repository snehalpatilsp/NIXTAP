package com.nixtap.feedbackservice.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class FeedbackRequest {

    @NotNull(message = "cardId is required")
    private Long cardId;

    @NotNull(message = "ownerId is required")
    private Long ownerId;

    @NotBlank(message = "visitorName is required")
    @Size(max = 100, message = "visitorName cannot exceed 100 characters")
    private String visitorName;

    @Email(message = "visitorEmail must be a valid email address")
    @Size(max = 100, message = "visitorEmail cannot exceed 100 characters")
    private String visitorEmail;

    @NotNull(message = "rating is required")
    @Min(value = 1, message = "rating must be at least 1")
    @Max(value = 5, message = "rating cannot exceed 5")
    private Integer rating;

    @Size(max = 2000, message = "comment cannot exceed 2000 characters")
    private String comment;

    /** Populated server-side from HttpServletRequest — not supplied by the visitor. */
    private String visitorIp;
}
