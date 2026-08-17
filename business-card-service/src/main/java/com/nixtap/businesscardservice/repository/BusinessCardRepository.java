package com.nixtap.businesscardservice.repository;

import com.nixtap.businesscardservice.entity.BusinessCard;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BusinessCardRepository extends JpaRepository<BusinessCard, Long> {
    List<BusinessCard> findByUserId(Long userId);
    Page<BusinessCard> findByUserId(Long userId, Pageable pageable);
    Optional<BusinessCard> findBySlug(String slug);
    Boolean existsBySlug(String slug);
    Boolean existsBySlugAndIdNot(String slug, Long id);
}