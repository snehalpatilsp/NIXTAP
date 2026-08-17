package com.nixtap.meetingservice.exception;

public class MeetingAccessDeniedException extends RuntimeException {
    public MeetingAccessDeniedException(String message) { super(message); }
}
