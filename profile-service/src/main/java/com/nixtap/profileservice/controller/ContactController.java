package com.nixtap.profileservice.controller;

import com.nixtap.profileservice.dto.response.ApiResponse;
import com.nixtap.profileservice.dto.response.ContactDownloadResponse;
import com.nixtap.profileservice.dto.response.DownloadCountResponse;
import com.nixtap.profileservice.service.ContactService;
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
@Tag(name = "Contact Sharing (vCard)", description = "vCard generation — merged into profile-service")
public class ContactController {

    private final ContactService service;

    @GetMapping(value = "/vcard/user/{userId}", produces = "text/vcard")
    @Operation(summary = "Download vCard for a user (public)")
    public ResponseEntity<byte[]> getVCardByUser(
            @PathVariable Long userId, HttpServletRequest request) {
        byte[] bytes = service.generateVCardForUser(userId, request)
                .getBytes(StandardCharsets.UTF_8);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/vcard; charset=utf-8"));
        headers.setContentLength(bytes.length);
        headers.set(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=\"contact-" + userId + ".vcf\"");
        return ResponseEntity.ok().headers(headers).body(bytes);
    }

    @GetMapping(value = "/vcard/card/{cardId}", produces = "text/vcard")
    @Operation(summary = "Download card-scoped vCard (public)")
    public ResponseEntity<byte[]> getVCardByCard(
            @PathVariable Long cardId,
            @RequestParam Long userId,
            HttpServletRequest request) {
        byte[] bytes = service.generateVCardForCard(cardId, userId, request)
                .getBytes(StandardCharsets.UTF_8);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/vcard; charset=utf-8"));
        headers.setContentLength(bytes.length);
        headers.set(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=\"contact-card-" + cardId + ".vcf\"");
        return ResponseEntity.ok().headers(headers).body(bytes);
    }

    @GetMapping("/downloads/user/{userId}")
    @Operation(summary = "Download history for a user (owner only)")
    public ResponseEntity<ApiResponse<List<ContactDownloadResponse>>> getHistory(
            @PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success("Download history retrieved",
                service.getDownloadHistory(userId)));
    }

    @GetMapping("/downloads/count/{userId}")
    @Operation(summary = "Total download count (owner only)")
    public ResponseEntity<ApiResponse<DownloadCountResponse>> getCount(
            @PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success("Download count retrieved",
                service.getDownloadCount(userId)));
    }
}
