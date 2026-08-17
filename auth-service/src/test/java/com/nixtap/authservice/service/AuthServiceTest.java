package com.nixtap.authservice.service;

import com.nixtap.authservice.config.JwtUtil;
import com.nixtap.authservice.constant.Role;
import com.nixtap.authservice.dto.request.LoginRequest;
import com.nixtap.authservice.dto.request.RegisterRequest;
import com.nixtap.authservice.dto.response.AuthResponse;
import com.nixtap.authservice.entity.RefreshToken;
import com.nixtap.authservice.entity.User;
import com.nixtap.authservice.mapper.UserMapper;
import com.nixtap.authservice.repository.PasswordResetTokenRepository;
import com.nixtap.authservice.repository.RefreshTokenRepository;
import com.nixtap.authservice.repository.UserRepository;
import com.nixtap.authservice.security.UserDetailsImpl;
import com.nixtap.authservice.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class AuthServiceTest {

        @Mock
        private UserRepository userRepository;
        @Mock
        private RefreshTokenRepository refreshTokenRepository;
        @Mock
        private PasswordResetTokenRepository passwordResetTokenRepository;
        @Mock
        private PasswordEncoder passwordEncoder;
        @Mock
        private AuthenticationManager authenticationManager;
        @Mock
        private JwtUtil jwtUtil;
        @Mock
        private UserMapper userMapper;
        @Mock
        private EmailService emailService;

        @InjectMocks
        private AuthServiceImpl authService;

        private User user;

        @BeforeEach
        void setUp() {
                // Inject @Value field that is not populated by Mockito's @InjectMocks
                ReflectionTestUtils.setField(authService, "refreshTokenDurationMs", 604800000L);

                user = User.builder()
                                .id(1L)
                                .email("test@nixtap.com")
                                .password("encoded_pass")
                                .fullName("Test User")
                                .role(Role.USER)
                                .enabled(true)
                                .build();
        }

        @Test
        @DisplayName("Should successfully register a new user and return AuthResponse")
        void register_Success() {
                RegisterRequest request = new RegisterRequest();
                request.setEmail("test@nixtap.com");
                request.setPassword("password123");
                request.setFullName("Test User");

                RefreshToken refreshToken = RefreshToken.builder()
                                .token("refresh_token")
                                .user(user)
                                .expiryDate(Instant.now().plusMillis(604800000L))
                                .build();

                when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
                when(userMapper.registerRequestToUser(request)).thenReturn(user);
                when(passwordEncoder.encode(request.getPassword())).thenReturn("encoded_pass");
                when(userRepository.save(any(User.class))).thenReturn(user);
                when(userRepository.findById(1L)).thenReturn(Optional.of(user));
                // Use the current canonical method signature
                when(jwtUtil.generateTokenFromEmailRoleAndUserId(
                                eq(user.getEmail()), anyString(), eq(user.getId())))
                                .thenReturn("access_token");
                when(refreshTokenRepository.save(any(RefreshToken.class))).thenReturn(refreshToken);
                // emailService.sendVerificationEmail is void — Mockito does nothing by default
                // (correct)

                AuthResponse response = authService.register(request);

                assertNotNull(response);
                assertEquals("access_token", response.getAccessToken());
                assertEquals("test@nixtap.com", response.getEmail());
                verify(userRepository, times(1)).save(any(User.class));
                verify(emailService, times(1)).sendVerificationEmail(anyString(), anyString());
        }

        @Test
        @DisplayName("Should successfully authenticate user and return AuthResponse on login")
        void login_Success() {
                LoginRequest request = new LoginRequest();
                request.setEmail("test@nixtap.com");
                request.setPassword("password123");

                Authentication authentication = mock(Authentication.class);
                UserDetailsImpl userDetails = UserDetailsImpl.build(user);

                RefreshToken refreshToken = RefreshToken.builder()
                                .token("refresh_token")
                                .user(user)
                                .expiryDate(Instant.now().plusMillis(604800000L))
                                .build();

                when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                                .thenReturn(authentication);
                when(authentication.getPrincipal()).thenReturn(userDetails);
                when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(user));
                when(userRepository.findById(1L)).thenReturn(Optional.of(user));
                // The service generates the token with userId embedded after user lookup
                when(jwtUtil.generateTokenFromEmailRoleAndUserId(
                                eq(user.getEmail()), anyString(), eq(user.getId())))
                                .thenReturn("access_token_with_userid");
                when(refreshTokenRepository.save(any(RefreshToken.class))).thenReturn(refreshToken);

                AuthResponse response = authService.login(request);

                assertNotNull(response);
                assertEquals("access_token_with_userid", response.getAccessToken());
                assertEquals("test@nixtap.com", response.getEmail());
        }
}
