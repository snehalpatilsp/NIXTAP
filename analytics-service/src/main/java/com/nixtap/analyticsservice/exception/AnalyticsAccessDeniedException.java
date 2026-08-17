package com.nixtap.analyticsservice.exception;

public class AnalyticsAccessDeniedException extends RuntimeException {

    public AnalyticsAccessDeniedException(String message) {
        super(message);
    }
}
