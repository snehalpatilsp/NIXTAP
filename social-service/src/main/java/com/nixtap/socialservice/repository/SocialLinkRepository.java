package com.nixtap.socialservice.repository;

import com.nixtap.socialservice.entity.SocialLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SocialLinkRepository extends JpaRepository<SocialLink, Long> {

    List<SocialLink> findByUserIdOrderBySortOrderAsc(Long userId);

    List<SocialLink> findByCardIdOrderBySortOrderAsc(Long cardId);

    List<SocialLink> findByUserIdAndIsVisibleTrueOrderBySortOrderAsc(Long userId);

    List<SocialLink> findByCardIdAndIsVisibleTrueOrderBySortOrderAsc(Long cardId);

    boolean existsByIdAndUserId(Long id, Long userId);

    void deleteAllByUserId(Long userId);
}
