package com.nixtap.contactservice.service;

import com.nixtap.contactservice.dto.response.ContactDownloadResponse;
import com.nixtap.contactservice.dto.response.DownloadCountResponse;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;

public interface ContactService {

    /**
     * Generates an RFC 6350 vCard string for the given user.
     * Calls profile-service and social-service via Feign.
     * Logs the download event to the contact_downloads table.
     *
     * @param userId  owner's userId
     * @param httpRequest used to extract IP and User-Agent for audit log
     * @return raw vCard string (UTF-8)
     */
    String generateVCardForUser(Long userId, HttpServletRequest httpRequest);

    /**
     * Generates an RFC 6350 vCard string scoped to a specific business card.
     * Pulls the same profile data but tags the download audit with the cardId.
     *
     * @param cardId  the business card ID
     * @param userId  the owner of that card (extracted from JWT or request param)
     * @param httpRequest for audit log
     * @return raw vCard string (UTF-8)
     */
    String generateVCardForCard(Long cardId, Long userId, HttpServletRequest httpRequest);

    /**
     * Returns download history for a user (authenticated owner only).
     */
    List<ContactDownloadResponse> getDownloadHistory(Long userId);

    /**
     * Returns total download count for a user (authenticated owner only).
     */
    DownloadCountResponse getDownloadCount(Long userId);
}
