package com.nixtap.profileservice.service;

import com.nixtap.profileservice.dto.response.ContactDownloadResponse;
import com.nixtap.profileservice.dto.response.DownloadCountResponse;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;

public interface ContactService {
    /** Generate RFC 6350 vCard for a user — public, no auth. */
    String generateVCardForUser(Long userId, HttpServletRequest httpRequest);
    /** Generate RFC 6350 vCard scoped to a card — public, no auth. */
    String generateVCardForCard(Long cardId, Long userId, HttpServletRequest httpRequest);
    /** Download history — owner only. */
    List<ContactDownloadResponse> getDownloadHistory(Long userId);
    /** Total download count — owner only. */
    DownloadCountResponse getDownloadCount(Long userId);
}
