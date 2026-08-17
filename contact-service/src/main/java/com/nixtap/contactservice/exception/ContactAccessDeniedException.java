package com.nixtap.contactservice.exception;

public class ContactAccessDeniedException extends RuntimeException {
    public ContactAccessDeniedException(String message) { super(message); }
}
