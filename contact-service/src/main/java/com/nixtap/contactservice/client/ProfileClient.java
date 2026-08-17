package com.nixtap.contactservice.client;

import com.nixtap.contactservice.dto.feign.ProfileResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

/**
 * Feign client for profile-service.
 * Retrieves user profile data needed to build the vCard body.
 */
@FeignClient(name = "PROFILE-SERVICE", path = "/api/v1/profiles")
public interface ProfileClient {

    @GetMapping("/user/{userId}")
    ProfileResponse getProfileByUserId(@PathVariable Long userId);
}
