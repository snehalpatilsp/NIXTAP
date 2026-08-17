package com.nixtap.meetingservice.service;

import com.nixtap.meetingservice.dto.request.MeetingActionRequest;
import com.nixtap.meetingservice.dto.request.MeetingRequestDto;
import com.nixtap.meetingservice.dto.response.MeetingRequestResponse;
import com.nixtap.meetingservice.dto.response.MeetingStatsResponse;

import java.util.List;

public interface MeetingService {
    MeetingRequestResponse submitRequest(MeetingRequestDto request);
    List<MeetingRequestResponse> getRequestsByOwner(Long ownerId);
    List<MeetingRequestResponse> getPendingRequestsByOwner(Long ownerId);
    MeetingStatsResponse getStats(Long ownerId);
    MeetingRequestResponse getById(Long id);
    MeetingRequestResponse accept(Long id, MeetingActionRequest actionRequest);
    MeetingRequestResponse reject(Long id, MeetingActionRequest actionRequest);
    /** Cancel by numeric ID — owner only (JWT required). */
    MeetingRequestResponse cancel(Long id);
    /** Cancel by one-time token emailed to requester — no JWT required. */
    MeetingRequestResponse cancelByToken(String cancelToken);
    void deleteRequest(Long id);
}
