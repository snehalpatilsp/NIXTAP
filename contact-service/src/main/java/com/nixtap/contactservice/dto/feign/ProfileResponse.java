package com.nixtap.contactservice.dto.feign;

import lombok.Data;

/**
 * Mirrors only the fields from profile-service ProfileResponse
 * that are needed to build a vCard. Not all profile fields are required.
 */
@Data
public class ProfileResponse {
    private Long id;
    private Long userId;
    private String fullName;
    private String headline;
    private String designation;
    private String company;
    private String email;
    private String phone;
    private String website;
    private String address;
    private String city;
    private String state;
    private String country;
    private String profileImage;
    private boolean isPublic;
}
