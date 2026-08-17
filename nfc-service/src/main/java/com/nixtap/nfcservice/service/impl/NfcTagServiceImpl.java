package com.nixtap.nfcservice.service.impl;

import com.nixtap.nfcservice.dto.request.NfcTagLinkRequest;
import com.nixtap.nfcservice.dto.request.NfcTagRegisterRequest;
import com.nixtap.nfcservice.dto.response.NfcTagResponse;
import com.nixtap.nfcservice.entity.NfcTag;
import com.nixtap.nfcservice.exception.DuplicateTagUidException;
import com.nixtap.nfcservice.exception.NfcAccessDeniedException;
import com.nixtap.nfcservice.exception.ResourceNotFoundException;
import com.nixtap.nfcservice.mapper.NfcTagMapper;
import com.nixtap.nfcservice.repository.NfcTagRepository;
import com.nixtap.nfcservice.security.AuthenticatedUser;
import com.nixtap.nfcservice.service.NfcTagService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service @RequiredArgsConstructor @SuppressWarnings("null")
public class NfcTagServiceImpl implements NfcTagService {

    private final NfcTagRepository repository;
    private final NfcTagMapper     mapper;

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
        return mapper.toResponse(repository.save(tag));
    }

    @Override @Transactional
    public NfcTagResponse linkToCard(Long tagId, NfcTagLinkRequest request) {
        NfcTag tag = repository.findById(tagId)
                .orElseThrow(() -> new ResourceNotFoundException("NFC tag not found: " + tagId));
        assertOwner(tag);
        tag.setCardId(request.getCardId());
        tag.setLinkedUrl(request.getLinkedUrl());
        return mapper.toResponse(repository.save(tag));
    }

    @Override @Transactional
    public NfcTagResponse unlinkFromCard(Long tagId) {
        NfcTag tag = repository.findById(tagId)
                .orElseThrow(() -> new ResourceNotFoundException("NFC tag not found: " + tagId));
        assertOwner(tag);
        tag.setCardId(null);
        tag.setLinkedUrl(null);
        return mapper.toResponse(repository.save(tag));
    }

    @Override @Transactional
    public NfcTagResponse deactivateTag(Long tagId, String status) {
        NfcTag tag = repository.findById(tagId)
                .orElseThrow(() -> new ResourceNotFoundException("NFC tag not found: " + tagId));
        assertOwner(tag);
        tag.setStatus(status);
        return mapper.toResponse(repository.save(tag));
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
        Long callerId = getAuthenticatedUserId();
        if (!userId.equals(callerId)) {
            throw new NfcAccessDeniedException("You can only view your own NFC tags.");
        }
        return repository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(mapper::toResponse).toList();
    }

    @Override @Transactional(readOnly = true)
    public NfcTagResponse getTagById(Long tagId) {
        NfcTag tag = repository.findById(tagId)
                .orElseThrow(() -> new ResourceNotFoundException("NFC tag not found: " + tagId));
        assertOwner(tag);
        return mapper.toResponse(tag);
    }

    @Override @Transactional(readOnly = true)
    public NfcTagResponse getTagByUid(String uid) {
        return mapper.toResponse(repository.findByTagUid(uid)
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
