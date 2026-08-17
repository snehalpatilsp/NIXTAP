package com.nixtap.contactservice.client;

import com.nixtap.contactservice.dto.feign.SocialLinkResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

/**
 * Feign client for social-service.
 * Retrieves the user's visible social media links for vCard X-SOCIALPROFILE entries.
 */
@FeignClient(name = "SOCIAL-SERVICE", path = "/api/v1/social")
public interface SocialClient {

    @GetMapping("/links/public/user/{userId}")
    List<SocialLinkResponse> getPublicLinksByUserId(@PathVariable Long userId);
}
