package com.nixtap.socialservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SocialLinkRequest {

    @NotNull(message = "userId is required")
    private Long userId;

    private Long cardId;

    @NotBlank(message = "platform is required")
    @Pattern(
        regexp = "^(LINKEDIN|GITHUB|INSTAGRAM|FACEBOOK|WHATSAPP|TWITTER|YOUTUBE|WEBSITE|CUSTOM)$",
        message = "platform must be one of: LINKEDIN, GITHUB, INSTAGRAM, FACEBOOK, WHATSAPP, TWITTER, YOUTUBE, WEBSITE, CUSTOM"
    )
    private String platform;

    @NotBlank(message = "url is required")
    @Size(max = 500, message = "url cannot exceed 500 characters")
    private String url;

    @Size(max = 100, message = "displayLabel cannot exceed 100 characters")
    private String displayLabel;

    @Size(max = 100, message = "iconClass cannot exceed 100 characters")
    private String iconClass;

    private Boolean isVisible = true;

    private Integer sortOrder = 0;
}
