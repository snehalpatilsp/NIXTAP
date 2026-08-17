package com.nixtap.portfolioservice.controller;

import com.nixtap.portfolioservice.dto.request.*;
import com.nixtap.portfolioservice.dto.response.*;
import com.nixtap.portfolioservice.security.AuthenticatedUser;
import com.nixtap.portfolioservice.service.PortfolioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/portfolio")
@RequiredArgsConstructor
@Tag(name = "Portfolio Management", description = "CRUD APIs for Projects, Experience, Education, Skills, Certificates, Resume, Awards, and Languages")
public class PortfolioController {

    private final PortfolioService portfolioService;

    // -----------------------------------------------------------------------
    // Fix 5: Aggregated endpoint — all sections in one call for authenticated user
    // Frontend portfolioService.js: GET /api/v1/portfolio/all/user/me
    // -----------------------------------------------------------------------

    @GetMapping("/all/user/me")
    @Operation(summary = "Get authenticated user's full portfolio (all sections)")
    public ResponseEntity<ApiResponse<FullPortfolioResponse>> getMyFullPortfolio(
            @AuthenticationPrincipal AuthenticatedUser principal) {
        FullPortfolioResponse response = portfolioService.getFullPortfolioByUserId(principal.getUserId());
        return ResponseEntity.ok(ApiResponse.success("Full portfolio retrieved successfully", response));
    }

