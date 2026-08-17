package com.nixtap.notificationservice.repository;

import com.nixtap.notificationservice.entity.NotificationLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationLogRepository extends JpaRepository<NotificationLog, Long> {
    Page<NotificationLog> findByUserIdOrderBySentAtDesc(Long userId, Pageable pageable);
    long countByUserIdAndIsRead(Long userId, boolean isRead);
    void deleteAllByUserId(Long userId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query(
        "UPDATE NotificationLog n SET n.isRead = true WHERE n.userId = :userId AND n.isRead = false")
    int markAllReadByUserId(@org.springframework.data.repository.query.Param("userId") Long userId);
}
