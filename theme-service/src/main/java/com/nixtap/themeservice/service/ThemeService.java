package com.nixtap.themeservice.service;

import com.nixtap.themeservice.dto.request.ApplyThemeRequest;
import com.nixtap.themeservice.dto.request.ThemeRequest;
import com.nixtap.themeservice.dto.response.ThemeResponse;
import com.nixtap.themeservice.dto.response.UserThemeSelectionResponse;

import java.util.List;

public interface ThemeService {
    // Theme catalogue (admin-managed)
    List<ThemeResponse> getAllActiveThemes();
    ThemeResponse getThemeById(Long id);
    ThemeResponse getThemeBySlug(String slug);
    ThemeResponse createTheme(ThemeRequest request);
    ThemeResponse updateTheme(Long id, ThemeRequest request);
    void deactivateTheme(Long id);

    // User theme selection
    UserThemeSelectionResponse applyThemeToCard(ApplyThemeRequest request);
    UserThemeSelectionResponse getActiveThemeForCard(Long cardId);
    List<UserThemeSelectionResponse> getThemeSelectionsByUser(Long userId);
}