    // Public full portfolio read (no auth required)
    @GetMapping("/public/user/{userId}")
    @Operation(summary = "Get full portfolio by user ID — public read")
    public ResponseEntity<ApiResponse<FullPortfolioResponse>> getFullPortfolio(@PathVariable Long userId) {
        FullPortfolioResponse response = portfolioService.getFullPortfolioByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success("Portfolio retrieved successfully", response));
    }

    // -----------------------------------------------------------------------
    // PROJECTS
    // -----------------------------------------------------------------------

    @PostMapping("/projects")
    public ResponseEntity<ApiResponse<ProjectResponse>> createProject(@Valid @RequestBody ProjectRequest request) {
        return new ResponseEntity<>(ApiResponse.success("Project added", portfolioService.createProject(request)), HttpStatus.CREATED);
    }

    // /projects/user/me — convenience endpoint for authenticated user
    @GetMapping("/projects/user/me")
    @Operation(summary = "Get projects for the currently authenticated user")
    public ResponseEntity<ApiResponse<List<ProjectResponse>>> getMyProjects(
            @AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseEntity.ok(ApiResponse.success("Projects retrieved", portfolioService.getProjectsByUserId(principal.getUserId())));
    }

    @GetMapping("/projects/user/{userId}")
    public ResponseEntity<ApiResponse<List<ProjectResponse>>> getProjects(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success("Projects retrieved", portfolioService.getProjectsByUserId(userId)));
    }

    @PutMapping("/projects/{id}")
    public ResponseEntity<ApiResponse<ProjectResponse>> updateProject(@PathVariable Long id, @Valid @RequestBody ProjectRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Project updated", portfolioService.updateProject(id, request)));
    }

    @DeleteMapping("/projects/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProject(@PathVariable Long id) {
        portfolioService.deleteProject(id);
        return ResponseEntity.ok(ApiResponse.success("Project deleted", null));
    }

    // -----------------------------------------------------------------------
    // EXPERIENCE
    // -----------------------------------------------------------------------

    @PostMapping("/experience")
    public ResponseEntity<ApiResponse<ExperienceResponse>> createExperience(@Valid @RequestBody ExperienceRequest request) {
        return new ResponseEntity<>(ApiResponse.success("Experience added", portfolioService.createExperience(request)), HttpStatus.CREATED);
    }

    @GetMapping("/experience/user/{userId}")
    public ResponseEntity<ApiResponse<List<ExperienceResponse>>> getExperience(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success("Experiences retrieved", portfolioService.getExperienceByUserId(userId)));
    }

    @PutMapping("/experience/{id}")
    public ResponseEntity<ApiResponse<ExperienceResponse>> updateExperience(@PathVariable Long id, @Valid @RequestBody ExperienceRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Experience updated", portfolioService.updateExperience(id, request)));
    }

    @DeleteMapping("/experience/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteExperience(@PathVariable Long id) {
        portfolioService.deleteExperience(id);
        return ResponseEntity.ok(ApiResponse.success("Experience deleted", null));
    }

    // -----------------------------------------------------------------------
    // EDUCATION
    // -----------------------------------------------------------------------

    @PostMapping("/education")
    public ResponseEntity<ApiResponse<EducationResponse>> createEducation(@Valid @RequestBody EducationRequest request) {
        return new ResponseEntity<>(ApiResponse.success("Education added", portfolioService.createEducation(request)), HttpStatus.CREATED);
    }

    @GetMapping("/education/user/{userId}")
    public ResponseEntity<ApiResponse<List<EducationResponse>>> getEducation(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success("Education list retrieved", portfolioService.getEducationByUserId(userId)));
    }

    @PutMapping("/education/{id}")
    public ResponseEntity<ApiResponse<EducationResponse>> updateEducation(@PathVariable Long id, @Valid @RequestBody EducationRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Education updated", portfolioService.updateEducation(id, request)));
    }

    @DeleteMapping("/education/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEducation(@PathVariable Long id) {
        portfolioService.deleteEducation(id);
        return ResponseEntity.ok(ApiResponse.success("Education deleted", null));
    }

    // -----------------------------------------------------------------------
    // SKILLS
    // -----------------------------------------------------------------------

    @PostMapping("/skills")
    public ResponseEntity<ApiResponse<SkillResponse>> createSkill(@Valid @RequestBody SkillRequest request) {
        return new ResponseEntity<>(ApiResponse.success("Skill added", portfolioService.createSkill(request)), HttpStatus.CREATED);
    }

    @GetMapping("/skills/user/{userId}")
    public ResponseEntity<ApiResponse<List<SkillResponse>>> getSkills(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success("Skills retrieved", portfolioService.getSkillsByUserId(userId)));
    }

    @PutMapping("/skills/{id}")
    public ResponseEntity<ApiResponse<SkillResponse>> updateSkill(@PathVariable Long id, @Valid @RequestBody SkillRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Skill updated", portfolioService.updateSkill(id, request)));
    }

    @DeleteMapping("/skills/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSkill(@PathVariable Long id) {
        portfolioService.deleteSkill(id);
        return ResponseEntity.ok(ApiResponse.success("Skill deleted", null));
    }

    // -----------------------------------------------------------------------
    // CERTIFICATES
    // -----------------------------------------------------------------------

    @PostMapping("/certificates")
    public ResponseEntity<ApiResponse<CertificateResponse>> createCertificate(@Valid @RequestBody CertificateRequest request) {
        return new ResponseEntity<>(ApiResponse.success("Certificate added", portfolioService.createCertificate(request)), HttpStatus.CREATED);
    }

    @GetMapping("/certificates/user/{userId}")
    public ResponseEntity<ApiResponse<List<CertificateResponse>>> getCertificates(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success("Certificates retrieved", portfolioService.getCertificatesByUserId(userId)));
    }

    @PutMapping("/certificates/{id}")
    public ResponseEntity<ApiResponse<CertificateResponse>> updateCertificate(@PathVariable Long id, @Valid @RequestBody CertificateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Certificate updated", portfolioService.updateCertificate(id, request)));
    }

    @DeleteMapping("/certificates/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCertificate(@PathVariable Long id) {
        portfolioService.deleteCertificate(id);
        return ResponseEntity.ok(ApiResponse.success("Certificate deleted", null));
    }

    // -----------------------------------------------------------------------
    // RESUME
    // -----------------------------------------------------------------------

    @PostMapping("/resume")
    public ResponseEntity<ApiResponse<ResumeResponse>> saveResume(@Valid @RequestBody ResumeRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Resume saved", portfolioService.uploadOrUpdateResume(request)));
    }

    @GetMapping("/resume/user/{userId}")
    public ResponseEntity<ApiResponse<ResumeResponse>> getResume(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success("Resume retrieved", portfolioService.getResumeByUserId(userId)));
    }

    @DeleteMapping("/resume/user/{userId}")
    public ResponseEntity<ApiResponse<Void>> deleteResume(@PathVariable Long userId) {
        portfolioService.deleteResume(userId);
        return ResponseEntity.ok(ApiResponse.success("Resume deleted", null));
    }

    // -----------------------------------------------------------------------
    // AWARDS
    // -----------------------------------------------------------------------

    @PostMapping("/awards")
    public ResponseEntity<ApiResponse<AwardResponse>> createAward(@Valid @RequestBody AwardRequest request) {
        return new ResponseEntity<>(ApiResponse.success("Award added", portfolioService.createAward(request)), HttpStatus.CREATED);
    }

    @GetMapping("/awards/user/{userId}")
    public ResponseEntity<ApiResponse<List<AwardResponse>>> getAwards(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success("Awards retrieved", portfolioService.getAwardsByUserId(userId)));
    }

    @PutMapping("/awards/{id}")
    public ResponseEntity<ApiResponse<AwardResponse>> updateAward(@PathVariable Long id, @Valid @RequestBody AwardRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Award updated", portfolioService.updateAward(id, request)));
    }

    @DeleteMapping("/awards/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAward(@PathVariable Long id) {
        portfolioService.deleteAward(id);
        return ResponseEntity.ok(ApiResponse.success("Award deleted", null));
    }

    // -----------------------------------------------------------------------
    // LANGUAGES
    // -----------------------------------------------------------------------

    @PostMapping("/languages")
    public ResponseEntity<ApiResponse<LanguageResponse>> createLanguage(@Valid @RequestBody LanguageRequest request) {
        return new ResponseEntity<>(ApiResponse.success("Language added", portfolioService.createLanguage(request)), HttpStatus.CREATED);
    }

    @GetMapping("/languages/user/{userId}")
    public ResponseEntity<ApiResponse<List<LanguageResponse>>> getLanguages(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success("Languages retrieved", portfolioService.getLanguagesByUserId(userId)));
    }

    @PutMapping("/languages/{id}")
    public ResponseEntity<ApiResponse<LanguageResponse>> updateLanguage(@PathVariable Long id, @Valid @RequestBody LanguageRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Language updated", portfolioService.updateLanguage(id, request)));
    }

    @DeleteMapping("/languages/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteLanguage(@PathVariable Long id) {
        portfolioService.deleteLanguage(id);
        return ResponseEntity.ok(ApiResponse.success("Language deleted", null));
    }
}
