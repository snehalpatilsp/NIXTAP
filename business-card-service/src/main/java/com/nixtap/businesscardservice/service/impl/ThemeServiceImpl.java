package com.nixtap.businesscardservice.service.impl;

import com.nixtap.businesscardservice.dto.request.ApplyThemeRequest;
import com.nixtap.businesscardservice.dto.request.ThemeRequest;
import com.nixtap.businesscardservice.dto.response.ThemeResponse;
import com.nixtap.businesscardservice.dto.response.UserThemeSelectionResponse;
import com.nixtap.businesscardservice.entity.Theme;
import com.nixtap.businesscardservice.entity.UserThemeSelection;
import com.nixtap.businesscardservice.exception.DuplicateThemeException;
import com.nixtap.businesscardservice.exception.ResourceNotFoundException;
import com.nixtap.businesscardservice.exception.ThemeAccessDeniedException;
import com.nixtap.businesscardservice.repository.ThemeRepository;
import com.nixtap.businesscardservice.repository.UserThemeSelectionRepository;
import com.nixtap.businesscardservice.security.AuthenticatedUser;
import com.nixtap.businesscardservice.service.ThemeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class ThemeServiceImpl implements ThemeService {

    private final ThemeRepository              themeRepository;
    private final UserThemeSelectionRepository selectionRepository;

    private Long getAuthenticatedUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof AuthenticatedUser principal)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required.");
        }
        return principal.getUserId();
    }

    // -----------------------------------------------------------------------
    // Helpers: entity → response
    // -----------------------------------------------------------------------

    private ThemeResponse toThemeResponse(Theme t) {
        return ThemeResponse.builder()
                .id(t.getId()).name(t.getName()).slug(t.getSlug())
                .description(t.getDescription()).primaryColor(t.getPrimaryColor())
                .secondaryColor(t.getSecondaryColor()).backgroundColor(t.getBackgroundColor())
                .textColor(t.getTextColor()).previewImageUrl(t.getPreviewImageUrl())
                .isActive(t.isActive()).isPremium(t.isPremium())
                .createdAt(t.getCreatedAt()).updatedAt(t.getUpdatedAt())
                .build();
    }

    private UserThemeSelectionResponse toSelectionResponse(UserThemeSelection sel, Theme theme) {
        return UserThemeSelectionResponse.builder()
                .id(sel.getId()).userId(sel.getUserId()).cardId(sel.getCardId())
                .themeId(sel.getThemeId())
                .theme(theme != null ? toThemeResponse(theme) : null)
                .appliedAt(sel.getAppliedAt())
                .build();
    }

    // -----------------------------------------------------------------------
    // Theme catalogue
    // -----------------------------------------------------------------------

    @Override @Transactional(readOnly = true)
    public List<ThemeResponse> getAllActiveThemes() {
        return themeRepository.findByIsActiveTrueOrderByNameAsc()
                .stream().map(this::toThemeResponse).toList();
    }

    @Override @Transactional(readOnly = true)
    public ThemeResponse getThemeById(Long id) {
        return toThemeResponse(themeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Theme not found: " + id)));
    }

    @Override @Transactional(readOnly = true)
    public ThemeResponse getThemeBySlug(String slug) {
        return toThemeResponse(themeRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Theme not found: " + slug)));
    }

    @Override @Transactional
    public ThemeResponse createTheme(ThemeRequest request) {
        if (themeRepository.existsBySlug(request.getSlug()))
            throw new DuplicateThemeException("Theme slug already exists: " + request.getSlug());
        if (themeRepository.existsByName(request.getName()))
            throw new DuplicateThemeException("Theme name already exists: " + request.getName());
        Theme theme = Theme.builder()
                .name(request.getName()).slug(request.getSlug())
                .description(request.getDescription()).primaryColor(request.getPrimaryColor())
                .secondaryColor(request.getSecondaryColor()).backgroundColor(request.getBackgroundColor())
                .textColor(request.getTextColor()).previewImageUrl(request.getPreviewImageUrl())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .isPremium(request.getIsPremium() != null ? request.getIsPremium() : false)
                .build();
        return toThemeResponse(themeRepository.save(theme));
    }

    @Override @Transactional
    public ThemeResponse updateTheme(Long id, ThemeRequest request) {
        Theme theme = themeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Theme not found: " + id));
        theme.setName(request.getName()); theme.setSlug(request.getSlug());
        theme.setDescription(request.getDescription()); theme.setPrimaryColor(request.getPrimaryColor());
        theme.setSecondaryColor(request.getSecondaryColor()); theme.setBackgroundColor(request.getBackgroundColor());
        theme.setTextColor(request.getTextColor()); theme.setPreviewImageUrl(request.getPreviewImageUrl());
        if (request.getIsActive()  != null) theme.setActive(request.getIsActive());
        if (request.getIsPremium() != null) theme.setPremium(request.getIsPremium());
        return toThemeResponse(themeRepository.save(theme));
    }

    @Override @Transactional
    public void deactivateTheme(Long id) {
        Theme theme = themeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Theme not found: " + id));
        theme.setActive(false);
        themeRepository.save(theme);
    }

    // -----------------------------------------------------------------------
    // User theme selection
    // -----------------------------------------------------------------------

    @Override @Transactional
    public UserThemeSelectionResponse applyThemeToCard(ApplyThemeRequest request) {
        Long callerId = getAuthenticatedUserId();
        if (!request.getUserId().equals(callerId))
            throw new ThemeAccessDeniedException("You can only apply themes to your own cards.");
        Theme theme = themeRepository.findById(request.getThemeId())
                .orElseThrow(() -> new ResourceNotFoundException("Theme not found: " + request.getThemeId()));
        if (!theme.isActive())
            throw new ThemeAccessDeniedException("Selected theme is not currently available.");
        UserThemeSelection sel = selectionRepository.findByCardId(request.getCardId())
                .orElseGet(() -> UserThemeSelection.builder()
                        .userId(request.getUserId()).cardId(request.getCardId()).build());
        sel.setThemeId(request.getThemeId());
        return toSelectionResponse(selectionRepository.save(sel), theme);
    }

    @Override @Transactional(readOnly = true)
    public UserThemeSelectionResponse getActiveThemeForCard(Long cardId) {
        UserThemeSelection sel = selectionRepository.findByCardId(cardId)
                .orElseThrow(() -> new ResourceNotFoundException("No theme selected for card: " + cardId));
        Theme theme = themeRepository.findById(sel.getThemeId())
                .orElseThrow(() -> new ResourceNotFoundException("Theme not found: " + sel.getThemeId()));
        return toSelectionResponse(sel, theme);
    }

    @Override @Transactional(readOnly = true)
    public List<UserThemeSelectionResponse> getThemeSelectionsByUser(Long userId) {
        Long callerId = getAuthenticatedUserId();
        if (!userId.equals(callerId))
            throw new ThemeAccessDeniedException("You can only view your own theme selections.");
        return selectionRepository.findByUserId(userId).stream().map(sel -> {
            Theme t = themeRepository.findById(sel.getThemeId()).orElse(null);
            return toSelectionResponse(sel, t);
        }).toList();
    }
}
