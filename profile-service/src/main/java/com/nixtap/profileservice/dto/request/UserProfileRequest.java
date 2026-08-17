package com.nixtap.profileservice.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserProfileRequest {

    // userId is set by service from authenticated principal when updating via /me
    private Long userId;

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    private String fullName;

    @Size(max = 100, message = "Username cannot exceed 100 characters")
    private String username;

    @Size(max = 150, message = "Headline cannot exceed 150 characters")
    private String headline;

    @Size(max = 100, message = "Designation cannot exceed 100 characters")
    private String designation;

    @Size(max = 100, message = "Company name cannot exceed 100 characters")
    private String company;

    @Size(max = 2000, message = "Bio cannot exceed 2000 characters")
    private String bio;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email address format")
    private String email;

    @Pattern(regexp = "^\\+?[0-9]{7,15}$", message = "Invalid phone number format")
    private String phone;

    private String website;
    private String address;
    private String city;
    private String state;
    private String country;
    private String profileImage;
    private String coverImage;
    @com.fasterxml.jackson.annotation.JsonProperty("isPublic")
    @com.fasterxml.jackson.annotation.JsonAlias({"public"})
    private boolean isPublic = true;
}