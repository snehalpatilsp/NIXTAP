package com.nixtap.socialservice.service;

import com.nixtap.socialservice.dto.request.SocialLinkRequest;
import com.nixtap.socialservice.dto.response.SocialLinkResponse;
import com.nixtap.socialservice.entity.SocialLink;
import com.nixtap.socialservice.exception.SocialAccessDeniedException;
import com.nixtap.socialservice.mapper.SocialLinkMapper;
import com.nixtap.socialservice.repository.SocialLinkRepository;
import com.nixtap.socialservice.security.AuthenticatedUser;
import com.nixtap.socialservice.service.impl.SocialLinkServiceImpl;
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

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class SocialLinkServiceTest {

    @Mock private SocialLinkRepository repository;
    @Mock private SocialLinkMapper     mapper;
    @InjectMocks private SocialLinkServiceImpl service;

    private static final Long USER_ID = 1L;

    private SocialLink buildLink(Long userId) {
        return SocialLink.builder().id(1L).userId(userId).platform("LINKEDIN")
                .url("https://linkedin.com/in/test").isVisible(true).sortOrder(0).build();
    }

    private void authenticateAs(Long userId) {
        AuthenticatedUser p = new AuthenticatedUser(userId, "test@nixtap.com");
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(p, null, List.of()));
    }

    @BeforeEach void setUp()    { authenticateAs(USER_ID); }
    @AfterEach  void tearDown() { SecurityContextHolder.clearContext(); }

    @Test
    @DisplayName("addLink() — persists link and returns response")
    void addLink_Success() {
        SocialLinkRequest req = new SocialLinkRequest();
        req.setUserId(USER_ID); req.setPlatform("LINKEDIN");
        req.setUrl("https://linkedin.com/in/test");
        SocialLink saved = buildLink(USER_ID);
        SocialLinkResponse response = SocialLinkResponse.builder().id(1L).userId(USER_ID).build();
        when(repository.save(any())).thenReturn(saved);
        when(mapper.toResponse(saved)).thenReturn(response);

        SocialLinkResponse result = service.addLink(req);
        assertNotNull(result);
        verify(repository).save(any(SocialLink.class));
    }

    @Test
    @DisplayName("addLink() — throws SocialAccessDeniedException when userId mismatch")
    void addLink_ThrowsAccessDenied_WhenNotOwner() {
        SocialLinkRequest req = new SocialLinkRequest();
        req.setUserId(999L); req.setPlatform("GITHUB"); req.setUrl("https://github.com/test");
        assertThrows(SocialAccessDeniedException.class, () -> service.addLink(req));
        verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("deleteLink() — deletes link when owner calls")
    void deleteLink_Success() {
        SocialLink link = buildLink(USER_ID);
        when(repository.findById(1L)).thenReturn(Optional.of(link));
        doNothing().when(repository).delete(link);
        assertDoesNotThrow(() -> service.deleteLink(1L));
        verify(repository).delete(link);
    }

    @Test
    @DisplayName("deleteLink() — throws SocialAccessDeniedException when not owner")
    void deleteLink_ThrowsAccessDenied_WhenNotOwner() {
        SocialLink link = buildLink(999L);
        when(repository.findById(1L)).thenReturn(Optional.of(link));
        assertThrows(SocialAccessDeniedException.class, () -> service.deleteLink(1L));
        verify(repository, never()).delete(any());
    }

    @Test
    @DisplayName("toggleVisibility() — flips isVisible and saves")
    void toggleVisibility_Success() {
        SocialLink link = buildLink(USER_ID);
        SocialLinkResponse response = SocialLinkResponse.builder().id(1L).isVisible(false).build();
        when(repository.findById(1L)).thenReturn(Optional.of(link));
        when(repository.save(link)).thenReturn(link);
        when(mapper.toResponse(link)).thenReturn(response);

        SocialLinkResponse result = service.toggleVisibility(1L);
        assertFalse(result.isVisible());
    }
}
