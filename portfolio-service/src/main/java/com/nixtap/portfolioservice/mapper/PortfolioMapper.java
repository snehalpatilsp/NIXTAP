package com.nixtap.portfolioservice.mapper;

import com.nixtap.portfolioservice.dto.request.*;
import com.nixtap.portfolioservice.dto.response.*;
import com.nixtap.portfolioservice.entity.*;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PortfolioMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Project toEntity(ProjectRequest request);
    ProjectResponse toResponse(Project entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Experience toEntity(ExperienceRequest request);
    ExperienceResponse toResponse(Experience entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Education toEntity(EducationRequest request);
    EducationResponse toResponse(Education entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Skill toEntity(SkillRequest request);
    SkillResponse toResponse(Skill entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Certificate toEntity(CertificateRequest request);
    CertificateResponse toResponse(Certificate entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Resume toEntity(ResumeRequest request);
    ResumeResponse toResponse(Resume entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Award toEntity(AwardRequest request);
    AwardResponse toResponse(Award entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Language toEntity(LanguageRequest request);
    LanguageResponse toResponse(Language entity);
}