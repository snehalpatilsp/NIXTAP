package com.nixtap.themeservice.controller;

import com.nixtap.themeservice.dto.request.ApplyThemeRequest;
import com.nixtap.themeservice.dto.request.ThemeRequest;
import com.nixtap.themeservice.dto.response.ApiResponse;
import com.nixtap.themeservice.dto.response.ThemeResponse;
import com.nixtap.themeservice.dto.response.UserThemeSelectionResponse;
import com.nixtap.themeservice.service.ThemeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/themes")
@RequiredArgsConstructor
@Tag(name = "Theme Management", description = "Theme catalogue and card customization for NIXTAP")
public class ThemeController {

    private final ThemeService service;

    @GetMapping
    @Operation(summary = "List all active themes (public)")
    public ResponseEntity<ApiResponse<List<ThemeResponse>>> getAllActive() {
        return ResponseEntity.ok(ApiResponse.success("Themes retrieved", service.getAllActiveThemes()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get theme by ID (public)")
    public ResponseEntity<ApiResponse<ThemeResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Theme retrieved", service.getThemeById(id)));
    }

    @GetMapping("/slug/{slug}")
    @Operation(summary = "Get theme by slug (public)")
    public ResponseEntity<ApiResponse<ThemeResponse>> getBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.success("Theme retrieved", service.getThemeBySlug(slug)));
    }

    @PostMapping
    @Operation(summary = "Create a new theme (ADMIN only)")
    public ResponseEntity<ApiResponse<ThemeResponse>> create(@Valid @RequestBody ThemeRequest request) {
        return new ResponseEntity<>(ApiResponse.success("Theme created", service.createTheme(request)),
                HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a theme (ADMIN only)")
    public ResponseEntity<ApiResponse<ThemeResponse>> update(
            @PathVariable Long id, @Valid @RequestBody ThemeRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Theme updated", service.updateTheme(id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Deactivate a theme (ADMIN only)")
    public ResponseEntity<ApiResponse<Void>> deactivate(@PathVariable Long id) {
        service.deactivateTheme(id);
        return ResponseEntity.ok(ApiResponse.success("Theme deactivated", null));
    }

    @PostMapping("/user/apply")
    @Operation(summary = "Apply a theme to a business card (owner only)")
    public ResponseEntity<ApiResponse<UserThemeSelectionResponse>> apply(
            @Valid @RequestBody ApplyThemeRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Theme applied to card",
                service.applyThemeToCard(request)));
    }

    @GetMapping("/user/card/{cardId}")
    @Operation(summary = "Get active theme for a specific card (public)")
    public ResponseEntity<ApiResponse<UserThemeSelectionResponse>> getForCard(@PathVariable Long cardId) {
        return ResponseEntity.ok(ApiResponse.success("Active theme retrieved",
                service.getActiveThemeForCard(cardId)));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get all theme selections for a user (owner only)")
    public ResponseEntity<ApiResponse<List<UserThemeSelectionResponse>>> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success("User theme selections retrieved",
                service.getThemeSelectionsByUser(userId)));
    }
}
