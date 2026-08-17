package com.nixtap.adminservice.repository;

import com.nixtap.adminservice.entity.AdminAuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdminAuditLogRepository extends JpaRepository<AdminAuditLog, Long> {
    Page<AdminAuditLog> findByAdminUserIdOrderByCreatedAtDesc(Long adminUserId, Pageable pageable);
    Page<AdminAuditLog> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
