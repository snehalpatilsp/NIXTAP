package com.nixtap.contactservice.exception;

import com.nixtap.contactservice.dto.response.ErrorResponse;
import feign.FeignException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;

@Slf4j @RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex, HttpServletRequest req) {
        return build(HttpStatus.NOT_FOUND, ex.getMessage(), "CONTACT_NOT_FOUND", req);
    }

    @ExceptionHandler(ContactAccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(ContactAccessDeniedException ex, HttpServletRequest req) {
        return build(HttpStatus.FORBIDDEN, ex.getMessage(), "CONTACT_ACCESS_DENIED", req);
    }

    @ExceptionHandler(FeignException.class)
    public ResponseEntity<ErrorResponse> handleFeign(FeignException ex, HttpServletRequest req) {
        log.error("Feign call failed at {}: {} — {}", req.getServletPath(), ex.status(), ex.getMessage());
        HttpStatus status = ex.status() == 404 ? HttpStatus.NOT_FOUND : HttpStatus.BAD_GATEWAY;
        String msg = ex.status() == 404
                ? "Requested profile or social links not found."
                : "An upstream service is temporarily unavailable. Please try again later.";
        return build(status, msg, "UPSTREAM_ERROR", req);
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
