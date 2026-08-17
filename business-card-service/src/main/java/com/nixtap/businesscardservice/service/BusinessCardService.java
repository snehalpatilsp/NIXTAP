package com.nixtap.businesscardservice.service;

import com.nixtap.businesscardservice.dto.request.BusinessCardRequest;
import com.nixtap.businesscardservice.dto.response.BusinessCardResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface BusinessCardService {
    BusinessCardResponse createCard(BusinessCardRequest request);
    BusinessCardResponse getCardById(Long id);
    BusinessCardResponse getCardBySlug(String slug);
    BusinessCardResponse getPublicCardBySlug(String slug);
    List<BusinessCardResponse> getMyCards();
    List<BusinessCardResponse> getCardsByUserId(Long userId);
    Page<BusinessCardResponse> getCardsByUserId(Long userId, Pageable pageable);
    BusinessCardResponse updateCard(Long id, BusinessCardRequest request);
    void deleteCard(Long id);
    boolean isSlugAvailable(String slug);
}