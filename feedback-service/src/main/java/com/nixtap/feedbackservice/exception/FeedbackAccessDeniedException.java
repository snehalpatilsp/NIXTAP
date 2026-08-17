package com.nixtap.feedbackservice.exception;

public class FeedbackAccessDeniedException extends RuntimeException {
    public FeedbackAccessDeniedException(String message) { super(message); }
}
