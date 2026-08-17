package com.nixtap.socialservice.service.impl;

import com.nixtap.socialservice.dto.request.ReorderRequest;
import com.nixtap.socialservice.dto.request.SocialLinkRequest;
import com.nixtap.socialservice.dto.response.SocialLinkResponse;
import com.nixtap.socialservice.entity.SocialLink;
import com.nixtap.socialservice.exception.ResourceNotFoundException;
import com.nixtap.socialservice.exception.SocialAccessDeniedException;
import com.nixtap.socialservice.mapper.SocialLinkMapper;
import com.nixtap.socialservice.repository.SocialLinkRepository;
import com.nixtap.socialservice.security.AuthenticatedUser;
import com.nixtap.socialservice.service.SocialLinkService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class SocialLinkServiceImpl implements SocialLinkService {

    private final SocialLinkRepository repository;
    private final SocialLinkMapper     mapper;

    private Long getAuthenticatedUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof AuthenticatedUser principal)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required.");
        }
        return principal.getUserId();
    }

    private void assertOwner(SocialLink link) {
        Long callerId = getAuthenticatedUserId();
        if (!link.getUserId().equals(callerId)) {
            throw new SocialAccessDeniedException("You do not have permission to modify this social link.");
        }
    }

    @Override
    @Transactional
    public SocialLinkResponse addLink(SocialLinkRequest request) {
        Long callerId = getAuthenticatedUserId();
        if (!request.getUserId().equals(callerId)) {
            throw new SocialAccessDeniedException("You can only add social links for your own account.");
        }
        SocialLink link = SocialLink.builder()
                .userId(request.getUserId())
                .cardId(request.getCardId())
                .platform(request.getPlatform())
                .url(request.getUrl())
                .displayLabel(request.getDisplayLabel())
                .iconClass(request.getIconClass())
                .isVisible(request.getIsVisible() != null ? request.getIsVisible() : true)
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
                .build();
        return mapper.toResponse(repository.save(link));
    }

    @Override
    @Transactional(readOnly = true)
    public List<SocialLinkResponse> getLinksByUserId(Long userId) {
        Long callerId = getAuthenticatedUserId();
        if (!userId.equals(callerId)) {
            throw new SocialAccessDeniedException("You can only view your own social links.");
        }
        return repository.findByUserIdOrderBySortOrderAsc(userId).stream().map(mapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SocialLinkResponse> getLinksByCardId(Long cardId) {
        List<SocialLink> links = repository.findByCardIdOrderBySortOrderAsc(cardId);
        if (!links.isEmpty()) {
            assertOwner(links.get(0));
        }
        return links.stream().map(mapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SocialLinkResponse> getPublicLinksByUserId(Long userId) {
        return repository.findByUserIdAndIsVisibleTrueOrderBySortOrderAsc(userId).stream().map(mapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SocialLinkResponse> getPublicLinksByCardId(Long cardId) {
        return repository.findByCardIdAndIsVisibleTrueOrderBySortOrderAsc(cardId).stream().map(mapper::toResponse).toList();
    }

    @Override
    @Transactional
    public SocialLinkResponse updateLink(Long id, SocialLinkRequest request) {
        SocialLink link = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Social link not found: " + id));
        assertOwner(link);
        link.setPlatform(request.getPlatform());
        link.setUrl(request.getUrl());
        link.setDisplayLabel(request.getDisplayLabel());
        link.setIconClass(request.getIconClass());
        if (request.getIsVisible() != null) link.setVisible(request.getIsVisible());
        if (request.getSortOrder() != null) link.setSortOrder(request.getSortOrder());
        return mapper.toResponse(repository.save(link));
    }

    @Override
    @Transactional
    public SocialLinkResponse toggleVisibility(Long id) {
        SocialLink link = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Social link not found: " + id));
        assertOwner(link);
        link.setVisible(!link.isVisible());
        return mapper.toResponse(repository.save(link));
    }

    @Override
    @Transactional
    public void reorder(List<ReorderRequest> reorderRequests) {
        Long callerId = getAuthenticatedUserId();
        for (ReorderRequest req : reorderRequests) {
            SocialLink link = repository.findById(req.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Social link not found: " + req.getId()));
            if (!link.getUserId().equals(callerId)) {
                throw new SocialAccessDeniedException("You can only reorder your own social links.");
            }
            link.setSortOrder(req.getSortOrder());
            repository.save(link);
        }
    }

    @Override
    @Transactional
    public void deleteLink(Long id) {
        SocialLink link = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Social link not found: " + id));
        assertOwner(link);
        repository.delete(link);
    }
}
