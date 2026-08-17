package com.nixtap.meetingservice.mapper;

import com.nixtap.meetingservice.dto.response.MeetingRequestResponse;
import com.nixtap.meetingservice.entity.MeetingRequest;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface MeetingMapper {
    MeetingRequestResponse toResponse(MeetingRequest entity);
}
