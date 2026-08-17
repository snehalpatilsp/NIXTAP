package com.nixtap.adminservice.service;


import com.nixtap.adminservice.dto.response.AdminAuditLogResponse;
import com.nixtap.adminservice.dto.response.AdminDashboardResponse;
import com.nixtap.adminservice.entity.AdminAuditLog;
import com.nixtap.adminservice.mapper.AdminAuditLogMapper;
import com.nixtap.adminservice.repository.AdminAuditLogRepository;
import com.nixtap.adminservice.security.AuthenticatedUser;
import com.nixtap.adminservice.service.impl.AdminServiceImpl;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class AdminServiceTest {

    @Mock private AdminAuditLogRepository auditLogRepository;
    @Mock private AdminAuditLogMapper     auditLogMapper;

    @InjectMocks private AdminServiceImpl service;

    private static final Long ADMIN_ID = 1L;

    private void authenticateAsAdmin() {
        AuthenticatedUser p = new AuthenticatedUser(ADMIN_ID, "admin@nixtap.com");
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(p, null,
                        List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_ADMIN"))));
    }

    @BeforeEach void setUp()    { authenticateAsAdmin(); }
    @AfterEach  void tearDown() { SecurityContextHolder.clearContext(); }

    @Test
    @DisplayName("getDashboard() — returns zeros (Feign admin endpoints not yet implemented)")
    void getDashboard_ReturnsZeros_UntilAdminEndpointsImplemented() {
        // All upstream Feign admin endpoints are stubs until implemented in each service.
        AdminDashboardResponse result = service.getDashboard();

        assertNotNull(result);
        assertEquals(0L, result.getTotalUsers());
        assertEquals(0L, result.getTotalCards());
        assertEquals(0L, result.getTotalNfcTags());
        assertEquals(0L, result.getTotalAnalyticsEvents());
        assertEquals(0L, result.getTotalFeedback());
        assertEquals(0L, result.getPendingFeedback());
        assertEquals(0L, result.getTotalMeetingRequests());
        assertEquals(0L, result.getPendingMeetingRequests());
    }

    @Test
    @DisplayName("enableUser() — writes USER_ENABLED audit log")
    void enableUser_LogsAudit() {
        when(auditLogRepository.save(any(AdminAuditLog.class))).thenReturn(new AdminAuditLog());

        service.enableUser(42L);

        verify(auditLogRepository).save(argThat(log ->
                "USER_ENABLED".equals(log.getAction()) && "USER".equals(log.getTargetType())));
    }

    @Test
    @DisplayName("disableUser() — writes USER_DISABLED audit log")
    void disableUser_LogsAudit() {
        when(auditLogRepository.save(any(AdminAuditLog.class))).thenReturn(new AdminAuditLog());

        service.disableUser(42L);

        verify(auditLogRepository).save(argThat(log ->
                "USER_DISABLED".equals(log.getAction())));
    }

    @Test
    @DisplayName("deactivateCard() — writes CARD_DEACTIVATED audit log")
    void deactivateCard_LogsAudit() {
        when(auditLogRepository.save(any())).thenReturn(new AdminAuditLog());

        service.deactivateCard(10L);

        verify(auditLogRepository).save(argThat(log ->
                "CARD_DEACTIVATED".equals(log.getAction()) && "CARD".equals(log.getTargetType())));
    }

    @Test
    @DisplayName("approveFeedback() — writes FEEDBACK_APPROVED audit log")
    void approveFeedback_LogsAudit() {
        when(auditLogRepository.save(any())).thenReturn(new AdminAuditLog());

        service.approveFeedback(5L);

        verify(auditLogRepository).save(argThat(log ->
                "FEEDBACK_APPROVED".equals(log.getAction())));
    }

    @Test
    @DisplayName("deleteCard() — writes CARD_DELETED audit log")
    void deleteCard_LogsAudit() {
        when(auditLogRepository.save(any())).thenReturn(new AdminAuditLog());

        service.deleteCard(10L);

        verify(auditLogRepository).save(argThat(log ->
                "CARD_DELETED".equals(log.getAction())));
    }

    @Test
    @DisplayName("deactivateNfcTag() — writes NFC_TAG_DEACTIVATED audit log")
    void deactivateNfcTag_LogsAudit() {
        when(auditLogRepository.save(any())).thenReturn(new AdminAuditLog());

        service.deactivateNfcTag(7L);

        verify(auditLogRepository).save(argThat(log ->
                "NFC_TAG_DEACTIVATED".equals(log.getAction())));
    }

    @Test
    @DisplayName("getAuditLogs() — returns paginated audit log")
    void getAuditLogs_ReturnsPaged() {
        AdminAuditLog entity = AdminAuditLog.builder().id(1L).adminUserId(ADMIN_ID)
                .action("USER_ENABLED").build();
        AdminAuditLogResponse response = AdminAuditLogResponse.builder()
                .id(1L).action("USER_ENABLED").build();

        Page<AdminAuditLog> page = new PageImpl<>(List.of(entity));
        Pageable pageable = PageRequest.of(0, 20, Sort.by("createdAt").descending());

        when(auditLogRepository.findAllByOrderByCreatedAtDesc(pageable)).thenReturn(page);
        when(auditLogMapper.toResponse(entity)).thenReturn(response);

        Page<AdminAuditLogResponse> result = service.getAuditLogs(pageable);

        assertEquals(1, result.getTotalElements());
        assertEquals("USER_ENABLED", result.getContent().get(0).getAction());
    }
}
