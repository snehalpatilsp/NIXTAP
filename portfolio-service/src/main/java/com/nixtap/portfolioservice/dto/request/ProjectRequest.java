package com.nixtap.portfolioservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ProjectRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "Project title is required")
    @Size(max = 150)
    private String title;

    private String description;
    private String projectUrl;
    private String githubUrl;
    private String imageUrl;
    private String technologies;
}
