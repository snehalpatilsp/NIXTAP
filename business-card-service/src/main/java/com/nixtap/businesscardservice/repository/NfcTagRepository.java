package com.nixtap.businesscardservice.repository;

import com.nixtap.businesscardservice.entity.NfcTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NfcTagRepository extends JpaRepository<NfcTag, Long> {
    List<NfcTag>      findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<NfcTag>  findByTagUid(String tagUid);
    boolean           existsByTagUid(String tagUid);
    Optional<NfcTag>  findByCardId(Long cardId);
    long              countByUserId(Long userId);
    long              countByUserIdAndStatus(Long userId, String status);
}
