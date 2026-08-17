package com.nixtap.qrservice.exception;

public class QrGenerationException extends RuntimeException {

    public QrGenerationException(String message) {
        super(message);
    }

    public QrGenerationException(String message, Throwable cause) {
        super(message, cause);
    }
}
