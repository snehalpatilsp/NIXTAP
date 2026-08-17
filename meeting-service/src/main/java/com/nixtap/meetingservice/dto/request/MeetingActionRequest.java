package com.nixtap.meetingservice.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class MeetingActionRequest {

    @Size(max = 500, message = "note cannot exceed 500 characters")
    private String note;
}
