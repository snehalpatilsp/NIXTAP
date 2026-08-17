package com.nixtap.profileservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserProfileResponse {

    private Long id;
    private Long userId;
    private String fullName;
    private String username;
    private String headline;
    private String designation;
    private String company;
    private String bio;
    private String email;
    private String phone;
    private String website;
    private String address;
    private String city;
    private String state;
    private String country;
    private String profileImage;
    private String coverImage;
    @com.fasterxml.jackson.annotation.JsonProperty("isPublic")
    @Builder.Default
    private boolean isPublic = true;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}