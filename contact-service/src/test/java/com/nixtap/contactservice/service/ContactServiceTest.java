package com.nixtap.contactservice.service;

import com.nixtap.contactservice.client.ProfileClient;
import com.nixtap.contactservice.client.SocialClient;
import com.nixtap.contactservice.dto.feign.ProfileResponse;
import com.nixtap.contactservice.dto.feign.SocialLinkResponse;
import com.nixtap.contactservice.dto.response.ContactDownloadResponse;
import com.nixtap.contactservice.dto.response.DownloadCountResponse;
import com.nixtap.contactservice.entity.ContactDownload;
import com.nixtap.contactservice.exception.ContactAccessDeniedException;
import com.nixtap.contactservice.mapper.ContactDownloadMapper;
import com.nixtap.contactservice.repository.ContactDownloadRepository;
import com.nixtap.contactservice.security.AuthenticatedUser;
import com.nixtap.contactservice.service.impl.ContactServiceImpl;
import com.nixtap.contactservice.util.VCardBuilder;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class ContactServiceTest {

    @Mock private ProfileClient             profileClient;
    @Mock private SocialClient              socialClient;
    @Mock private VCardBuilder              vCardBuilder;
    @Mock private ContactDownloadRepository downloadRepository;
    @Mock private ContactDownloadMapper     downloadMapper;
    @Mock private HttpServletRequest        httpRequest;

    @InjectMocks private ContactServiceImpl service;

    private static final Long USER_ID = 1L;

    private void authenticateAs(Long userId) {
        AuthenticatedUser p = new AuthenticatedUser(userId, "test@nixtap.com");
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(p, null, List.of()));
    }

    @BeforeEach void setUp()    { authenticateAs(USER_ID); }
    @AfterEach  void tearDown() { SecurityContextHolder.clearContext(); }

    @Test
    @DisplayName("generateVCardForUser() — builds vCard, logs download, returns content")
    void generateVCardForUser_Success() {
        ProfileResponse profile = new ProfileResponse();
        profile.setUserId(USER_ID);
        profile.setFullName("John Doe");
        profile.setEmail("john@nixtap.com");

        SocialLinkResponse link = new SocialLinkResponse();
        link.setPlatform("LINKEDIN");
        link.setUrl("https://linkedin.com/in/john");
        link.setVisible(true);

        when(profileClient.getProfileByUserId(USER_ID)).thenReturn(profile);
        when(socialClient.getPublicLinksByUserId(USER_ID)).thenReturn(List.of(link));
        when(vCardBuilder.build(profile, List.of(link))).thenReturn("BEGIN:VCARD\r\nFN:John Doe\r\nEND:VCARD\r\n");
        when(downloadRepository.save(any(ContactDownload.class))).thenReturn(new ContactDownload());
        when(httpRequest.getHeader("X-Forwarded-For")).thenReturn(null);
        when(httpRequest.getHeader("X-Real-IP")).thenReturn(null);
        when(httpRequest.getRemoteAddr()).thenReturn("127.0.0.1");
        when(httpRequest.getHeader("User-Agent")).thenReturn("TestAgent/1.0");

        String result = service.generateVCardForUser(USER_ID, httpRequest);

        assertNotNull(result);
        assertTrue(result.contains("BEGIN:VCARD"));
        verify(downloadRepository).save(any(ContactDownload.class));
    }

    @Test
    @DisplayName("generateVCardForUser() — social-service failure degrades gracefully")
    void generateVCardForUser_DegradesSocialLinks_WhenSocialServiceFails() {
        ProfileResponse profile = new ProfileResponse();
        profile.setUserId(USER_ID);
        profile.setFullName("John Doe");

        when(profileClient.getProfileByUserId(USER_ID)).thenReturn(profile);
        when(socialClient.getPublicLinksByUserId(USER_ID)).thenThrow(new RuntimeException("social-service down"));
        when(vCardBuilder.build(eq(profile), eq(List.of()))).thenReturn("BEGIN:VCARD\r\nFN:John Doe\r\nEND:VCARD\r\n");
        when(downloadRepository.save(any())).thenReturn(new ContactDownload());
        when(httpRequest.getHeader("X-Forwarded-For")).thenReturn(null);
        when(httpRequest.getHeader("X-Real-IP")).thenReturn(null);
        when(httpRequest.getRemoteAddr()).thenReturn("127.0.0.1");
        when(httpRequest.getHeader("User-Agent")).thenReturn("TestAgent/1.0");

        String result = service.generateVCardForUser(USER_ID, httpRequest);

        assertNotNull(result); // no exception thrown — graceful degradation
        verify(vCardBuilder).build(eq(profile), eq(List.of()));
    }

    @Test
    @DisplayName("getDownloadHistory() — returns list for owner")
    void getDownloadHistory_Success() {
        ContactDownload dl = ContactDownload.builder().id(1L).userId(USER_ID).build();
        ContactDownloadResponse resp = ContactDownloadResponse.builder().id(1L).userId(USER_ID).build();
        when(downloadRepository.findByUserIdOrderByCreatedAtDesc(USER_ID)).thenReturn(List.of(dl));
        when(downloadMapper.toResponse(dl)).thenReturn(resp);

        List<ContactDownloadResponse> result = service.getDownloadHistory(USER_ID);
        assertEquals(1, result.size());
    }

    @Test
    @DisplayName("getDownloadHistory() — throws ContactAccessDeniedException when not owner")
    void getDownloadHistory_ThrowsAccessDenied_WhenNotOwner() {
        assertThrows(ContactAccessDeniedException.class, () -> service.getDownloadHistory(999L));
        verify(downloadRepository, never()).findByUserIdOrderByCreatedAtDesc(any());
    }

    @Test
    @DisplayName("getDownloadCount() — returns correct count for owner")
    void getDownloadCount_Success() {
        when(downloadRepository.countByUserId(USER_ID)).thenReturn(42L);
        DownloadCountResponse result = service.getDownloadCount(USER_ID);
        assertEquals(42L, result.getTotalDownloads());
    }
}
