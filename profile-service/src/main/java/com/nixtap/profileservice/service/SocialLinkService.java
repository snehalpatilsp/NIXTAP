package com.nixtap.profileservice.service;

import com.nixtap.profileservice.dto.request.ReorderRequest;
import com.nixtap.profileservice.dto.request.SocialLinkRequest;
import com.nixtap.profileservice.dto.response.SocialLinkResponse;
import com.nixtap.profileservice.entity.SocialLink;

import java.util.List;

public interface SocialLinkService {
    SocialLinkResponse addLink(SocialLinkRequest request);
    List<SocialLinkResponse> getLinksByUserId(Long userId);
    List<SocialLinkResponse> getLinksByCardId(Long cardId);
    List<SocialLinkResponse> getPublicLinksByUserId(Long userId);
    List<SocialLinkResponse> getPublicLinksByCardId(Long cardId);
    SocialLinkResponse updateLink(Long id, SocialLinkRequest request);
    SocialLinkResponse toggleVisibility(Long id);
    void reorder(List<ReorderRequest> reorderRequests);
    void deleteLink(Long id);
    /** Used internally by VCard builder — no auth check needed. */
    List<SocialLink> getVisibleLinksForUser(Long userId);
}
