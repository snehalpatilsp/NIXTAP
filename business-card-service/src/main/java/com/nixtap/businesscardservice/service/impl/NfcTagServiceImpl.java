package com.nixtap.businesscardservice.service.impl;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.nixtap.businesscardservice.dto.request.NfcTagLinkRequest;
import com.nixtap.businesscardservice.dto.request.NfcTagRegisterRequest;
import com.nixtap.businesscardservice.dto.response.NfcTagResponse;
import com.nixtap.businesscardservice.entity.NfcTag;
import com.nixtap.businesscardservice.exception.DuplicateTagUidException;
import com.nixtap.businesscardservice.exception.NfcAccessDeniedException;
import com.nixtap.businesscardservice.exception.ResourceNotFoundException;
import com.nixtap.businesscardservice.repository.NfcTagRepository;
import com.nixtap.businesscardservice.security.AuthenticatedUser;
import com.nixtap.businesscardservice.service.NfcTagService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class NfcTagServiceImpl implements NfcTagService {

    private final NfcTagRepository repository;

    // -----------------------------------------------------------------------
    // Security helpers
    // -----------------------------------------------------------------------

    private Long getAuthenticatedUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof AuthenticatedUser principal)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required.");
        }
        return principal.getUserId();
    }

    private void assertOwner(NfcTag tag) {
        if (!tag.getUserId().equals(getAuthenticatedUserId())) {
            throw new NfcAccessDeniedException("You do not have permission to manage this NFC tag.");
        }
    }

    // -----------------------------------------------------------------------
    // Helper: entity → response
    // -----------------------------------------------------------------------

    private NfcTagResponse toResponse(NfcTag tag) {
        return NfcTagResponse.builder()
                .id(tag.getId()).userId(tag.getUserId()).cardId(tag.getCardId())
                .tagUid(tag.getTagUid()).tagType(tag.getTagType()).status(tag.getStatus())
                .linkedUrl(tag.getLinkedUrl()).notes(tag.getNotes())
                .createdAt(tag.getCreatedAt()).updatedAt(tag.getUpdatedAt())
                .build();
    }

    // -----------------------------------------------------------------------
    // CRUD
    // -----------------------------------------------------------------------

    @Override @Transactional
    public NfcTagResponse registerTag(NfcTagRegisterRequest request) {
        Long callerId = getAuthenticatedUserId();
        if (!request.getUserId().equals(callerId)) {
            throw new NfcAccessDeniedException("You can only register NFC tags for your own account.");
        }
        if (repository.existsByTagUid(request.getTagUid())) {
            throw new DuplicateTagUidException("NFC tag UID already registered: " + request.getTagUid());
        }
        NfcTag tag = NfcTag.builder()
                .userId(request.getUserId())
                .tagUid(request.getTagUid())
                .tagType(request.getTagType() != null ? request.getTagType() : "UNKNOWN")
                .notes(request.getNotes())
                .build();
        return toResponse(repository.save(tag));
    }

    @Override @Transactional
    public NfcTagResponse linkToCard(Long tagId, NfcTagLinkRequest request) {
        NfcTag tag = repository.findById(tagId)
                .orElseThrow(() -> new ResourceNotFoundException("NFC tag not found: " + tagId));
        assertOwner(tag);
        tag.setCardId(request.getCardId());
        tag.setLinkedUrl(request.getLinkedUrl());
        return toResponse(repository.save(tag));
    }

    @Override @Transactional
    public NfcTagResponse unlinkFromCard(Long tagId) {
        NfcTag tag = repository.findById(tagId)
                .orElseThrow(() -> new ResourceNotFoundException("NFC tag not found: " + tagId));
        assertOwner(tag);
        tag.setCardId(null);
        tag.setLinkedUrl(null);
        return toResponse(repository.save(tag));
    }

    @Override @Transactional
    public NfcTagResponse deactivateTag(Long tagId, String status) {
        NfcTag tag = repository.findById(tagId)
                .orElseThrow(() -> new ResourceNotFoundException("NFC tag not found: " + tagId));
        assertOwner(tag);
        tag.setStatus(status);
        return toResponse(repository.save(tag));
    }

    @Override @Transactional
    public NfcTagResponse replaceTag(Long oldTagId, NfcTagRegisterRequest newRequest) {
        NfcTag oldTag = repository.findById(oldTagId)
                .orElseThrow(() -> new ResourceNotFoundException("NFC tag not found: " + oldTagId));
        assertOwner(oldTag);
        oldTag.setStatus("REPLACED");
        repository.save(oldTag);
        return registerTag(newRequest);
    }

    @Override @Transactional(readOnly = true)
    public List<NfcTagResponse> getTagsByUserId(Long userId) {
        if (!userId.equals(getAuthenticatedUserId())) {
            throw new NfcAccessDeniedException("You can only view your own NFC tags.");
        }
        return repository.findByUserIdOrderByCreatedAtDesc(userId).stream().map(this::toResponse).toList();
    }

    @Override @Transactional(readOnly = true)
    public NfcTagResponse getTagById(Long tagId) {
        NfcTag tag = repository.findById(tagId)
                .orElseThrow(() -> new ResourceNotFoundException("NFC tag not found: " + tagId));
        assertOwner(tag);
        return toResponse(tag);
    }

    @Override @Transactional(readOnly = true)
    public NfcTagResponse getTagByUid(String uid) {
        return toResponse(repository.findByTagUid(uid)
                .orElseThrow(() -> new ResourceNotFoundException("NFC tag not found for UID: " + uid)));
    }

    @Override @Transactional
    public void deleteTag(Long tagId) {
        NfcTag tag = repository.findById(tagId)
                .orElseThrow(() -> new ResourceNotFoundException("NFC tag not found: " + tagId));
        assertOwner(tag);
        repository.delete(tag);
    }
}
