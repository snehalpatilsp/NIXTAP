package com.nixtap.socialservice.service;

import com.nixtap.socialservice.dto.request.ReorderRequest;
import com.nixtap.socialservice.dto.request.SocialLinkRequest;
import com.nixtap.socialservice.dto.response.SocialLinkResponse;

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
}
