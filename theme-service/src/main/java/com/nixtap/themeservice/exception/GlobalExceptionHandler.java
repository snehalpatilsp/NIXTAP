package com.nixtap.themeservice.exception;

import com.nixtap.themeservice.dto.response.ErrorResponse;
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

@Slf4j @RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex, HttpServletRequest req) {
        return build(HttpStatus.NOT_FOUND, ex.getMessage(), "THEME_NOT_FOUND", req);
    }

    @ExceptionHandler(ThemeAccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(ThemeAccessDeniedException ex, HttpServletRequest req) {
        return build(HttpStatus.FORBIDDEN, ex.getMessage(), "THEME_ACCESS_DENIED", req);
    }

    @ExceptionHandler(DuplicateThemeException.class)
    public ResponseEntity<ErrorResponse> handleDuplicate(DuplicateThemeException ex, HttpServletRequest req) {
        return build(HttpStatus.CONFLICT, ex.getMessage(), "DUPLICATE_THEME", req);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest req) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(e ->
                errors.put(((FieldError) e).getField(), e.getDefaultMessage()));
        return build(HttpStatus.UNPROCESSABLE_ENTITY, errors.toString(), "VALIDATION_FAILED", req);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGlobal(Exception ex, HttpServletRequest req) {
        log.error("Unexpected error at {}: {}", req.getServletPath(), ex.getMessage(), ex);
        return build(HttpStatus.INTERNAL_SERVER_ERROR,
                "An unexpected error occurred. Please try again later.", "INTERNAL_SERVER_ERROR", req);
    }

    private ResponseEntity<ErrorResponse> build(HttpStatus s, String msg, String code, HttpServletRequest req) {
        return new ResponseEntity<>(ErrorResponse.builder().timestamp(LocalDateTime.now())
                .status(s.value()).message(msg).path(req.getServletPath()).errorCode(code).build(), s);
    }
}
