package com.nixtap.businesscardservice.repository;

import com.nixtap.businesscardservice.entity.UserThemeSelection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserThemeSelectionRepository extends JpaRepository<UserThemeSelection, Long> {
    Optional<UserThemeSelection> findByCardId(Long cardId);
    List<UserThemeSelection>     findByUserId(Long userId);
    boolean                      existsByCardId(Long cardId);
    void                         deleteByCardId(Long cardId);
}
