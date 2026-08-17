package com.nixtap.businesscardservice.service;

import com.nixtap.businesscardservice.dto.request.BusinessCardRequest;
import com.nixtap.businesscardservice.dto.response.BusinessCardResponse;
import com.nixtap.businesscardservice.entity.BusinessCard;
import com.nixtap.businesscardservice.exception.CardAccessDeniedException;
import com.nixtap.businesscardservice.exception.DuplicateSlugException;
import com.nixtap.businesscardservice.exception.ResourceNotFoundException;
import com.nixtap.businesscardservice.mapper.BusinessCardMapper;
import com.nixtap.businesscardservice.repository.BusinessCardRepository;
import com.nixtap.businesscardservice.security.AuthenticatedUser;
import com.nixtap.businesscardservice.service.impl.BusinessCardServiceImpl;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class BusinessCardServiceTest {

    @Mock private BusinessCardRepository cardRepository;
    @Mock private BusinessCardMapper cardMapper;

    @InjectMocks
    private BusinessCardServiceImpl cardService;

    private BusinessCard card;
    private BusinessCardRequest cardRequest;
    private BusinessCardResponse cardResponse;

    // -----------------------------------------------------------------------
    // Seed the SecurityContext so getAuthenticatedUserId() works in unit tests
    // -----------------------------------------------------------------------
    private void authenticateAs(Long userId) {
        AuthenticatedUser principal = new AuthenticatedUser(userId, "test@nixtap.com");
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(principal, null, List.of());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @BeforeEach
    void setUp() {
        authenticateAs(100L);

        card = BusinessCard.builder()
                .id(1L)
                .userId(100L)
                .cardTitle("Executive Tech Card")
                .company("Nixtap Tech")
                .designation("CTO")
                .theme("Professional Blue")
                .slug("executive-tech-card")
                .isPublic(true)
                .build();

        cardRequest = new BusinessCardRequest();
        cardRequest.setUserId(100L);
        cardRequest.setCardTitle("Executive Tech Card");
        cardRequest.setCompany("Nixtap Tech");
        cardRequest.setDesignation("CTO");
        cardRequest.setTheme("Professional Blue");
        cardRequest.setSlug("executive-tech-card");
        cardRequest.setPublic(true);

        cardResponse = BusinessCardResponse.builder()
                .id(1L)
                .userId(100L)
                .cardTitle("Executive Tech Card")
                .company("Nixtap Tech")
                .designation("CTO")
                .theme("Professional Blue")
                .slug("executive-tech-card")
                .isPublic(true)
                .build();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("Should successfully create a business card for the authenticated user")
    void createCard_Success() {
        when(cardRepository.existsBySlug("executive-tech-card")).thenReturn(false);
        when(cardMapper.toEntity(cardRequest)).thenReturn(card);
        when(cardRepository.save(any(BusinessCard.class))).thenReturn(card);
        when(cardMapper.toResponse(card)).thenReturn(cardResponse);

        BusinessCardResponse response = cardService.createCard(cardRequest);

        assertNotNull(response);
        assertEquals("executive-tech-card", response.getSlug());
        verify(cardRepository, times(1)).save(any(BusinessCard.class));
    }

    @Test
    @DisplayName("Should throw DuplicateSlugException when slug already exists")
    void createCard_ThrowsException_WhenSlugExists() {
        when(cardRepository.existsBySlug("executive-tech-card")).thenReturn(true);

        assertThrows(DuplicateSlugException.class, () -> cardService.createCard(cardRequest));
        verify(cardRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should retrieve public card by slug without authentication")
    void getPublicCardBySlug_Success() {
        when(cardRepository.findBySlug("executive-tech-card")).thenReturn(Optional.of(card));
        when(cardMapper.toResponse(card)).thenReturn(cardResponse);

        BusinessCardResponse response = cardService.getPublicCardBySlug("executive-tech-card");

        assertNotNull(response);
        assertTrue(response.isPublic());
    }

    @Test
    @DisplayName("Should throw CardAccessDeniedException when card is private")
    void getPublicCardBySlug_Denied_WhenPrivate() {
        card.setPublic(false);
        when(cardRepository.findBySlug("executive-tech-card")).thenReturn(Optional.of(card));

        assertThrows(CardAccessDeniedException.class,
                () -> cardService.getPublicCardBySlug("executive-tech-card"));
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when card ID does not exist")
    void getCardById_NotFound() {
        when(cardRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> cardService.getCardById(999L));
    }

    @Test
    @DisplayName("Should throw CardAccessDeniedException when caller does not own the card")
    void getCardById_Denied_WhenNotOwner() {
        // Authenticated as userId=999, card belongs to userId=100
        authenticateAs(999L);
        when(cardRepository.findById(1L)).thenReturn(Optional.of(card));

        assertThrows(CardAccessDeniedException.class, () -> cardService.getCardById(1L));
    }
}
