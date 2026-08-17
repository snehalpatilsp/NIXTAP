package com.nixtap.portfolioservice.exception;

public class PortfolioAccessDeniedException extends RuntimeException {
    public PortfolioAccessDeniedException(String message) {
        super(message);
    }
}
