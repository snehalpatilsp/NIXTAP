package com.nixtap.profileservice.controller;

import com.nixtap.profileservice.dto.request.UserProfileRequest;
import com.nixtap.profileservice.dto.response.ApiResponse;
import com.nixtap.profileservice.dto.response.UserProfileResponse;
import com.nixtap.profileservice.service.UserProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/profiles")
@RequiredArgsConstructor
@Tag(name = "User Profile Management", description = "CRUD APIs for Managing User Profiles")
public class UserProfileController {

    private final UserProfileService profileService;

    @PostMapping
    @Operation(summary = "Create a new User Profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> createProfile(@Valid @RequestBody UserProfileRequest request) {
        UserProfileResponse response = profileService.createProfile(request);
        return new ResponseEntity<>(ApiResponse.success("Profile created successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated User Profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getMyProfile() {
        UserProfileResponse response = profileService.getMyProfile();
        return ResponseEntity.ok(ApiResponse.success("Profile retrieved successfully", response));
    }

    @PutMapping("/me")
    @Operation(summary = "Update current authenticated User Profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateMyProfile(@Valid @RequestBody UserProfileRequest request) {
        UserProfileResponse response = profileService.updateMyProfile(request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get User Profile by User ID")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getProfileByUserId(@PathVariable Long userId) {
        UserProfileResponse response = profileService.getProfileByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success("Profile retrieved successfully", response));
    }

    @GetMapping("/public/user/{userId}")
    @Operation(summary = "Public endpoint to view User Profile by User ID")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getPublicProfileByUserId(@PathVariable Long userId) {
        UserProfileResponse response = profileService.getPublicProfileByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success("Public profile retrieved successfully", response));
    }

    @GetMapping("/public/username/{username}")
    @Operation(summary = "Public endpoint to view User Profile by Username")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getPublicProfileByUsername(@PathVariable String username) {
        UserProfileResponse response = profileService.getPublicProfileByUsername(username);
        return ResponseEntity.ok(ApiResponse.success("Public profile retrieved successfully", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get User Profile by Profile ID")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getProfileById(@PathVariable Long id) {
        UserProfileResponse response = profileService.getProfileById(id);
        return ResponseEntity.ok(ApiResponse.success("Profile retrieved successfully", response));
    }

    @GetMapping
    @Operation(summary = "Get paginated list of all User Profiles")
    public ResponseEntity<ApiResponse<Page<UserProfileResponse>>> getAllProfiles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<UserProfileResponse> profiles = profileService.getAllProfiles(pageable);

        return ResponseEntity.ok(ApiResponse.success("Profiles retrieved successfully", profiles));
    }

    @PutMapping("/user/{userId}")
    @Operation(summary = "Update User Profile by User ID")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateProfile(
            @PathVariable Long userId,
            @Valid @RequestBody UserProfileRequest request) {

        UserProfileResponse response = profileService.updateProfile(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));
    }

    @DeleteMapping("/user/{userId}")
    @Operation(summary = "Delete User Profile by User ID")
    public ResponseEntity<ApiResponse<Void>> deleteProfile(@PathVariable Long userId) {
        profileService.deleteProfileByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success("Profile deleted successfully", null));
    }
}