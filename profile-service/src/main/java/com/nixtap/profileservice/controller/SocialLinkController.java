package com.nixtap.profileservice.controller;

import com.nixtap.profileservice.dto.request.ReorderRequest;
import com.nixtap.profileservice.dto.request.SocialLinkRequest;
import com.nixtap.profileservice.dto.response.ApiResponse;
import com.nixtap.profileservice.dto.response.SocialLinkResponse;
import com.nixtap.profileservice.service.SocialLinkService;
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
@Tag(name = "Social Links", description = "Manage social media links — merged into profile-service")
public class SocialLinkController {

    private final SocialLinkService service;

    @PostMapping("/links")
    @Operation(summary = "Add a social link")
    public ResponseEntity<ApiResponse<SocialLinkResponse>> add(@Valid @RequestBody SocialLinkRequest req) {
        return new ResponseEntity<>(ApiResponse.success("Social link added", service.addLink(req)), HttpStatus.CREATED);
    }

    @GetMapping("/links/user/{userId}")
    @Operation(summary = "All links for a user (owner only)")
    public ResponseEntity<ApiResponse<List<SocialLinkResponse>>> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success("Links retrieved", service.getLinksByUserId(userId)));
    }

    @GetMapping("/links/card/{cardId}")
    @Operation(summary = "All links for a card (owner only)")
    public ResponseEntity<ApiResponse<List<SocialLinkResponse>>> getByCard(@PathVariable Long cardId) {
        return ResponseEntity.ok(ApiResponse.success("Card links retrieved", service.getLinksByCardId(cardId)));
    }

    @GetMapping("/links/public/user/{userId}")
    @Operation(summary = "Visible links for a user (public)")
    public ResponseEntity<ApiResponse<List<SocialLinkResponse>>> getPublicByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success("Public links retrieved", service.getPublicLinksByUserId(userId)));
    }

    @GetMapping("/links/public/card/{cardId}")
    @Operation(summary = "Visible links for a card (public)")
    public ResponseEntity<ApiResponse<List<SocialLinkResponse>>> getPublicByCard(@PathVariable Long cardId) {
        return ResponseEntity.ok(ApiResponse.success("Public card links retrieved", service.getPublicLinksByCardId(cardId)));
    }

    @PutMapping("/links/{id}")
    @Operation(summary = "Update a social link (owner only)")
    public ResponseEntity<ApiResponse<SocialLinkResponse>> update(
            @PathVariable Long id, @Valid @RequestBody SocialLinkRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Social link updated", service.updateLink(id, req)));
    }

    @PutMapping("/links/{id}/visibility")
    @Operation(summary = "Toggle visibility (owner only)")
    public ResponseEntity<ApiResponse<SocialLinkResponse>> toggle(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Visibility toggled", service.toggleVisibility(id)));
    }

    @PutMapping("/links/reorder")
    @Operation(summary = "Batch reorder links (owner only)")
    public ResponseEntity<ApiResponse<Void>> reorder(@Valid @RequestBody List<ReorderRequest> requests) {
        service.reorder(requests);
        return ResponseEntity.ok(ApiResponse.success("Links reordered", null));
    }

    @DeleteMapping("/links/{id}")
    @Operation(summary = "Delete a social link (owner only)")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.deleteLink(id);
        return ResponseEntity.ok(ApiResponse.success("Social link deleted", null));
    }
}
