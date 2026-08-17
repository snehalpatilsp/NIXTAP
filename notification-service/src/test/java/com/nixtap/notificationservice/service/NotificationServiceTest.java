package com.nixtap.notificationservice.service;

import com.nixtap.notificationservice.dto.request.NotificationPreferenceRequest;
import com.nixtap.notificationservice.dto.response.NotificationPreferenceResponse;
import com.nixtap.notificationservice.entity.NotificationPreference;
import com.nixtap.notificationservice.exception.NotificationAccessDeniedException;
import com.nixtap.notificationservice.mapper.NotificationMapper;
import com.nixtap.notificationservice.repository.NotificationLogRepository;
import com.nixtap.notificationservice.repository.NotificationPreferenceRepository;
import com.nixtap.notificationservice.security.AuthenticatedUser;
import com.nixtap.notificationservice.service.impl.NotificationServiceImpl;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class NotificationServiceTest {

    @Mock private NotificationPreferenceRepository preferenceRepository;
    @Mock private NotificationLogRepository        logRepository;
    @Mock private NotificationMapper               notificationMapper;
    @Mock private JavaMailSender                   mailSender;

    @InjectMocks private NotificationServiceImpl notificationService;

    private static final Long USER_ID = 10L;

    private void authenticateAs(Long userId) {
        AuthenticatedUser principal = new AuthenticatedUser(userId, "user@nixtap.com");
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(principal, null, List.of()));
    }

    @BeforeEach void setUp()   { authenticateAs(USER_ID); }
    @AfterEach  void tearDown(){ SecurityContextHolder.clearContext(); }

    @Test
    @DisplayName("getMyPreferences() — auto-creates defaults when no record exists")
    void getMyPreferences_CreatesDefaults_WhenNotPresent() {
        NotificationPreference defaults = NotificationPreference.builder().userId(USER_ID).build();
        NotificationPreferenceResponse response = NotificationPreferenceResponse.builder()
                .userId(USER_ID).emailEnabled(true).build();

        when(preferenceRepository.findByUserId(USER_ID)).thenReturn(Optional.empty());
        when(preferenceRepository.save(any())).thenReturn(defaults);
        when(notificationMapper.toPreferenceResponse(defaults)).thenReturn(response);

        NotificationPreferenceResponse result = notificationService.getMyPreferences();

        assertNotNull(result);
        verify(preferenceRepository).save(any(NotificationPreference.class));
    }

    @Test
    @DisplayName("getMyPreferences() — returns existing preferences without creating new ones")
    void getMyPreferences_ReturnsExisting() {
        NotificationPreference pref = NotificationPreference.builder().userId(USER_ID).build();
        NotificationPreferenceResponse response = NotificationPreferenceResponse.builder()
                .userId(USER_ID).emailEnabled(true).build();

        when(preferenceRepository.findByUserId(USER_ID)).thenReturn(Optional.of(pref));
        when(notificationMapper.toPreferenceResponse(pref)).thenReturn(response);

        NotificationPreferenceResponse result = notificationService.getMyPreferences();

        assertNotNull(result);
        verify(preferenceRepository, never()).save(any());
    }

    @Test
    @DisplayName("updateMyPreferences() — saves updated values and returns response")
    void updateMyPreferences_Success() {
        NotificationPreferenceRequest request = new NotificationPreferenceRequest();
        request.setEmailEnabled(false);
        request.setSmsEnabled(true);
        request.setPushEnabled(true);
        request.setNotifyOnView(true);
        request.setNotifyOnMeetingRequest(false);
        request.setNotifyOnFeedback(false);

        NotificationPreference pref = NotificationPreference.builder().userId(USER_ID).build();
        NotificationPreferenceResponse response = NotificationPreferenceResponse.builder()
                .userId(USER_ID).smsEnabled(true).build();

        when(preferenceRepository.findByUserId(USER_ID)).thenReturn(Optional.of(pref));
        when(preferenceRepository.save(any())).thenReturn(pref);
        when(notificationMapper.toPreferenceResponse(pref)).thenReturn(response);

        NotificationPreferenceResponse result = notificationService.updateMyPreferences(request);

        assertNotNull(result);
        verify(preferenceRepository).save(pref);
    }

    @Test
    @DisplayName("countUnread() — returns correct unread count for authenticated user")
    void countUnread_ReturnsCount() {
        when(logRepository.countByUserIdAndIsRead(USER_ID, false)).thenReturn(5L);
        assertEquals(5L, notificationService.countUnread());
    }

    @Test
    @DisplayName("markAsRead() — throws NotificationAccessDeniedException when log belongs to another user")
    void markAsRead_ThrowsAccessDenied_WhenNotOwner() {
        com.nixtap.notificationservice.entity.NotificationLog log =
                com.nixtap.notificationservice.entity.NotificationLog.builder()
                        .id(1L).userId(999L).isRead(false).build();
        when(logRepository.findById(1L)).thenReturn(Optional.of(log));
        assertThrows(NotificationAccessDeniedException.class, () -> notificationService.markAsRead(1L));
    }
}
