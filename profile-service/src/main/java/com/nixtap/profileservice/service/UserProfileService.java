package com.nixtap.profileservice.service;

import com.nixtap.profileservice.dto.request.UserProfileRequest;
import com.nixtap.profileservice.dto.response.UserProfileResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserProfileService {
    UserProfileResponse createProfile(UserProfileRequest request);
    UserProfileResponse getMyProfile();
    UserProfileResponse updateMyProfile(UserProfileRequest request);
    UserProfileResponse getProfileByUserId(Long userId);
    UserProfileResponse getPublicProfileByUserId(Long userId);
    UserProfileResponse getPublicProfileByUsername(String username);
    UserProfileResponse getProfileById(Long id);
    Page<UserProfileResponse> getAllProfiles(Pageable pageable);
    UserProfileResponse updateProfile(Long userId, UserProfileRequest request);
    void deleteProfileByUserId(Long userId);
}