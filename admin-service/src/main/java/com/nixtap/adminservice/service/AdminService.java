package com.nixtap.adminservice.service;

import com.nixtap.adminservice.dto.feign.*;
import com.nixtap.adminservice.dto.response.AdminAuditLogResponse;
import com.nixtap.adminservice.dto.response.AdminDashboardResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;



public interface AdminService {
    // Dashboard
    AdminDashboardResponse getDashboard();

    // Users
    PagedResponse<UserSummary> getUsers(int page, int size);
    UserSummary getUserById(Long id);
    void enableUser(Long id);
    void disableUser(Long id);
    void deleteUser(Long id);

    // Cards
    PagedResponse<BusinessCardSummary> getCards(int page, int size);
    void deactivateCard(Long id);
    void deleteCard(Long id);

    // NFC
    PagedResponse<NfcTagSummary> getNfcTags(int page, int size);
    void deactivateNfcTag(Long id);

    // Feedback
    PagedResponse<FeedbackSummary> getPendingFeedback(int page, int size);
    void approveFeedback(Long id);
    void deleteFeedback(Long id);

    // Audit logs
    Page<AdminAuditLogResponse> getAuditLogs(Pageable pageable);
    Page<AdminAuditLogResponse> getAuditLogsByAdmin(Long adminId, Pageable pageable);
}
