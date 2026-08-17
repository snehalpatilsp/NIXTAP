package com.nixtap.authservice.service;

public interface EmailService {

    void sendVerificationEmail(String toEmail, String verificationCode);

    void sendPasswordResetEmail(String toEmail, String resetToken);
}
