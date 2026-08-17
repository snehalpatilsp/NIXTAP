package com.nixtap.portfolioservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;


@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AwardResponse {

    private Long id;
    private Long userId;
    private String title;
    private String issuer;
    private LocalDate issueDate;
    private String description;
}