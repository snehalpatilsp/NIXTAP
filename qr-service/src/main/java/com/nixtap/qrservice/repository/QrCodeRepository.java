package com.nixtap.qrservice.repository;

import com.nixtap.qrservice.entity.QrCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QrCodeRepository extends JpaRepository<QrCode, Long> {

    List<QrCode> findByUserId(Long userId);

    Optional<QrCode> findByCardId(Long cardId);

    boolean existsByCardId(Long cardId);
}
