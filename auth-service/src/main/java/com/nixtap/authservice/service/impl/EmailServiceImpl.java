package com.nixtap.authservice.service.impl;

import com.nixtap.authservice.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.base-url}")
    private String baseUrl;

    @Override
    public void sendVerificationEmail(String toEmail, String verificationCode) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Your Nixtap Account Verification OTP Code");
            message.setText(
                    "Hello,\n\n" +
                            "Thank you for registering with Nixtap!\n\n" +
                            "Your 6-digit account verification OTP code is:\n\n" +
                            "    >>> " + verificationCode + " <<<\n\n" +
                            "Enter this OTP code on the registration page to activate your account.\n\n" +
                            "If you did not create a Nixtap account, please ignore this email.\n\n" +
                            "— The Nixtap Team");
            mailSender.send(message);
            log.info("Verification email sent to {}", toEmail);
        } catch (MailException e) {
            log.error("Failed to send verification email to {}: {}", toEmail, e.getMessage(), e);
            // Do not rethrow — email failure should not block registration
        }
    }

    @Override
    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Your Nixtap Password Reset OTP Code");
            message.setText(
                    "Hello,\n\n" +
                            "We received a request to reset your Nixtap account password.\n\n" +
                            "Your 6-digit Password Reset OTP code is:\n\n" +
                            "    >>> " + resetToken + " <<<\n\n" +
                            "This OTP code is valid for 15 minutes.\n\n" +
                            "If you did not request a password reset, please ignore this email.\n\n" +
                            "— The Nixtap Team");
            mailSender.send(message);
            log.info("Password reset OTP email sent to {}", toEmail);
        } catch (MailException e) {
            log.error("Failed to send password reset email to {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Failed to send password reset email. Please try again later.");
        }
    }
}
