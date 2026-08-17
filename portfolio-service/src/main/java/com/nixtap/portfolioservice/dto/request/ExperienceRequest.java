package com.nixtap.portfolioservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ExperienceRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "Company is required")
    private String company;

    @NotBlank(message = "Designation is required")
    private String designation;

    private String location;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    private LocalDate endDate;
    private boolean isCurrent;
    private String description;
}