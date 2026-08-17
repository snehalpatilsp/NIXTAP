package com.nixtap.profileservice.service.impl;

import com.nixtap.profileservice.dto.response.ContactDownloadResponse;
import com.nixtap.profileservice.dto.response.DownloadCountResponse;
import com.nixtap.profileservice.entity.ContactDownload;
import com.nixtap.profileservice.entity.SocialLink;
import com.nixtap.profileservice.entity.UserProfile;
import com.nixtap.profileservice.exception.ResourceNotFoundException;
import com.nixtap.profileservice.repository.ContactDownloadRepository;
import com.nixtap.profileservice.repository.UserProfileRepository;
import com.nixtap.profileservice.security.AuthenticatedUser;
import com.nixtap.profileservice.service.ContactService;
import com.nixtap.profileservice.service.SocialLinkService;
import com.nixtap.profileservice.util.VCardBuilder;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class ContactServiceImpl implements ContactService {

    private final UserProfileRepository     profileRepository;
    private final SocialLinkService         socialLinkService;
    private final VCardBuilder              vCardBuilder;
    private final ContactDownloadRepository downloadRepository;

    private Long getAuthenticatedUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof AuthenticatedUser principal)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required.");
        }
        return principal.getUserId();
    }

    private void assertOwner(Long targetUserId) {
        if (!targetUserId.equals(getAuthenticatedUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You can only view your own contact download history.");
        }
    }

    @Override
    @Transactional
    public String generateVCardForUser(Long userId, HttpServletRequest httpRequest) {
        UserProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for userId: " + userId));

        // Direct in-process call — no Feign, no network hop
        List<SocialLink> links = socialLinkService.getVisibleLinksForUser(userId);

        String vcard = vCardBuilder.build(profile, links);
        logDownload(userId, null, httpRequest);
        return vcard;
    }

    @Override
    @Transactional
    public String generateVCardForCard(Long cardId, Long userId, HttpServletRequest httpRequest) {
        UserProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for userId: " + userId));
        List<SocialLink> links = socialLinkService.getVisibleLinksForUser(userId);
        String vcard = vCardBuilder.build(profile, links);
        logDownload(userId, cardId, httpRequest);
        return vcard;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ContactDownloadResponse> getDownloadHistory(Long userId) {
        assertOwner(userId);
        return downloadRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public DownloadCountResponse getDownloadCount(Long userId) {
        assertOwner(userId);
        return DownloadCountResponse.builder()
                .userId(userId)
                .totalDownloads(downloadRepository.countByUserId(userId))
                .build();
    }

    private void logDownload(Long userId, Long cardId, HttpServletRequest request) {
        downloadRepository.save(ContactDownload.builder()
                .userId(userId).cardId(cardId)
                .downloaderIp(resolveIp(request))
                .userAgent(request.getHeader("User-Agent"))
                .build());
    }

    private String resolveIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(forwarded)) return forwarded.split(",")[0].trim();
        String realIp = request.getHeader("X-Real-IP");
        if (StringUtils.hasText(realIp)) return realIp.trim();
        return request.getRemoteAddr();
    }

    private ContactDownloadResponse toResponse(ContactDownload dl) {
        return ContactDownloadResponse.builder()
                .id(dl.getId()).userId(dl.getUserId()).cardId(dl.getCardId())
                .downloaderIp(dl.getDownloaderIp()).userAgent(dl.getUserAgent())
                .createdAt(dl.getCreatedAt()).build();
    }
}
