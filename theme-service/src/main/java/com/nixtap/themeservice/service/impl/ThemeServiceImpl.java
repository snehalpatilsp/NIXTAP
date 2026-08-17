package com.nixtap.themeservice.service.impl;

import com.nixtap.themeservice.dto.request.ApplyThemeRequest;
import com.nixtap.themeservice.dto.request.ThemeRequest;
import com.nixtap.themeservice.dto.response.ThemeResponse;
import com.nixtap.themeservice.dto.response.UserThemeSelectionResponse;
import com.nixtap.themeservice.entity.Theme;
import com.nixtap.themeservice.entity.UserThemeSelection;
import com.nixtap.themeservice.exception.DuplicateThemeException;
import com.nixtap.themeservice.exception.ResourceNotFoundException;
import com.nixtap.themeservice.exception.ThemeAccessDeniedException;
import com.nixtap.themeservice.mapper.ThemeMapper;
import com.nixtap.themeservice.repository.ThemeRepository;
import com.nixtap.themeservice.repository.UserThemeSelectionRepository;
import com.nixtap.themeservice.security.AuthenticatedUser;
import com.nixtap.themeservice.service.ThemeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service @RequiredArgsConstructor @SuppressWarnings("null")
public class ThemeServiceImpl implements ThemeService {

    private final ThemeRepository              themeRepository;
    private final UserThemeSelectionRepository selectionRepository;
    private final ThemeMapper                  themeMapper;

    private Long getAuthenticatedUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof AuthenticatedUser principal)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required.");
        }
        return principal.getUserId();
    }

    @Override @Transactional(readOnly = true)
    public List<ThemeResponse> getAllActiveThemes() {
        return themeRepository.findByIsActiveTrueOrderByNameAsc().stream()
                .map(themeMapper::toResponse).toList();
    }

    @Override @Transactional(readOnly = true)
    public ThemeResponse getThemeById(Long id) {
        return themeMapper.toResponse(themeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Theme not found: " + id)));
    }

    @Override @Transactional(readOnly = true)
    public ThemeResponse getThemeBySlug(String slug) {
        return themeMapper.toResponse(themeRepository.findBySlug(slug)
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
        return themeMapper.toResponse(themeRepository.save(theme));
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
        return themeMapper.toResponse(themeRepository.save(theme));
    }

    @Override @Transactional
    public void deactivateTheme(Long id) {
        Theme theme = themeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Theme not found: " + id));
        theme.setActive(false);
        themeRepository.save(theme);
    }

    @Override @Transactional
    public UserThemeSelectionResponse applyThemeToCard(ApplyThemeRequest request) {
        Long callerId = getAuthenticatedUserId();
        if (!request.getUserId().equals(callerId))
            throw new ThemeAccessDeniedException("You can only apply themes to your own cards.");
        Theme theme = themeRepository.findById(request.getThemeId())
                .orElseThrow(() -> new ResourceNotFoundException("Theme not found: " + request.getThemeId()));
        if (!theme.isActive())
            throw new ThemeAccessDeniedException("Selected theme is not available.");
        UserThemeSelection selection = selectionRepository.findByCardId(request.getCardId())
                .orElseGet(() -> UserThemeSelection.builder()
                        .userId(request.getUserId()).cardId(request.getCardId()).build());
        selection.setThemeId(request.getThemeId());
        UserThemeSelection saved = selectionRepository.save(selection);
        return buildSelectionResponse(saved, theme);
    }

    @Override @Transactional(readOnly = true)
    public UserThemeSelectionResponse getActiveThemeForCard(Long cardId) {
        UserThemeSelection sel = selectionRepository.findByCardId(cardId)
                .orElseThrow(() -> new ResourceNotFoundException("No theme selected for card: " + cardId));
        Theme theme = themeRepository.findById(sel.getThemeId())
                .orElseThrow(() -> new ResourceNotFoundException("Theme not found: " + sel.getThemeId()));
        return buildSelectionResponse(sel, theme);
    }

    @Override @Transactional(readOnly = true)
    public List<UserThemeSelectionResponse> getThemeSelectionsByUser(Long userId) {
        Long callerId = getAuthenticatedUserId();
        if (!userId.equals(callerId))
            throw new ThemeAccessDeniedException("You can only view your own theme selections.");
        return selectionRepository.findByUserId(userId).stream()
                .map(sel -> {
                    Theme t = themeRepository.findById(sel.getThemeId()).orElse(null);
                    return buildSelectionResponse(sel, t);
                }).toList();
    }

    private UserThemeSelectionResponse buildSelectionResponse(UserThemeSelection sel, Theme theme) {
        return UserThemeSelectionResponse.builder()
                .id(sel.getId()).userId(sel.getUserId()).cardId(sel.getCardId())
                .themeId(sel.getThemeId())
                .theme(theme != null ? themeMapper.toResponse(theme) : null)
                .appliedAt(sel.getAppliedAt()).build();
    }
}
