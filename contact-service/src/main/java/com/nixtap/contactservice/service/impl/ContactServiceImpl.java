package com.nixtap.contactservice.service.impl;

import com.nixtap.contactservice.client.ProfileClient;
import com.nixtap.contactservice.client.SocialClient;
import com.nixtap.contactservice.dto.feign.ProfileResponse;
import com.nixtap.contactservice.dto.feign.SocialLinkResponse;
import com.nixtap.contactservice.dto.response.ContactDownloadResponse;
import com.nixtap.contactservice.dto.response.DownloadCountResponse;
import com.nixtap.contactservice.entity.ContactDownload;
import com.nixtap.contactservice.exception.ContactAccessDeniedException;
import com.nixtap.contactservice.mapper.ContactDownloadMapper;
import com.nixtap.contactservice.repository.ContactDownloadRepository;
import com.nixtap.contactservice.security.AuthenticatedUser;
import com.nixtap.contactservice.service.ContactService;
import com.nixtap.contactservice.util.VCardBuilder;
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

import java.util.Collections;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class ContactServiceImpl implements ContactService {

    private final ProfileClient              profileClient;
    private final SocialClient               socialClient;
    private final VCardBuilder               vCardBuilder;
    private final ContactDownloadRepository  downloadRepository;
    private final ContactDownloadMapper      downloadMapper;

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

    private void assertOwner(Long targetUserId) {
        Long callerId = getAuthenticatedUserId();
        if (!targetUserId.equals(callerId)) {
            throw new ContactAccessDeniedException("You can only view your own contact download history.");
        }
    }

    // -----------------------------------------------------------------------
    // vCard generation (public — no auth required)
    // -----------------------------------------------------------------------

    @Override
    @Transactional
    public String generateVCardForUser(Long userId, HttpServletRequest httpRequest) {
        // Fetch profile via Feign — throws FeignException 404 if not found
        ProfileResponse profile = profileClient.getProfileByUserId(userId);

        // Fetch visible social links — gracefully degrade to empty list if social-service is down
        List<SocialLinkResponse> links = fetchSocialLinks(userId);

        // Build RFC 6350 vCard
        String vcard = vCardBuilder.build(profile, links);

        // Log download audit
        logDownload(userId, null, httpRequest);

        return vcard;
    }

    @Override
    @Transactional
    public String generateVCardForCard(Long cardId, Long userId, HttpServletRequest httpRequest) {
        ProfileResponse profile = profileClient.getProfileByUserId(userId);
        List<SocialLinkResponse> links = fetchSocialLinks(userId);
        String vcard = vCardBuilder.build(profile, links);
        logDownload(userId, cardId, httpRequest);
        return vcard;
    }

    // -----------------------------------------------------------------------
    // Download history (authenticated owner only)
    // -----------------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public List<ContactDownloadResponse> getDownloadHistory(Long userId) {
        assertOwner(userId);
        return downloadRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(downloadMapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public DownloadCountResponse getDownloadCount(Long userId) {
        assertOwner(userId);
        long count = downloadRepository.countByUserId(userId);
        return DownloadCountResponse.builder()
                .userId(userId).totalDownloads(count).build();
    }

    // -----------------------------------------------------------------------
    // Private helpers
    // -----------------------------------------------------------------------

    private List<SocialLinkResponse> fetchSocialLinks(Long userId) {
        try {
            return socialClient.getPublicLinksByUserId(userId);
        } catch (Exception e) {
            log.warn("social-service unavailable for userId={}, vCard will omit social links: {}",
                    userId, e.getMessage());
            return Collections.emptyList();
        }
    }

    private void logDownload(Long userId, Long cardId, HttpServletRequest request) {
        ContactDownload log = ContactDownload.builder()
                .userId(userId)
                .cardId(cardId)
                .downloaderIp(resolveIp(request))
                .userAgent(request.getHeader("User-Agent"))
                .build();
        downloadRepository.save(log);
    }

    private String resolveIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(forwarded)) return forwarded.split(",")[0].trim();
        String realIp = request.getHeader("X-Real-IP");
        if (StringUtils.hasText(realIp)) return realIp.trim();
        return request.getRemoteAddr();
    }
}
