package com.nixtap.qrservice.exception;

public class QrAccessDeniedException extends RuntimeException {

    public QrAccessDeniedException(String message) {
        super(message);
    }
}
