package com.nixtap.meetingservice.controller;

import com.nixtap.meetingservice.dto.request.MeetingActionRequest;
import com.nixtap.meetingservice.dto.request.MeetingRequestDto;
import com.nixtap.meetingservice.dto.response.ApiResponse;
import com.nixtap.meetingservice.dto.response.MeetingRequestResponse;
import com.nixtap.meetingservice.dto.response.MeetingStatsResponse;
import com.nixtap.meetingservice.service.MeetingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/meetings")
@RequiredArgsConstructor
@Tag(name = "Meeting Scheduler", description = "Meeting request APIs for NIXTAP business cards")
public class MeetingController {

    private final MeetingService service;

    @PostMapping("/request")
    @Operation(summary = "Submit a meeting request (public)")
    public ResponseEntity<ApiResponse<MeetingRequestResponse>> submit(
            @Valid @RequestBody MeetingRequestDto request) {
        return new ResponseEntity<>(ApiResponse.success("Meeting request submitted",
                service.submitRequest(request)), HttpStatus.CREATED);
    }

    @GetMapping("/owner/{ownerId}")
    @Operation(summary = "Get all meeting requests for owner (owner only)")
    public ResponseEntity<ApiResponse<List<MeetingRequestResponse>>> getByOwner(@PathVariable Long ownerId) {
        return ResponseEntity.ok(ApiResponse.success("Requests retrieved", service.getRequestsByOwner(ownerId)));
    }

    @GetMapping("/owner/{ownerId}/pending")
    @Operation(summary = "Get pending meeting requests for owner (owner only)")
    public ResponseEntity<ApiResponse<List<MeetingRequestResponse>>> getPending(@PathVariable Long ownerId) {
        return ResponseEntity.ok(ApiResponse.success("Pending requests retrieved",
                service.getPendingRequestsByOwner(ownerId)));
    }

    @GetMapping("/owner/{ownerId}/stats")
    @Operation(summary = "Get meeting request stats by status (owner only)")
    public ResponseEntity<ApiResponse<MeetingStatsResponse>> getStats(@PathVariable Long ownerId) {
        return ResponseEntity.ok(ApiResponse.success("Stats retrieved", service.getStats(ownerId)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a single meeting request by ID (owner only)")
    public ResponseEntity<ApiResponse<MeetingRequestResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Request retrieved", service.getById(id)));
    }

    @PutMapping("/{id}/accept")
    @Operation(summary = "Accept a meeting request with optional note (owner only)")
    public ResponseEntity<ApiResponse<MeetingRequestResponse>> accept(
            @PathVariable Long id, @Valid @RequestBody(required = false) MeetingActionRequest actionRequest) {
        return ResponseEntity.ok(ApiResponse.success("Meeting request accepted", service.accept(id, actionRequest)));
    }

    @PutMapping("/{id}/reject")
    @Operation(summary = "Reject a meeting request with optional note (owner only)")
    public ResponseEntity<ApiResponse<MeetingRequestResponse>> reject(
            @PathVariable Long id, @Valid @RequestBody(required = false) MeetingActionRequest actionRequest) {
        return ResponseEntity.ok(ApiResponse.success("Meeting request rejected", service.reject(id, actionRequest)));
    }

    @PutMapping("/{id}/cancel")
    @Operation(summary = "Cancel a meeting request by ID (owner only — JWT required)")
    public ResponseEntity<ApiResponse<MeetingRequestResponse>> cancel(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Meeting request cancelled", service.cancel(id)));
    }

    @PutMapping("/cancel-by-token")
    @Operation(summary = "Cancel a meeting request using a one-time token (public — sent to requester by email)",
               description = "The requester receives a cancelToken in the confirmation email. "
                           + "Pass that token here to cancel without a JWT.")
    public ResponseEntity<ApiResponse<MeetingRequestResponse>> cancelByToken(
            @RequestParam String token) {
        return ResponseEntity.ok(ApiResponse.success("Meeting request cancelled",
                service.cancelByToken(token)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a meeting request (owner only)")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.deleteRequest(id);
        return ResponseEntity.ok(ApiResponse.success("Meeting request deleted", null));
    }
}
