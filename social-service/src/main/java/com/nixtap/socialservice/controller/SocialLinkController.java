package com.nixtap.socialservice.controller;

import com.nixtap.socialservice.dto.request.ReorderRequest;
import com.nixtap.socialservice.dto.request.SocialLinkRequest;
import com.nixtap.socialservice.dto.response.ApiResponse;
import com.nixtap.socialservice.dto.response.SocialLinkResponse;
import com.nixtap.socialservice.service.SocialLinkService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/social")
@RequiredArgsConstructor
@Tag(name = "Social Links", description = "Manage social media profile links for NIXTAP business cards")
public class SocialLinkController {

    private final SocialLinkService service;

    @PostMapping("/links")
    @Operation(summary = "Add a new social media link")
    public ResponseEntity<ApiResponse<SocialLinkResponse>> addLink(@Valid @RequestBody SocialLinkRequest request) {
        return new ResponseEntity<>(ApiResponse.success("Social link added", service.addLink(request)), HttpStatus.CREATED);
    }

    @GetMapping("/links/user/{userId}")
    @Operation(summary = "Get all social links for a user (authenticated, owner only)")
    public ResponseEntity<ApiResponse<List<SocialLinkResponse>>> getLinksByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success("Links retrieved", service.getLinksByUserId(userId)));
    }

    @GetMapping("/links/card/{cardId}")
    @Operation(summary = "Get all social links for a card (authenticated, owner only)")
    public ResponseEntity<ApiResponse<List<SocialLinkResponse>>> getLinksByCardId(@PathVariable Long cardId) {
        return ResponseEntity.ok(ApiResponse.success("Card links retrieved", service.getLinksByCardId(cardId)));
    }

    @GetMapping("/links/public/user/{userId}")
    @Operation(summary = "Get visible social links for a user (public)")
    public ResponseEntity<ApiResponse<List<SocialLinkResponse>>> getPublicLinksByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success("Public links retrieved", service.getPublicLinksByUserId(userId)));
    }

    @GetMapping("/links/public/card/{cardId}")
    @Operation(summary = "Get visible social links for a card (public)")
    public ResponseEntity<ApiResponse<List<SocialLinkResponse>>> getPublicLinksByCardId(@PathVariable Long cardId) {
        return ResponseEntity.ok(ApiResponse.success("Public card links retrieved", service.getPublicLinksByCardId(cardId)));
    }

    @PutMapping("/links/{id}")
    @Operation(summary = "Update a social link (owner only)")
    public ResponseEntity<ApiResponse<SocialLinkResponse>> updateLink(@PathVariable Long id, @Valid @RequestBody SocialLinkRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Social link updated", service.updateLink(id, request)));
    }

    @PutMapping("/links/{id}/visibility")
    @Operation(summary = "Toggle visibility of a social link (owner only)")
    public ResponseEntity<ApiResponse<SocialLinkResponse>> toggleVisibility(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Visibility toggled", service.toggleVisibility(id)));
    }

    @PutMapping("/links/reorder")
    @Operation(summary = "Batch update sort order for social links (owner only)")
    public ResponseEntity<ApiResponse<Void>> reorder(@Valid @RequestBody List<ReorderRequest> requests) {
        service.reorder(requests);
        return ResponseEntity.ok(ApiResponse.success("Links reordered", null));
    }

    @DeleteMapping("/links/{id}")
    @Operation(summary = "Delete a social link (owner only)")
    public ResponseEntity<ApiResponse<Void>> deleteLink(@PathVariable Long id) {
        service.deleteLink(id);
        return ResponseEntity.ok(ApiResponse.success("Social link deleted", null));
    }
}
