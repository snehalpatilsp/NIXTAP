package com.nixtap.portfolioservice.dto.response;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FullPortfolioResponse {

    private Long userId;
    private List<ProjectResponse> projects;
    private List<ExperienceResponse> experiences;
    private List<EducationResponse> education;
    private List<SkillResponse> skills;
    private List<CertificateResponse> certificates;
    private ResumeResponse resume;
    private List<AwardResponse> awards;
    private List<LanguageResponse> languages;
}