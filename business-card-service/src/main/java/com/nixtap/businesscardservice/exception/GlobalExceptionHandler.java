package com.nixtap.businesscardservice.exception;

import com.nixtap.businesscardservice.dto.response.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(org.springframework.web.server.ResponseStatusException.class)
    public ResponseEntity<ErrorResponse> handleResponseStatus(
            org.springframework.web.server.ResponseStatusException ex, HttpServletRequest request) {
        HttpStatus status = HttpStatus.valueOf(ex.getStatusCode().value());
        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(status.value())
                .message(ex.getReason() != null ? ex.getReason() : ex.getMessage())
                .path(request.getServletPath())
                .errorCode(status.name())
                .build();
        return new ResponseEntity<>(error, status);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex, HttpServletRequest request) {
        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.NOT_FOUND.value())
                .message(ex.getMessage())
                .path(request.getServletPath())
                .errorCode("CARD_NOT_FOUND")
                .build();
        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(DuplicateSlugException.class)
    public ResponseEntity<ErrorResponse> handleDuplicateSlug(DuplicateSlugException ex, HttpServletRequest request) {
        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.CONFLICT.value())
                .message(ex.getMessage())
                .path(request.getServletPath())
                .errorCode("DUPLICATE_SLUG")
                .build();
        return new ResponseEntity<>(error, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(CardAccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(CardAccessDeniedException ex, HttpServletRequest request) {
        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.FORBIDDEN.value())
                .message(ex.getMessage())
                .path(request.getServletPath())
                .errorCode("CARD_ACCESS_DENIED")
                .build();
        return new ResponseEntity<>(error, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(NfcAccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleNfcAccessDenied(NfcAccessDeniedException ex, HttpServletRequest request) {
        return new ResponseEntity<>(ErrorResponse.builder().timestamp(LocalDateTime.now())
                .status(HttpStatus.FORBIDDEN.value()).message(ex.getMessage())
                .path(request.getServletPath()).errorCode("NFC_ACCESS_DENIED").build(), HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(ThemeAccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleThemeAccessDenied(ThemeAccessDeniedException ex, HttpServletRequest request) {
        return new ResponseEntity<>(ErrorResponse.builder().timestamp(LocalDateTime.now())
                .status(HttpStatus.FORBIDDEN.value()).message(ex.getMessage())
                .path(request.getServletPath()).errorCode("THEME_ACCESS_DENIED").build(), HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(DuplicateTagUidException.class)
    public ResponseEntity<ErrorResponse> handleDuplicateUid(DuplicateTagUidException ex, HttpServletRequest request) {
        return new ResponseEntity<>(ErrorResponse.builder().timestamp(LocalDateTime.now())
                .status(HttpStatus.CONFLICT.value()).message(ex.getMessage())
                .path(request.getServletPath()).errorCode("DUPLICATE_TAG_UID").build(), HttpStatus.CONFLICT);
    }

    @ExceptionHandler(DuplicateThemeException.class)
    public ResponseEntity<ErrorResponse> handleDuplicateTheme(DuplicateThemeException ex, HttpServletRequest request) {
        return new ResponseEntity<>(ErrorResponse.builder().timestamp(LocalDateTime.now())
                .status(HttpStatus.CONFLICT.value()).message(ex.getMessage())
                .path(request.getServletPath()).errorCode("DUPLICATE_THEME").build(), HttpStatus.CONFLICT);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationErrors(MethodArgumentNotValidException ex, HttpServletRequest request) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.UNPROCESSABLE_ENTITY.value())
                .message(errors.toString())
                .path(request.getServletPath())
                .errorCode("VALIDATION_FAILED")
                .build();
        return new ResponseEntity<>(error, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGlobalException(Exception ex, HttpServletRequest request) {
        log.error("Unexpected error at {}: {}", request.getServletPath(), ex.getMessage(), ex);
        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .message("An unexpected error occurred. Please try again later.")
                .path(request.getServletPath())
                .errorCode("INTERNAL_SERVER_ERROR")
                .build();
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}