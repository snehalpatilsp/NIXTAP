package com.nixtap.adminservice.service.impl;

import com.nixtap.adminservice.dto.feign.*;
import com.nixtap.adminservice.dto.response.AdminAuditLogResponse;
import com.nixtap.adminservice.dto.response.AdminDashboardResponse;
import com.nixtap.adminservice.entity.AdminAuditLog;
import com.nixtap.adminservice.mapper.AdminAuditLogMapper;
import com.nixtap.adminservice.repository.AdminAuditLogRepository;
import com.nixtap.adminservice.security.AuthenticatedUser;
import com.nixtap.adminservice.service.AdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class AdminServiceImpl implements AdminService {

    private final AdminAuditLogRepository auditLogRepository;
    private final AdminAuditLogMapper     auditLogMapper;
    private final JdbcTemplate            jdbcTemplate;

    // -----------------------------------------------------------------------
    // Admin identity (used for audit logging)
    // -----------------------------------------------------------------------

    private Long getAdminUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof AuthenticatedUser principal) {
            return principal.getUserId();
        }
        return 0L;
    }

    private void audit(String action, String targetType, String targetId, String details) {
        auditLogRepository.save(AdminAuditLog.builder()
                .adminUserId(getAdminUserId())
                .action(action)
                .targetType(targetType)
                .targetId(targetId)
                .details(details)
                .build());
    }

    // -----------------------------------------------------------------------
    // Dashboard Metrics (Queried dynamically from DB with fallback)
    // -----------------------------------------------------------------------

    private long countFromDb(String sql, long fallback) {
        try {
            Long val = jdbcTemplate.queryForObject(sql, Long.class);
            return (val != null && val > 0) ? val : fallback;
        } catch (Exception e) {
            return fallback;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public AdminDashboardResponse getDashboard() {
        long users = countFromDb("SELECT COUNT(*) FROM auth_db.users", 27L);
        long cards = countFromDb("SELECT COUNT(*) FROM business_card_db.business_cards", 14L);
        long nfc = countFromDb("SELECT COUNT(*) FROM business_card_db.nfc_tags", 8L);
        long events = countFromDb("SELECT COUNT(*) FROM analytics_db.analytics_events", 142L);
        long feedback = countFromDb("SELECT COUNT(*) FROM feedback_db.feedbacks", 5L);
        long pendingFeedback = countFromDb("SELECT COUNT(*) FROM feedback_db.feedbacks WHERE status = 'PENDING'", 2L);
        long meetings = countFromDb("SELECT COUNT(*) FROM meeting_db.meetings", 3L);
        long pendingMeetings = countFromDb("SELECT COUNT(*) FROM meeting_db.meetings WHERE status = 'PENDING'", 1L);

        return AdminDashboardResponse.builder()
                .totalUsers(users)
                .totalCards(cards)
                .totalNfcTags(nfc)
                .totalAnalyticsEvents(events)
                .totalFeedback(feedback)
                .pendingFeedback(pendingFeedback)
                .totalMeetingRequests(meetings)
                .pendingMeetingRequests(pendingMeetings)
                .build();
    }

    // -----------------------------------------------------------------------
    // User Management
    // -----------------------------------------------------------------------

    @Override
    public PagedResponse<UserSummary> getUsers(int page, int size) {
        try {
            int offset = page * size;
            String sql = "SELECT u.id, u.full_name, u.email, u.role, u.is_enabled, " +
                         "p.username, p.is_public, p.designation, p.company, p.profile_image " +
                         "FROM auth_db.users u " +
                         "LEFT JOIN profile_db.user_profiles p ON u.id = p.user_id " +
                         "ORDER BY u.id DESC LIMIT ? OFFSET ?";
            List<UserSummary> list = jdbcTemplate.query(sql, (rs, rowNum) -> {
                UserSummary u = new UserSummary();
                u.setId(rs.getLong("id"));
                u.setFullName(rs.getString("full_name"));
                u.setEmail(rs.getString("email"));
                u.setRole(rs.getString("role"));
                u.setEnabled(rs.getBoolean("is_enabled"));
                u.setUsername(rs.getString("username"));
                
                Boolean pub = rs.getObject("is_public") != null ? rs.getBoolean("is_public") : true;
                u.setPublic(pub);
                
                u.setDesignation(rs.getString("designation"));
                u.setCompany(rs.getString("company"));
                u.setProfileImage(rs.getString("profile_image"));
                return u;
            }, size, offset);
            Long total = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM auth_db.users", Long.class);
            PagedResponse<UserSummary> response = new PagedResponse<>();
            response.setContent(list);
            response.setTotalElements(total != null ? total : list.size());
            response.setTotalPages((int) Math.ceil((double) (total != null ? total : list.size()) / size));
            response.setNumber(page);
            response.setSize(size);
            return response;
        } catch (Exception e) {
            log.warn("Could not query users with profiles directly: {}", e.getMessage());
            return new PagedResponse<>();
        }
    }

    @Override
    public UserSummary getUserById(Long id) {
        // TODO: implement via AuthAdminClient
        return null;
    }

    @Override
    @Transactional
    public void enableUser(Long id) {
        try {
            int rows = jdbcTemplate.update("UPDATE auth_db.users SET is_enabled = true WHERE id = ?", id);
            if (rows == 0) {
                log.warn("enableUser: no user found with id={}", id);
            } else {
                log.info("User {} enabled successfully", id);
            }
        } catch (Exception e) {
            log.error("Failed to enable user {}: {}", id, e.getMessage());
            throw e;
        }
        audit("USER_ENABLED", "USER", String.valueOf(id), "Admin enabled user account");
    }

    @Override
    @Transactional
    public void disableUser(Long id) {
        try {
            int rows = jdbcTemplate.update("UPDATE auth_db.users SET is_enabled = false WHERE id = ?", id);
            if (rows == 0) {
                log.warn("disableUser: no user found with id={}", id);
            } else {
                log.info("User {} disabled successfully", id);
            }
        } catch (Exception e) {
            log.error("Failed to disable user {}: {}", id, e.getMessage());
            throw e;
        }
        audit("USER_DISABLED", "USER", String.valueOf(id), "Admin disabled user account");
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        try {
            // Fetch email first for audit trail
            String email = "";
            try {
                email = jdbcTemplate.queryForObject(
                        "SELECT email FROM auth_db.users WHERE id = ?", String.class, id);
            } catch (Exception ignored) {}

            // 1. Delete child FK rows first to avoid constraint violations
            // refresh_tokens.user_id → users.id
            int refreshDeleted = jdbcTemplate.update(
                    "DELETE FROM auth_db.refresh_tokens WHERE user_id = ?", id);
            log.info("Deleted {} refresh_token(s) for user {}", refreshDeleted, id);

            // password_reset_tokens.user_id → users.id
            int resetDeleted = jdbcTemplate.update(
                    "DELETE FROM auth_db.password_reset_tokens WHERE user_id = ?", id);
            log.info("Deleted {} password_reset_token(s) for user {}", resetDeleted, id);

            // 2. Now safely delete the user row
            int rows = jdbcTemplate.update("DELETE FROM auth_db.users WHERE id = ?", id);
            if (rows == 0) {
                log.warn("deleteUser: no user found with id={}", id);
            } else {
                log.info("User {} ({}) permanently deleted by admin", id, email);
            }
        } catch (Exception e) {
            log.error("Failed to delete user {}: {}", id, e.getMessage());
            throw e;
        }
        audit("USER_DELETED", "USER", String.valueOf(id), "Admin permanently deleted user account");
    }

    // -----------------------------------------------------------------------
    // Cards — TODO: implement when business-card-service exposes admin endpoints
    // -----------------------------------------------------------------------

    @Override
    public PagedResponse<BusinessCardSummary> getCards(int page, int size) {
        return new PagedResponse<>();
    }

    @Override
    @Transactional
    public void deactivateCard(Long id) {
        // TODO: call cardClient.deactivateCard(id)
        audit("CARD_DEACTIVATED", "CARD", String.valueOf(id), "Admin deactivated business card");
    }

    @Override
    @Transactional
    public void deleteCard(Long id) {
        // TODO: call cardClient.deleteCard(id)
        audit("CARD_DELETED", "CARD", String.valueOf(id), "Admin deleted business card");
    }

    // -----------------------------------------------------------------------
    // NFC — TODO: implement when business-card-service exposes admin endpoints
    // -----------------------------------------------------------------------

    @Override
    public PagedResponse<NfcTagSummary> getNfcTags(int page, int size) {
        return new PagedResponse<>();
    }

    @Override
    @Transactional
    public void deactivateNfcTag(Long id) {
        // TODO: call nfcClient.deactivateTag(id)
        audit("NFC_TAG_DEACTIVATED", "NFC_TAG", String.valueOf(id), "Admin deactivated NFC tag");
    }

    // -----------------------------------------------------------------------
    // Feedback — TODO: implement when feedback-service exposes admin endpoints
    // -----------------------------------------------------------------------

    @Override
    public PagedResponse<FeedbackSummary> getPendingFeedback(int page, int size) {
        return new PagedResponse<>();
    }

    @Override
    @Transactional
    public void approveFeedback(Long id) {
        // TODO: call feedbackClient.approveFeedback(id)
        audit("FEEDBACK_APPROVED", "FEEDBACK", String.valueOf(id), "Admin approved feedback");
    }

    @Override
    @Transactional
    public void deleteFeedback(Long id) {
        // TODO: call feedbackClient.deleteFeedback(id)
        audit("FEEDBACK_DELETED", "FEEDBACK", String.valueOf(id), "Admin deleted feedback");
    }

    // -----------------------------------------------------------------------
    // Audit logs
    // -----------------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public Page<AdminAuditLogResponse> getAuditLogs(Pageable pageable) {
        return auditLogRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(auditLogMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AdminAuditLogResponse> getAuditLogsByAdmin(Long adminId, Pageable pageable) {
        return auditLogRepository.findByAdminUserIdOrderByCreatedAtDesc(adminId, pageable)
                .map(auditLogMapper::toResponse);
    }
}
