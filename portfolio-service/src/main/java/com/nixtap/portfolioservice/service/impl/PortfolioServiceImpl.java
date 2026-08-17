package com.nixtap.portfolioservice.service.impl;

import com.nixtap.portfolioservice.dto.request.*;
import com.nixtap.portfolioservice.dto.response.*;
import com.nixtap.portfolioservice.entity.*;
import com.nixtap.portfolioservice.exception.PortfolioAccessDeniedException;
import com.nixtap.portfolioservice.exception.ResourceNotFoundException;
import com.nixtap.portfolioservice.mapper.PortfolioMapper;
import com.nixtap.portfolioservice.repository.*;
import com.nixtap.portfolioservice.security.AuthenticatedUser;
import com.nixtap.portfolioservice.service.PortfolioService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class PortfolioServiceImpl implements PortfolioService {

    private final ProjectRepository projectRepository;
    private final ExperienceRepository experienceRepository;
    private final EducationRepository educationRepository;
    private final SkillRepository skillRepository;
    private final CertificateRepository certificateRepository;
    private final ResumeRepository resumeRepository;
    private final AwardRepository awardRepository;
    private final LanguageRepository languageRepository;
    private final PortfolioMapper portfolioMapper;

    // -----------------------------------------------------------------------
    // Security helpers
    // -----------------------------------------------------------------------

    private Long getAuthenticatedUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof AuthenticatedUser principal)) {
            throw new PortfolioAccessDeniedException("Authentication required.");
        }
        return principal.getUserId();
    }

    private void assertOwner(Long resourceUserId) {
        Long callerId = getAuthenticatedUserId();
        if (!resourceUserId.equals(callerId)) {
            throw new PortfolioAccessDeniedException("You do not have permission to modify this resource.");
        }
    }

    // -----------------------------------------------------------------------
    // Full portfolio (public read — no ownership check)
    // -----------------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public FullPortfolioResponse getFullPortfolioByUserId(Long userId) {
        return FullPortfolioResponse.builder()
                .userId(userId)
                .projects(getProjectsByUserId(userId))
                .experiences(getExperienceByUserId(userId))
                .education(getEducationByUserId(userId))
                .skills(getSkillsByUserId(userId))
                .certificates(getCertificatesByUserId(userId))
                .resume(resumeRepository.findByUserId(userId).map(portfolioMapper::toResponse).orElse(null))
                .awards(getAwardsByUserId(userId))
                .languages(getLanguagesByUserId(userId))
                .build();
    }

    // -----------------------------------------------------------------------
    // PROJECTS
    // -----------------------------------------------------------------------

    @Override @Transactional
    public ProjectResponse createProject(ProjectRequest request) {
        assertOwner(request.getUserId());
        Project entity = portfolioMapper.toEntity(request);
        return portfolioMapper.toResponse(projectRepository.save(entity));
    }

    @Override @Transactional(readOnly = true)
    public List<ProjectResponse> getProjectsByUserId(Long userId) {
        return projectRepository.findByUserId(userId).stream().map(portfolioMapper::toResponse).toList();
    }

    @Override @Transactional
    public ProjectResponse updateProject(Long id, ProjectRequest request) {
        Project p = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found: " + id));
        assertOwner(p.getUserId());
        p.setTitle(request.getTitle());
        p.setDescription(request.getDescription());
        p.setProjectUrl(request.getProjectUrl());
        p.setGithubUrl(request.getGithubUrl());
        p.setImageUrl(request.getImageUrl());
        p.setTechnologies(request.getTechnologies());
        return portfolioMapper.toResponse(projectRepository.save(p));
    }

    @Override @Transactional
    public void deleteProject(Long id) {
        Project p = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found: " + id));
        assertOwner(p.getUserId());
        projectRepository.delete(p);
    }

    // -----------------------------------------------------------------------
    // EXPERIENCE
    // -----------------------------------------------------------------------

    @Override @Transactional
    public ExperienceResponse createExperience(ExperienceRequest request) {
        assertOwner(request.getUserId());
        Experience entity = portfolioMapper.toEntity(request);
        return portfolioMapper.toResponse(experienceRepository.save(entity));
    }

    @Override @Transactional(readOnly = true)
    public List<ExperienceResponse> getExperienceByUserId(Long userId) {
        return experienceRepository.findByUserIdOrderByStartDateDesc(userId).stream().map(portfolioMapper::toResponse).toList();
    }

    @Override @Transactional
    public ExperienceResponse updateExperience(Long id, ExperienceRequest request) {
        Experience e = experienceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Experience not found: " + id));
        assertOwner(e.getUserId());
        e.setCompany(request.getCompany());
        e.setDesignation(request.getDesignation());
        e.setLocation(request.getLocation());
        e.setStartDate(request.getStartDate());
        e.setEndDate(request.getEndDate());
        e.setCurrent(request.isCurrent());
        e.setDescription(request.getDescription());
        return portfolioMapper.toResponse(experienceRepository.save(e));
    }

    @Override @Transactional
    public void deleteExperience(Long id) {
        Experience e = experienceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Experience not found: " + id));
        assertOwner(e.getUserId());
        experienceRepository.delete(e);
    }

    // -----------------------------------------------------------------------
    // EDUCATION
    // -----------------------------------------------------------------------

    @Override @Transactional
    public EducationResponse createEducation(EducationRequest request) {
        assertOwner(request.getUserId());
        Education entity = portfolioMapper.toEntity(request);
        return portfolioMapper.toResponse(educationRepository.save(entity));
    }

    @Override @Transactional(readOnly = true)
    public List<EducationResponse> getEducationByUserId(Long userId) {
        return educationRepository.findByUserIdOrderByStartDateDesc(userId).stream().map(portfolioMapper::toResponse).toList();
    }

    @Override @Transactional
    public EducationResponse updateEducation(Long id, EducationRequest request) {
        Education ed = educationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Education not found: " + id));
        assertOwner(ed.getUserId());
        ed.setInstitution(request.getInstitution());
        ed.setDegree(request.getDegree());
        ed.setFieldOfStudy(request.getFieldOfStudy());
        ed.setStartDate(request.getStartDate());
        ed.setEndDate(request.getEndDate());
        ed.setGrade(request.getGrade());
        ed.setDescription(request.getDescription());
        return portfolioMapper.toResponse(educationRepository.save(ed));
    }

    @Override @Transactional
    public void deleteEducation(Long id) {
        Education ed = educationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Education not found: " + id));
        assertOwner(ed.getUserId());
        educationRepository.delete(ed);
    }

    // -----------------------------------------------------------------------
    // SKILLS
    // -----------------------------------------------------------------------

    @Override @Transactional
    public SkillResponse createSkill(SkillRequest request) {
        assertOwner(request.getUserId());
        Skill entity = portfolioMapper.toEntity(request);
        return portfolioMapper.toResponse(skillRepository.save(entity));
    }

    @Override @Transactional(readOnly = true)
    public List<SkillResponse> getSkillsByUserId(Long userId) {
        return skillRepository.findByUserId(userId).stream().map(portfolioMapper::toResponse).toList();
    }

    @Override @Transactional
    public SkillResponse updateSkill(Long id, SkillRequest request) {
        Skill s = skillRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found: " + id));
        assertOwner(s.getUserId());
        s.setName(request.getName());
        s.setProficiency(request.getProficiency());
        s.setPercentage(request.getPercentage());
        return portfolioMapper.toResponse(skillRepository.save(s));
    }

    @Override @Transactional
    public void deleteSkill(Long id) {
        Skill s = skillRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found: " + id));
        assertOwner(s.getUserId());
        skillRepository.delete(s);
    }

    // -----------------------------------------------------------------------
    // CERTIFICATES
    // -----------------------------------------------------------------------

    @Override @Transactional
    public CertificateResponse createCertificate(CertificateRequest request) {
        assertOwner(request.getUserId());
        Certificate entity = portfolioMapper.toEntity(request);
        return portfolioMapper.toResponse(certificateRepository.save(entity));
    }

    @Override @Transactional(readOnly = true)
    public List<CertificateResponse> getCertificatesByUserId(Long userId) {
        return certificateRepository.findByUserIdOrderByIssueDateDesc(userId).stream().map(portfolioMapper::toResponse).toList();
    }

    @Override @Transactional
    public CertificateResponse updateCertificate(Long id, CertificateRequest request) {
        Certificate c = certificateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Certificate not found: " + id));
        assertOwner(c.getUserId());
        c.setTitle(request.getTitle());
        c.setIssuingOrganization(request.getIssuingOrganization());
        c.setIssueDate(request.getIssueDate());
        c.setExpirationDate(request.getExpirationDate());
        c.setCredentialUrl(request.getCredentialUrl());
        c.setCredentialId(request.getCredentialId());
        return portfolioMapper.toResponse(certificateRepository.save(c));
    }

    @Override @Transactional
    public void deleteCertificate(Long id) {
        Certificate c = certificateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Certificate not found: " + id));
        assertOwner(c.getUserId());
        certificateRepository.delete(c);
    }

    // -----------------------------------------------------------------------
    // RESUME
    // -----------------------------------------------------------------------

    @Override @Transactional
    public ResumeResponse uploadOrUpdateResume(ResumeRequest request) {
        assertOwner(request.getUserId());
        Resume resume = resumeRepository.findByUserId(request.getUserId())
                .orElseGet(() -> portfolioMapper.toEntity(request));
        resume.setTitle(request.getTitle());
        resume.setFileUrl(request.getFileUrl());
        return portfolioMapper.toResponse(resumeRepository.save(resume));
    }

    @Override @Transactional(readOnly = true)
    public ResumeResponse getResumeByUserId(Long userId) {
        Resume resume = resumeRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found for User ID: " + userId));
        return portfolioMapper.toResponse(resume);
    }

    @Override @Transactional
    public void deleteResume(Long userId) {
        assertOwner(userId);
        Resume resume = resumeRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found for User ID: " + userId));
        resumeRepository.delete(resume);
    }

    // -----------------------------------------------------------------------
    // AWARDS
    // -----------------------------------------------------------------------

    @Override @Transactional
    public AwardResponse createAward(AwardRequest request) {
        assertOwner(request.getUserId());
        Award entity = portfolioMapper.toEntity(request);
        return portfolioMapper.toResponse(awardRepository.save(entity));
    }

    @Override @Transactional(readOnly = true)
    public List<AwardResponse> getAwardsByUserId(Long userId) {
        return awardRepository.findByUserIdOrderByIssueDateDesc(userId).stream().map(portfolioMapper::toResponse).toList();
    }

    @Override @Transactional
    public AwardResponse updateAward(Long id, AwardRequest request) {
        Award a = awardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Award not found: " + id));
        assertOwner(a.getUserId());
        a.setTitle(request.getTitle());
        a.setIssuer(request.getIssuer());
        a.setIssueDate(request.getIssueDate());
        a.setDescription(request.getDescription());
        return portfolioMapper.toResponse(awardRepository.save(a));
    }

    @Override @Transactional
    public void deleteAward(Long id) {
        Award a = awardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Award not found: " + id));
        assertOwner(a.getUserId());
        awardRepository.delete(a);
    }

    // -----------------------------------------------------------------------
    // LANGUAGES
    // -----------------------------------------------------------------------

    @Override @Transactional
    public LanguageResponse createLanguage(LanguageRequest request) {
        assertOwner(request.getUserId());
        Language entity = portfolioMapper.toEntity(request);
        return portfolioMapper.toResponse(languageRepository.save(entity));
    }

    @Override @Transactional(readOnly = true)
    public List<LanguageResponse> getLanguagesByUserId(Long userId) {
        return languageRepository.findByUserId(userId).stream().map(portfolioMapper::toResponse).toList();
    }

    @Override @Transactional
    public LanguageResponse updateLanguage(Long id, LanguageRequest request) {
        Language l = languageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Language not found: " + id));
        assertOwner(l.getUserId());
        l.setName(request.getName());
        l.setProficiency(request.getProficiency());
        return portfolioMapper.toResponse(languageRepository.save(l));
    }

    @Override @Transactional
    public void deleteLanguage(Long id) {
        Language l = languageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Language not found: " + id));
        assertOwner(l.getUserId());
        languageRepository.delete(l);
    }
}
