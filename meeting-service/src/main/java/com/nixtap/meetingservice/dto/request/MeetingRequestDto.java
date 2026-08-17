package com.nixtap.meetingservice.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

@Data
public class MeetingRequestDto {

    @NotNull(message = "ownerId is required")
    private Long ownerId;

    @NotNull(message = "cardId is required")
    private Long cardId;

    @NotBlank(message = "requesterName is required")
    @Size(max = 100, message = "requesterName cannot exceed 100 characters")
    private String requesterName;

    @NotBlank(message = "requesterEmail is required")
    @Email(message = "requesterEmail must be a valid email address")
    @Size(max = 100)
    private String requesterEmail;

    @Size(max = 20, message = "requesterPhone cannot exceed 20 characters")
    private String requesterPhone;

    @NotBlank(message = "purpose is required")
    @Size(max = 200, message = "purpose cannot exceed 200 characters")
    private String purpose;

    @NotNull(message = "preferredDate is required")
    @Future(message = "preferredDate must be in the future")
    private LocalDate preferredDate;

    @Size(max = 20, message = "preferredTime cannot exceed 20 characters")
    private String preferredTime;

    @Size(max = 2000, message = "message cannot exceed 2000 characters")
    private String message;
}
