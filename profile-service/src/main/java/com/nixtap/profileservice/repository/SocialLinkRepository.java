package com.nixtap.profileservice.repository;

import com.nixtap.profileservice.entity.SocialLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SocialLinkRepository extends JpaRepository<SocialLink, Long> {
    List<SocialLink> findByUserIdOrderBySortOrderAsc(Long userId);
    List<SocialLink> findByCardIdOrderBySortOrderAsc(Long cardId);
    List<SocialLink> findByUserIdAndIsVisibleTrueOrderBySortOrderAsc(Long userId);
    List<SocialLink> findByCardIdAndIsVisibleTrueOrderBySortOrderAsc(Long cardId);
    void deleteAllByUserId(Long userId);
}
