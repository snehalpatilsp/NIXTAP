package com.nixtap.profileservice.exception;

public class SocialAccessDeniedException extends RuntimeException {
    public SocialAccessDeniedException(String message) { super(message); }
}
