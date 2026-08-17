package com.nixtap.themeservice.service;

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
import com.nixtap.themeservice.service.impl.ThemeServiceImpl;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class) @SuppressWarnings("null")
class ThemeServiceTest {

    @Mock private ThemeRepository              themeRepository;
    @Mock private UserThemeSelectionRepository selectionRepository;
    @Mock private ThemeMapper                  themeMapper;
    @InjectMocks private ThemeServiceImpl service;

    private static final Long USER_ID  = 1L;
    private static final Long CARD_ID  = 10L;
    private static final Long THEME_ID = 100L;

    private Theme buildTheme() {
        return Theme.builder().id(THEME_ID).name("Professional Blue")
                .slug("professional-blue").isActive(true).isPremium(false).build();
    }

    private ThemeResponse buildResponse() {
        return ThemeResponse.builder().id(THEME_ID).name("Professional Blue")
                .slug("professional-blue").isActive(true).build();
    }

    private void authenticateAs(Long userId) {
        AuthenticatedUser p = new AuthenticatedUser(userId, "user@nixtap.com");
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(p, null, List.of()));
    }

    @BeforeEach void setUp()    { authenticateAs(USER_ID); }
    @AfterEach  void tearDown() { SecurityContextHolder.clearContext(); }

    @Test @DisplayName("getAllActiveThemes() — returns only active themes")
    void getAllActiveThemes_ReturnsActive() {
        Theme t = buildTheme();
        when(themeRepository.findByIsActiveTrueOrderByNameAsc()).thenReturn(List.of(t));
        when(themeMapper.toResponse(t)).thenReturn(buildResponse());
        List<ThemeResponse> result = service.getAllActiveThemes();
        assertEquals(1, result.size());
    }

    @Test @DisplayName("createTheme() — saves and returns new theme")
    void createTheme_Success() {
        ThemeRequest req = new ThemeRequest();
        req.setName("Professional Blue"); req.setSlug("professional-blue");
        Theme saved = buildTheme();
        when(themeRepository.existsBySlug("professional-blue")).thenReturn(false);
        when(themeRepository.existsByName("Professional Blue")).thenReturn(false);
        when(themeRepository.save(any())).thenReturn(saved);
        when(themeMapper.toResponse(saved)).thenReturn(buildResponse());
        ThemeResponse result = service.createTheme(req);
        assertNotNull(result);
        assertEquals("professional-blue", result.getSlug());
    }

    @Test @DisplayName("createTheme() — throws DuplicateThemeException when slug exists")
    void createTheme_ThrowsDuplicate_WhenSlugExists() {
        ThemeRequest req = new ThemeRequest();
        req.setName("New Name"); req.setSlug("professional-blue");
        when(themeRepository.existsBySlug("professional-blue")).thenReturn(true);
        assertThrows(DuplicateThemeException.class, () -> service.createTheme(req));
    }

    @Test @DisplayName("applyThemeToCard() — saves selection and returns response")
    void applyThemeToCard_Success() {
        ApplyThemeRequest req = new ApplyThemeRequest();
        req.setUserId(USER_ID); req.setCardId(CARD_ID); req.setThemeId(THEME_ID);
        Theme theme = buildTheme();
        UserThemeSelection sel = UserThemeSelection.builder()
                .id(1L).userId(USER_ID).cardId(CARD_ID).themeId(THEME_ID).build();
        when(themeRepository.findById(THEME_ID)).thenReturn(Optional.of(theme));
        when(selectionRepository.findByCardId(CARD_ID)).thenReturn(Optional.empty());
        when(selectionRepository.save(any())).thenReturn(sel);
        when(themeMapper.toResponse(theme)).thenReturn(buildResponse());
        UserThemeSelectionResponse result = service.applyThemeToCard(req);
        assertNotNull(result);
        assertEquals(THEME_ID, result.getThemeId());
    }

    @Test @DisplayName("applyThemeToCard() — throws ThemeAccessDeniedException when not owner")
    void applyThemeToCard_ThrowsAccessDenied_WhenNotOwner() {
        ApplyThemeRequest req = new ApplyThemeRequest();
        req.setUserId(999L); req.setCardId(CARD_ID); req.setThemeId(THEME_ID);
        assertThrows(ThemeAccessDeniedException.class, () -> service.applyThemeToCard(req));
    }

    @Test @DisplayName("getThemeById() — throws ResourceNotFoundException when not found")
    void getThemeById_ThrowsNotFound() {
        when(themeRepository.findById(999L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> service.getThemeById(999L));
    }

    @Test @DisplayName("deactivateTheme() — sets isActive=false")
    void deactivateTheme_Success() {
        Theme theme = buildTheme();
        when(themeRepository.findById(THEME_ID)).thenReturn(Optional.of(theme));
        when(themeRepository.save(theme)).thenReturn(theme);
        service.deactivateTheme(THEME_ID);
        assertFalse(theme.isActive());
        verify(themeRepository).save(theme);
    }
}
