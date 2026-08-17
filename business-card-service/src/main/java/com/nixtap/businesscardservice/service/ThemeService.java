package com.nixtap.businesscardservice.service;

import com.nixtap.businesscardservice.dto.request.ApplyThemeRequest;
import com.nixtap.businesscardservice.dto.request.ThemeRequest;
import com.nixtap.businesscardservice.dto.response.ThemeResponse;
import com.nixtap.businesscardservice.dto.response.UserThemeSelectionResponse;

import java.util.List;

public interface ThemeService {
    List<ThemeResponse>            getAllActiveThemes();
    ThemeResponse                  getThemeById(Long id);
    ThemeResponse                  getThemeBySlug(String slug);
    ThemeResponse                  createTheme(ThemeRequest request);
    ThemeResponse                  updateTheme(Long id, ThemeRequest request);
    void                           deactivateTheme(Long id);
    UserThemeSelectionResponse     applyThemeToCard(ApplyThemeRequest request);
    UserThemeSelectionResponse     getActiveThemeForCard(Long cardId);
    List<UserThemeSelectionResponse> getThemeSelectionsByUser(Long userId);
}
