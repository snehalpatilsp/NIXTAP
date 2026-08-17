package com.nixtap.portfolioservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SkillResponse {

    private Long id;
    private Long userId;
    private String name;
    private String proficiency;
    private Integer percentage;
}