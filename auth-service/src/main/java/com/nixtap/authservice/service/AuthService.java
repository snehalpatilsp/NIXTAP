package com.nixtap.authservice.service;

import com.nixtap.authservice.dto.response.AuthResponse;
import com.nixtap.authservice.dto.request.ForgotPasswordRequest;
import com.nixtap.authservice.dto.request.LoginRequest;
import com.nixtap.authservice.dto.request.RefreshTokenRequest;
import com.nixtap.authservice.dto.request.RegisterRequest;
import com.nixtap.authservice.dto.request.ResetPasswordRequest;
import com.nixtap.authservice.entity.RefreshToken;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse refreshToken(RefreshTokenRequest request);
    void logout(Long userId);
    void verifyEmail(String token);
    void forgotPassword(ForgotPasswordRequest request);
    void resetPassword(ResetPasswordRequest request);
    RefreshToken createRefreshToken(Long userId);
}