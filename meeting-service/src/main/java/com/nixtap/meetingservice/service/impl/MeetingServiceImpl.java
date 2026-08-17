package com.nixtap.meetingservice.service.impl;

import com.nixtap.meetingservice.dto.request.MeetingActionRequest;
import com.nixtap.meetingservice.dto.request.MeetingRequestDto;
import com.nixtap.meetingservice.dto.response.MeetingRequestResponse;
import com.nixtap.meetingservice.dto.response.MeetingStatsResponse;
import com.nixtap.meetingservice.entity.MeetingRequest;
import com.nixtap.meetingservice.exception.MeetingAccessDeniedException;
import com.nixtap.meetingservice.exception.ResourceNotFoundException;
import com.nixtap.meetingservice.mapper.MeetingMapper;
import com.nixtap.meetingservice.repository.MeetingRepository;
import com.nixtap.meetingservice.security.AuthenticatedUser;
import com.nixtap.meetingservice.service.MeetingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service @RequiredArgsConstructor @SuppressWarnings("null")
public class MeetingServiceImpl implements MeetingService {

    private final MeetingRepository repository;
    private final MeetingMapper     mapper;

    private Long getAuthenticatedUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof AuthenticatedUser principal)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required.");
        }
        return principal.getUserId();
    }

    private void assertOwner(MeetingRequest req) {
        if (!req.getOwnerId().equals(getAuthenticatedUserId())) {
            throw new MeetingAccessDeniedException("You do not have permission to manage this meeting request.");
        }
    }

    @Override @Transactional
    public MeetingRequestResponse submitRequest(MeetingRequestDto request) {
        MeetingRequest entity = MeetingRequest.builder()
                .ownerId(request.getOwnerId()).cardId(request.getCardId())
                .requesterName(request.getRequesterName()).requesterEmail(request.getRequesterEmail())
                .requesterPhone(request.getRequesterPhone()).purpose(request.getPurpose())
                .preferredDate(request.getPreferredDate()).preferredTime(request.getPreferredTime())
                .message(request.getMessage())
                // Generate a unique cancel token so the requester can cancel without a JWT
                .cancelToken(java.util.UUID.randomUUID().toString())
                .build();
        return mapper.toResponse(repository.save(entity));
    }

    @Override @Transactional(readOnly = true)
    public List<MeetingRequestResponse> getRequestsByOwner(Long ownerId) {
        if (!ownerId.equals(getAuthenticatedUserId()))
            throw new MeetingAccessDeniedException("You can only view your own meeting requests.");
        return repository.findByOwnerIdOrderByCreatedAtDesc(ownerId).stream().map(mapper::toResponse).toList();
    }

    @Override @Transactional(readOnly = true)
    public List<MeetingRequestResponse> getPendingRequestsByOwner(Long ownerId) {
        if (!ownerId.equals(getAuthenticatedUserId()))
            throw new MeetingAccessDeniedException("You can only view your own meeting requests.");
        return repository.findByOwnerIdAndStatusOrderByCreatedAtDesc(ownerId, "PENDING")
                .stream().map(mapper::toResponse).toList();
    }

    @Override @Transactional(readOnly = true)
    public MeetingStatsResponse getStats(Long ownerId) {
        if (!ownerId.equals(getAuthenticatedUserId()))
            throw new MeetingAccessDeniedException("You can only view your own stats.");
        return MeetingStatsResponse.builder().ownerId(ownerId)
                .totalRequests(repository.countByOwnerId(ownerId))
                .pendingRequests(repository.countByOwnerIdAndStatus(ownerId, "PENDING"))
                .acceptedRequests(repository.countByOwnerIdAndStatus(ownerId, "ACCEPTED"))
                .rejectedRequests(repository.countByOwnerIdAndStatus(ownerId, "REJECTED"))
                .cancelledRequests(repository.countByOwnerIdAndStatus(ownerId, "CANCELLED"))
                .build();
    }

    @Override @Transactional(readOnly = true)
    public MeetingRequestResponse getById(Long id) {
        MeetingRequest req = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Meeting request not found: " + id));
        assertOwner(req);
        return mapper.toResponse(req);
    }

    @Override @Transactional
    public MeetingRequestResponse accept(Long id, MeetingActionRequest actionRequest) {
        MeetingRequest req = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Meeting request not found: " + id));
        assertOwner(req);
        req.setStatus("ACCEPTED");
        if (actionRequest != null && actionRequest.getNote() != null) req.setOwnerNote(actionRequest.getNote());
        return mapper.toResponse(repository.save(req));
    }

    @Override @Transactional
    public MeetingRequestResponse reject(Long id, MeetingActionRequest actionRequest) {
        MeetingRequest req = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Meeting request not found: " + id));
        assertOwner(req);
        req.setStatus("REJECTED");
        if (actionRequest != null && actionRequest.getNote() != null) req.setOwnerNote(actionRequest.getNote());
        return mapper.toResponse(repository.save(req));
    }

    @Override @Transactional
    public MeetingRequestResponse cancel(Long id) {
        MeetingRequest req = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Meeting request not found: " + id));
        assertOwner(req);   // owner must be authenticated to cancel by ID
        req.setStatus("CANCELLED");
        return mapper.toResponse(repository.save(req));
    }

    /** Cancel using the unique token emailed to the requester — no JWT needed. */
    @Override @Transactional
    public MeetingRequestResponse cancelByToken(String cancelToken) {
        MeetingRequest req = repository.findByCancelToken(cancelToken)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid or expired cancellation token."));
        if ("CANCELLED".equals(req.getStatus())) {
            throw new MeetingAccessDeniedException("This meeting request has already been cancelled.");
        }
        req.setStatus("CANCELLED");
        return mapper.toResponse(repository.save(req));
    }

    @Override @Transactional
    public void deleteRequest(Long id) {
        MeetingRequest req = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Meeting request not found: " + id));
        assertOwner(req);
        repository.delete(req);
    }
}
