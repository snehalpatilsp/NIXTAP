package com.nixtap.portfolioservice.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SkillRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "Skill name is required")
    private String name;

    private String proficiency;

    @Min(0) @Max(100)
    private Integer percentage;
}