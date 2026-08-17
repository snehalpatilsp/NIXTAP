package com.nixtap.contactservice.controller;

import com.nixtap.contactservice.dto.response.ApiResponse;
import com.nixtap.contactservice.dto.response.ContactDownloadResponse;
import com.nixtap.contactservice.dto.response.DownloadCountResponse;
import com.nixtap.contactservice.service.ContactService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/v1/contacts")
@RequiredArgsConstructor
@Tag(name = "Contact Sharing", description = "vCard download and contact sharing for NIXTAP")
public class ContactController {

    private final ContactService service;

    @GetMapping(value = "/vcard/user/{userId}", produces = "text/vcard")
    @Operation(summary = "Download vCard for a user — public, no auth needed",
               description = "Returns an RFC 6350 compliant .vcf file built from the user's profile and social links.")
    public ResponseEntity<byte[]> getVCardByUserId(
            @PathVariable Long userId, HttpServletRequest request) {

        String vcard = service.generateVCardForUser(userId, request);
        byte[] bytes = vcard.getBytes(StandardCharsets.UTF_8);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/vcard; charset=utf-8"));
        headers.setContentLength(bytes.length);
        headers.set(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=\"contact-" + userId + ".vcf\"");
        return ResponseEntity.ok().headers(headers).body(bytes);
    }

    @GetMapping(value = "/vcard/card/{cardId}", produces = "text/vcard")
    @Operation(summary = "Download card-scoped vCard — public, no auth needed",
               description = "Returns a .vcf file scoped to the given business card.")
    public ResponseEntity<byte[]> getVCardByCardId(
            @PathVariable Long cardId,
            @RequestParam Long userId,
            HttpServletRequest request) {

        String vcard = service.generateVCardForCard(cardId, userId, request);
        byte[] bytes = vcard.getBytes(StandardCharsets.UTF_8);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/vcard; charset=utf-8"));
        headers.setContentLength(bytes.length);
        headers.set(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=\"contact-card-" + cardId + ".vcf\"");
        return ResponseEntity.ok().headers(headers).body(bytes);
    }

    @GetMapping("/downloads/user/{userId}")
    @Operation(summary = "Get vCard download history for a user (owner only)")
    public ResponseEntity<ApiResponse<List<ContactDownloadResponse>>> getHistory(
            @PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success("Download history retrieved",
                service.getDownloadHistory(userId)));
    }

    @GetMapping("/downloads/count/{userId}")
    @Operation(summary = "Get total vCard download count for a user (owner only)")
    public ResponseEntity<ApiResponse<DownloadCountResponse>> getCount(
            @PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success("Download count retrieved",
                service.getDownloadCount(userId)));
    }
}
