package com.nixtap.portfolioservice.service;

import com.nixtap.portfolioservice.dto.request.*;
import com.nixtap.portfolioservice.dto.response.*;

import java.util.List;

public interface PortfolioService {

    FullPortfolioResponse getFullPortfolioByUserId(Long userId);

    // Projects
    ProjectResponse createProject(ProjectRequest request);
    List<ProjectResponse> getProjectsByUserId(Long userId);
    ProjectResponse updateProject(Long id, ProjectRequest request);
    void deleteProject(Long id);

    // Experience
    ExperienceResponse createExperience(ExperienceRequest request);
    List<ExperienceResponse> getExperienceByUserId(Long userId);
    ExperienceResponse updateExperience(Long id, ExperienceRequest request);
    void deleteExperience(Long id);

    // Education
    EducationResponse createEducation(EducationRequest request);
    List<EducationResponse> getEducationByUserId(Long userId);
    EducationResponse updateEducation(Long id, EducationRequest request);
    void deleteEducation(Long id);

    // Skills
    SkillResponse createSkill(SkillRequest request);
    List<SkillResponse> getSkillsByUserId(Long userId);
    SkillResponse updateSkill(Long id, SkillRequest request);
    void deleteSkill(Long id);

    // Certificates
    CertificateResponse createCertificate(CertificateRequest request);
    List<CertificateResponse> getCertificatesByUserId(Long userId);
    CertificateResponse updateCertificate(Long id, CertificateRequest request);
    void deleteCertificate(Long id);

    // Resume
    ResumeResponse uploadOrUpdateResume(ResumeRequest request);
    ResumeResponse getResumeByUserId(Long userId);
    void deleteResume(Long userId);

    // Awards
    AwardResponse createAward(AwardRequest request);
    List<AwardResponse> getAwardsByUserId(Long userId);
    AwardResponse updateAward(Long id, AwardRequest request);
    void deleteAward(Long id);

    // Languages
    LanguageResponse createLanguage(LanguageRequest request);
    List<LanguageResponse> getLanguagesByUserId(Long userId);
    LanguageResponse updateLanguage(Long id, LanguageRequest request);
    void deleteLanguage(Long id);
}