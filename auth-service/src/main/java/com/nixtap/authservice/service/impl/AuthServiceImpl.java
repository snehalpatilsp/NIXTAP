package com.nixtap.authservice.service.impl;

import com.nixtap.authservice.config.JwtUtil;
import com.nixtap.authservice.constant.Role;
import com.nixtap.authservice.dto.request.ForgotPasswordRequest;
import com.nixtap.authservice.dto.request.LoginRequest;
import com.nixtap.authservice.dto.request.RefreshTokenRequest;
import com.nixtap.authservice.dto.request.RegisterRequest;
import com.nixtap.authservice.dto.request.ResetPasswordRequest;
import com.nixtap.authservice.dto.response.AuthResponse;
import com.nixtap.authservice.entity.PasswordResetToken;
import com.nixtap.authservice.entity.RefreshToken;
import com.nixtap.authservice.entity.User;
import com.nixtap.authservice.exception.BadRequestException;
import com.nixtap.authservice.exception.ResourceNotFoundException;
import com.nixtap.authservice.exception.TokenRefreshException;
import com.nixtap.authservice.mapper.UserMapper;
import com.nixtap.authservice.repository.PasswordResetTokenRepository;
import com.nixtap.authservice.repository.RefreshTokenRepository;
import com.nixtap.authservice.repository.UserRepository;
import com.nixtap.authservice.security.UserDetailsImpl;
import com.nixtap.authservice.service.AuthService;
import com.nixtap.authservice.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserMapper userMapper;
    private final EmailService emailService;

    @Value("${jwt.refresh-expiration-ms:604800000}")
    private Long refreshTokenDurationMs;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already taken!");
        }

        User user = userMapper.registerRequestToUser(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.USER); // always USER — role elevation done by admin only
        user.setEnabled(false);       // ACCOUNT IS DISABLED UNTIL OTP VERIFICATION
        user.setEmailVerified(false); // EMAIL IS NOT VERIFIED YET

        // Generate 6-digit numeric OTP code
        String otpCode = String.format("%06d", new java.util.Random().nextInt(1000000));
        user.setVerificationCode(otpCode);
        User savedUser = Objects.requireNonNull(userRepository.save(user), "Saved user cannot be null");

        // Send OTP verification email
        emailService.sendVerificationEmail(savedUser.getEmail(), otpCode);

        return AuthResponse.builder()
                .accessToken(null)
                .refreshToken(null)
                .tokenType("Bearer")
                .userId(savedUser.getId())
                .email(savedUser.getEmail())
                .fullName(savedUser.getFullName())
                .role(savedUser.getRole().name())
                .build();
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        RefreshToken refreshToken = createRefreshToken(userDetails.getId());

        User user = userRepository.findByEmail(userDetails.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Regenerate token with userId embedded now that we have the user object
        String fullAccessToken = jwtUtil.generateTokenFromEmailRoleAndUserId(
                user.getEmail(), "ROLE_" + user.getRole().name(), user.getId());

        return AuthResponse.builder()
                .accessToken(fullAccessToken)
                .refreshToken(refreshToken.getToken())
                .tokenType("Bearer")
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .build();
    }

    @Override
    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        return refreshTokenRepository.findByToken(request.getRefreshToken())
                .map(this::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    String accessToken = jwtUtil.generateTokenFromEmailRoleAndUserId(
                            user.getEmail(), "ROLE_" + user.getRole().name(), user.getId());
                    return AuthResponse.builder()
                            .accessToken(accessToken)
                            .refreshToken(request.getRefreshToken())
                            .tokenType("Bearer")
                            .userId(user.getId())
                            .email(user.getEmail())
                            .fullName(user.getFullName())
                            .role(user.getRole().name())
                            .build();
                })
                .orElseThrow(() -> new TokenRefreshException(request.getRefreshToken(), "Refresh token is not in database!"));
    }

    @Override
    @Transactional
    public void logout(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        refreshTokenRepository.deleteByUser(user);
    }

    @Override
    @Transactional
    public void verifyEmail(String token) {
        User user = userRepository.findByVerificationCode(token)
                .orElseThrow(() -> new BadRequestException("Invalid or expired OTP verification code"));

        user.setEnabled(true);
        user.setEmailVerified(true);
        user.setVerificationCode(null);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + request.getEmail()));

        passwordResetTokenRepository.deleteByUser(user);
        passwordResetTokenRepository.flush();

        // Generate 6-digit numeric OTP code
        String token = String.format("%06d", new java.security.SecureRandom().nextInt(1000000));
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .user(user)
                .expiryDate(LocalDateTime.now().plusMinutes(15))
                .build();

        passwordResetTokenRepository.save(resetToken);

        // Send password reset email with 6-digit OTP code
        emailService.sendPasswordResetEmail(user.getEmail(), token);
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new BadRequestException("Invalid reset token"));

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            passwordResetTokenRepository.delete(resetToken);
            throw new BadRequestException("Token has expired");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        passwordResetTokenRepository.delete(resetToken);
    }

    @Override
    @Transactional
    public RefreshToken createRefreshToken(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        refreshTokenRepository.deleteByUser(user);

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(UUID.randomUUID().toString())
                .expiryDate(Instant.now().plusMillis(refreshTokenDurationMs))
                .build();

        return refreshTokenRepository.save(refreshToken);
    }

    private RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().compareTo(Instant.now()) < 0) {
            refreshTokenRepository.delete(token);
            throw new TokenRefreshException(token.getToken(), "Refresh token was expired. Please make a new signin request");
        }
        return token;
    }
}