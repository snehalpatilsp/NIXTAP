package com.nixtap.businesscardservice.controller;

import com.nixtap.businesscardservice.dto.request.BusinessCardRequest;
import com.nixtap.businesscardservice.dto.response.ApiResponse;
import com.nixtap.businesscardservice.dto.response.BusinessCardResponse;
import com.nixtap.businesscardservice.service.BusinessCardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/cards")
@RequiredArgsConstructor
@Tag(name = "Business Card Management", description = "CRUD and Access APIs for NFC Virtual Business Cards")
public class BusinessCardController {

    private final BusinessCardService cardService;

    @PostMapping
    @Operation(summary = "Create a new Virtual Business Card")
    public ResponseEntity<ApiResponse<BusinessCardResponse>> createCard(@Valid @RequestBody BusinessCardRequest request) {
        BusinessCardResponse response = cardService.createCard(request);
        return new ResponseEntity<>(ApiResponse.success("Business card created successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Business Card by ID")
    public ResponseEntity<ApiResponse<BusinessCardResponse>> getCardById(@PathVariable Long id) {
        BusinessCardResponse response = cardService.getCardById(id);
        return ResponseEntity.ok(ApiResponse.success("Card retrieved successfully", response));
    }

    @GetMapping("/slug/{slug}")
    @Operation(summary = "Get Business Card by Slug")
    public ResponseEntity<ApiResponse<BusinessCardResponse>> getCardBySlug(@PathVariable String slug) {
        BusinessCardResponse response = cardService.getCardBySlug(slug);
        return ResponseEntity.ok(ApiResponse.success("Card retrieved successfully", response));
    }

    @GetMapping("/public/slug/{slug}")
    @Operation(summary = "Public endpoint to view Business Card by Slug (NFC/QR Tap)")
    public ResponseEntity<ApiResponse<BusinessCardResponse>> getPublicCardBySlug(@PathVariable String slug) {
        BusinessCardResponse response = cardService.getPublicCardBySlug(slug);
        return ResponseEntity.ok(ApiResponse.success("Public card retrieved successfully", response));
    }

    @GetMapping("/user/me")
    @Operation(summary = "Get all Business Cards owned by the current authenticated User")
    public ResponseEntity<ApiResponse<List<BusinessCardResponse>>> getMyCards() {
        List<BusinessCardResponse> response = cardService.getMyCards();
        return ResponseEntity.ok(ApiResponse.success("User cards retrieved successfully", response));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get all Business Cards owned by a User")
    public ResponseEntity<ApiResponse<List<BusinessCardResponse>>> getCardsByUserId(@PathVariable Long userId) {
        List<BusinessCardResponse> response = cardService.getCardsByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success("User cards retrieved successfully", response));
    }

    @GetMapping("/public/user/{userId}")
    @Operation(summary = "Public endpoint to get all Business Cards owned by a User")
    public ResponseEntity<ApiResponse<List<BusinessCardResponse>>> getPublicCardsByUserId(@PathVariable Long userId) {
        List<BusinessCardResponse> response = cardService.getCardsByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success("Public user cards retrieved successfully", response));
    }

    @GetMapping("/user/{userId}/page")
    @Operation(summary = "Get paginated Business Cards owned by a User")
    public ResponseEntity<ApiResponse<Page<BusinessCardResponse>>> getCardsByUserIdPaginated(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<BusinessCardResponse> response = cardService.getCardsByUserId(userId, pageable);

        return ResponseEntity.ok(ApiResponse.success("Paginated user cards retrieved successfully", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing Business Card")
    public ResponseEntity<ApiResponse<BusinessCardResponse>> updateCard(
            @PathVariable Long id,
            @Valid @RequestBody BusinessCardRequest request) {

        BusinessCardResponse response = cardService.updateCard(id, request);
        return ResponseEntity.ok(ApiResponse.success("Business card updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a Business Card")
    public ResponseEntity<ApiResponse<Void>> deleteCard(@PathVariable Long id) {
        cardService.deleteCard(id);
        return ResponseEntity.ok(ApiResponse.success("Business card deleted successfully", null));
    }

    @GetMapping("/check-slug")
    @Operation(summary = "Check availability of a Card Slug")
    public ResponseEntity<ApiResponse<Boolean>> checkSlugAvailability(@RequestParam String slug) {
        boolean available = cardService.isSlugAvailable(slug);
        return ResponseEntity.ok(ApiResponse.success("Slug availability checked", available));
    }
}