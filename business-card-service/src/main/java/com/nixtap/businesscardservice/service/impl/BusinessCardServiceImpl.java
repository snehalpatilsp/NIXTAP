package com.nixtap.businesscardservice.service.impl;

import com.nixtap.businesscardservice.dto.request.BusinessCardRequest;
import com.nixtap.businesscardservice.dto.response.BusinessCardResponse;
import com.nixtap.businesscardservice.entity.BusinessCard;
import com.nixtap.businesscardservice.exception.CardAccessDeniedException;
import com.nixtap.businesscardservice.exception.DuplicateSlugException;
import com.nixtap.businesscardservice.exception.ResourceNotFoundException;
import com.nixtap.businesscardservice.mapper.BusinessCardMapper;
import com.nixtap.businesscardservice.repository.BusinessCardRepository;
import com.nixtap.businesscardservice.security.AuthenticatedUser;
import com.nixtap.businesscardservice.service.BusinessCardService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class BusinessCardServiceImpl implements BusinessCardService {

    private final BusinessCardRepository cardRepository;
    private final BusinessCardMapper cardMapper;

    // -----------------------------------------------------------------------
    // Helper: extract the authenticated userId from the SecurityContext
    // -----------------------------------------------------------------------
    private Long getAuthenticatedUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof AuthenticatedUser principal)) {
            throw new CardAccessDeniedException("Authentication required.");
        }
        return principal.getUserId();
    }

    private void assertOwnership(BusinessCard card) {
        Long callerId = getAuthenticatedUserId();
        if (!card.getUserId().equals(callerId)) {
            throw new CardAccessDeniedException("You do not have permission to access this business card.");
        }
    }

    // -----------------------------------------------------------------------
    // CRUD
    // -----------------------------------------------------------------------

    @Override
    @Transactional
    public BusinessCardResponse createCard(BusinessCardRequest request) {
        String slug = request.getSlug();
        if (slug == null || slug.isBlank()) {
            slug = generateDefaultSlug(request.getCardTitle());
        } else if (cardRepository.existsBySlug(slug)) {
            throw new DuplicateSlugException("Slug '" + slug + "' is already in use.");
        }

        BusinessCard card = cardMapper.toEntity(request);
        card.setSlug(slug);
        // Bind the card to the authenticated user
        card.setUserId(getAuthenticatedUserId());
        // MapStruct cannot map boolean isPublic (reserved keyword) — set manually
        card.setPublic(request.isPublic());

        BusinessCard savedCard = cardRepository.save(card);
        return cardMapper.toResponse(savedCard);
    }

    @Override
    @Transactional(readOnly = true)
    public BusinessCardResponse getCardById(Long id) {
        BusinessCard card = cardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Business card not found with ID: " + id));
        assertOwnership(card);
        return cardMapper.toResponse(card);
    }

    @Override
    @Transactional(readOnly = true)
    public BusinessCardResponse getCardBySlug(String slug) {
        BusinessCard card = cardRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Business card not found with slug: " + slug));
        assertOwnership(card);
        return cardMapper.toResponse(card);
    }

    @Override
    @Transactional(readOnly = true)
    public BusinessCardResponse getPublicCardBySlug(String slug) {
        BusinessCard card = cardRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Business card not found with slug: " + slug));

        if (!card.isPublic()) {
            throw new CardAccessDeniedException("This business card is private.");
        }

        return cardMapper.toResponse(card);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BusinessCardResponse> getMyCards() {
        Long userId = getAuthenticatedUserId();
        List<BusinessCard> cards = cardRepository.findByUserId(userId);
        return cardMapper.toResponseList(cards);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BusinessCardResponse> getCardsByUserId(Long userId) {
        return cardRepository.findByUserId(userId)
                .stream()
                .map(cardMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BusinessCardResponse> getCardsByUserId(Long userId, Pageable pageable) {
        Long callerId = getAuthenticatedUserId();
        if (!userId.equals(callerId)) {
            throw new CardAccessDeniedException("You can only view your own business cards.");
        }
        return cardRepository.findByUserId(userId, pageable)
                .map(cardMapper::toResponse);
    }

    @Override
    @Transactional
    public BusinessCardResponse updateCard(Long id, BusinessCardRequest request) {
        BusinessCard card = cardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Business card not found with ID: " + id));

        assertOwnership(card);

        if (request.getSlug() != null && !request.getSlug().isBlank()) {
            if (cardRepository.existsBySlugAndIdNot(request.getSlug(), id)) {
                throw new DuplicateSlugException("Slug '" + request.getSlug() + "' is already taken.");
            }
            card.setSlug(request.getSlug());
        }

        if (request.getCardTitle() != null && !request.getCardTitle().isBlank()) {
            card.setCardTitle(request.getCardTitle());
        }
        if (request.getCompany() != null) {
            card.setCompany(request.getCompany());
        }
        if (request.getDesignation() != null) {
            card.setDesignation(request.getDesignation());
        }
        if (request.getTheme() != null && !request.getTheme().isBlank()) {
            card.setTheme(request.getTheme());
        }
        card.setPublic(request.isPublic());

        if (request.getProfileImage() != null) {
            card.setProfileImage(request.getProfileImage());
        }
        if (request.getCoverImage() != null) {
            card.setCoverImage(request.getCoverImage());
        }

        BusinessCard updatedCard = cardRepository.save(card);
        return cardMapper.toResponse(updatedCard);
    }

    @Override
    @Transactional
    public void deleteCard(Long id) {
        BusinessCard card = cardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Business card not found with ID: " + id));

        assertOwnership(card);
        cardRepository.delete(card);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isSlugAvailable(String slug) {
        return !cardRepository.existsBySlug(slug);
    }

    // -----------------------------------------------------------------------
    // Private helpers
    // -----------------------------------------------------------------------

    private String generateDefaultSlug(String title) {
        String baseSlug = title.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-");

        String candidate = baseSlug;
        int maxAttempts = 10;
        int attempt = 0;
        while (cardRepository.existsBySlug(candidate) && attempt++ < maxAttempts) {
            candidate = baseSlug + "-" + UUID.randomUUID().toString().substring(0, 8);
        }
        if (attempt >= maxAttempts) {
            throw new RuntimeException("Unable to generate a unique slug after " + maxAttempts + " attempts.");
        }
        return candidate;
    }
}
