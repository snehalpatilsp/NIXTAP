package com.nixtap.portfolioservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LanguageResponse {

    private Long id;
    private Long userId;
    private String name;
    private String proficiency;
}