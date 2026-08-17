package com.nixtap.businesscardservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class BusinessCardRequest {

    // userId is intentionally NOT validated here — it is set by the service
    // from the authenticated principal, never from the request body.
    private Long userId;

    @NotBlank(message = "Card title is required")
    @Size(min = 2, max = 100, message = "Card title must be between 2 and 100 characters")
    private String cardTitle;

    @Size(max = 100, message = "Company name cannot exceed 100 characters")
    private String company;

    @Size(max = 100, message = "Designation cannot exceed 100 characters")
    private String designation;

    // theme is optional — defaults to "default" if not supplied
    @Size(max = 50, message = "Theme name cannot exceed 50 characters")
    private String theme = "default";

    @Pattern(regexp = "^[a-z0-9-]+$", message = "Slug must contain only lowercase letters, numbers, and hyphens")
    @Size(min = 3, max = 100, message = "Slug must be between 3 and 100 characters")
    private String slug;

    private boolean isPublic = true;
    private String profileImage;
    private String coverImage;
}