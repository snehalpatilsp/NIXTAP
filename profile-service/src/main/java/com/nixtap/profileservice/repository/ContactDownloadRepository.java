package com.nixtap.profileservice.repository;

import com.nixtap.profileservice.entity.ContactDownload;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContactDownloadRepository extends JpaRepository<ContactDownload, Long> {
    List<ContactDownload> findByUserIdOrderByCreatedAtDesc(Long userId);
    long countByUserId(Long userId);
    long countByCardId(Long cardId);
}
