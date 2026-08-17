package com.nixtap.contactservice.dto.feign;

import lombok.Data;

/**
 * Mirrors SocialLinkResponse from social-service — only fields used in vCard generation.
 */
@Data
public class SocialLinkResponse {
    private Long id;
    private String platform;
    private String url;
    private String displayLabel;
    private boolean isVisible;
}
