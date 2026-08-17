package com.nixtap.nfcservice.controller;

import com.nixtap.nfcservice.dto.request.NfcTagLinkRequest;
import com.nixtap.nfcservice.dto.request.NfcTagRegisterRequest;
import com.nixtap.nfcservice.dto.response.ApiResponse;
import com.nixtap.nfcservice.dto.response.NfcTagResponse;
import com.nixtap.nfcservice.service.NfcTagService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/nfc")
@RequiredArgsConstructor
@Tag(name = "NFC Tag Management", description = "Register and manage NFC tags for NIXTAP business cards")
public class NfcTagController {

    private final NfcTagService service;

    @PostMapping("/tags/register")
    @Operation(summary = "Register a new physical NFC tag")
    public ResponseEntity<ApiResponse<NfcTagResponse>> register(@Valid @RequestBody NfcTagRegisterRequest request) {
        return new ResponseEntity<>(ApiResponse.success("NFC tag registered", service.registerTag(request)), HttpStatus.CREATED);
    }

    @PutMapping("/tags/{id}/link")
    @Operation(summary = "Link a registered NFC tag to a business card")
    public ResponseEntity<ApiResponse<NfcTagResponse>> link(@PathVariable Long id, @Valid @RequestBody NfcTagLinkRequest request) {
        return ResponseEntity.ok(ApiResponse.success("NFC tag linked to card", service.linkToCard(id, request)));
    }

    @PutMapping("/tags/{id}/unlink")
    @Operation(summary = "Unlink NFC tag from its current card")
    public ResponseEntity<ApiResponse<NfcTagResponse>> unlink(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("NFC tag unlinked", service.unlinkFromCard(id)));
    }

    @PutMapping("/tags/{id}/deactivate")
    @Operation(summary = "Deactivate or mark NFC tag as lost (status: INACTIVE or LOST)")
    public ResponseEntity<ApiResponse<NfcTagResponse>> deactivate(
            @PathVariable Long id, @RequestParam(defaultValue = "INACTIVE") String status) {
        return ResponseEntity.ok(ApiResponse.success("NFC tag deactivated", service.deactivateTag(id, status)));
    }

    @PostMapping("/tags/{id}/replace")
    @Operation(summary = "Replace a physical NFC tag — marks old tag as REPLACED and registers a new one")
    public ResponseEntity<ApiResponse<NfcTagResponse>> replace(
            @PathVariable Long id, @Valid @RequestBody NfcTagRegisterRequest newTagRequest) {
        return new ResponseEntity<>(ApiResponse.success("NFC tag replaced", service.replaceTag(id, newTagRequest)), HttpStatus.CREATED);
    }

    @GetMapping("/tags/user/{userId}")
    @Operation(summary = "Get all NFC tags for a user (owner only)")
    public ResponseEntity<ApiResponse<List<NfcTagResponse>>> getByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success("NFC tags retrieved", service.getTagsByUserId(userId)));
    }

    @GetMapping("/tags/{id}")
    @Operation(summary = "Get NFC tag by ID (owner only)")
    public ResponseEntity<ApiResponse<NfcTagResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("NFC tag retrieved", service.getTagById(id)));
    }

    @GetMapping("/tags/uid/{uid}")
    @Operation(summary = "Lookup NFC tag by hardware UID — public, used at tap time")
    public ResponseEntity<ApiResponse<NfcTagResponse>> getByUid(@PathVariable String uid) {
        return ResponseEntity.ok(ApiResponse.success("NFC tag retrieved", service.getTagByUid(uid)));
    }

    @DeleteMapping("/tags/{id}")
    @Operation(summary = "Delete NFC tag record (owner only)")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.deleteTag(id);
        return ResponseEntity.ok(ApiResponse.success("NFC tag deleted", null));
    }
}
