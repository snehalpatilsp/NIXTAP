package com.nixtap.themeservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ThemeRequest {

    @NotBlank(message = "name is required")
    @Size(max = 100, message = "name cannot exceed 100 characters")
    private String name;

    @NotBlank(message = "slug is required")
    @Size(max = 100, message = "slug cannot exceed 100 characters")
    @Pattern(regexp = "^[a-z0-9-]+$", message = "slug must contain only lowercase letters, digits and hyphens")
    private String slug;

    @Size(max = 500, message = "description cannot exceed 500 characters")
    private String description;

    @Pattern(regexp = "^#([A-Fa-f0-9]{6})$", message = "primaryColor must be a valid hex color")
    private String primaryColor;

    @Pattern(regexp = "^#([A-Fa-f0-9]{6})$", message = "secondaryColor must be a valid hex color")
    private String secondaryColor;

    @Pattern(regexp = "^#([A-Fa-f0-9]{6})$", message = "backgroundColor must be a valid hex color")
    private String backgroundColor;

    @Pattern(regexp = "^#([A-Fa-f0-9]{6})$", message = "textColor must be a valid hex color")
    private String textColor;

    @Size(max = 500)
    private String previewImageUrl;

    private Boolean isActive  = true;
    private Boolean isPremium = false;
}
