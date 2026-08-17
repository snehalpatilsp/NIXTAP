package com.nixtap.profileservice.service;

import com.nixtap.profileservice.dto.request.UserProfileRequest;
import com.nixtap.profileservice.dto.response.UserProfileResponse;
import com.nixtap.profileservice.entity.UserProfile;
import com.nixtap.profileservice.exception.ProfileAlreadyExistsException;
import com.nixtap.profileservice.exception.ResourceNotFoundException;
import com.nixtap.profileservice.mapper.UserProfileMapper;
import com.nixtap.profileservice.repository.UserProfileRepository;
import com.nixtap.profileservice.security.AuthenticatedUser;
import com.nixtap.profileservice.service.impl.UserProfileServiceImpl;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class UserProfileServiceTest {

    @Mock private UserProfileRepository profileRepository;
    @Mock private UserProfileMapper profileMapper;

    @InjectMocks
    private UserProfileServiceImpl profileService;

    private UserProfile userProfile;
    private UserProfileRequest profileRequest;
    private UserProfileResponse profileResponse;

    // -----------------------------------------------------------------------
    // Seed the SecurityContext so getAuthenticatedUserId() works in unit tests
    // -----------------------------------------------------------------------
    private void authenticateAs(Long userId) {
        AuthenticatedUser principal = new AuthenticatedUser(userId, "john.doe@nixtap.com");
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(principal, null, List.of());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @BeforeEach
    void setUp() {
        // Seed SecurityContext with userId=100 before every test
        authenticateAs(100L);

        userProfile = UserProfile.builder()
                .id(1L)
                .userId(100L)
                .fullName("John Doe")
                .email("john.doe@nixtap.com")
                .designation("Senior Software Engineer")
                .company("Nixtap Inc.")
                .isPublic(true)
                .build();

        profileRequest = new UserProfileRequest();
        profileRequest.setUserId(100L);
        profileRequest.setFullName("John Doe");
        profileRequest.setEmail("john.doe@nixtap.com");
        profileRequest.setDesignation("Senior Software Engineer");
        profileRequest.setCompany("Nixtap Inc.");
        profileRequest.setPublic(true);

        profileResponse = UserProfileResponse.builder()
                .id(1L)
                .userId(100L)
                .fullName("John Doe")
                .email("john.doe@nixtap.com")
                .designation("Senior Software Engineer")
                .company("Nixtap Inc.")
                .build();
    }

    @AfterEach
    void tearDown() {
        // Always clear the SecurityContext after each test to prevent state leakage
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("Should successfully create a new user profile")
    void createProfile_Success() {
        when(profileRepository.existsByUserId(100L)).thenReturn(false);
        when(profileMapper.toEntity(profileRequest)).thenReturn(userProfile);
        when(profileRepository.save(any(UserProfile.class))).thenReturn(userProfile);
        when(profileMapper.toResponse(userProfile)).thenReturn(profileResponse);

        UserProfileResponse response = profileService.createProfile(profileRequest);

        assertNotNull(response);
        assertEquals("John Doe", response.getFullName());
        assertEquals(100L, response.getUserId());
        verify(profileRepository, times(1)).save(any(UserProfile.class));
    }

    @Test
    @DisplayName("Should throw ProfileAlreadyExistsException when profile already exists")
    void createProfile_ThrowsException_WhenProfileExists() {
        // assertOwner() passes because SecurityContext has userId=100
        // existsByUserId() returns true → ProfileAlreadyExistsException
        when(profileRepository.existsByUserId(100L)).thenReturn(true);

        assertThrows(ProfileAlreadyExistsException.class,
                () -> profileService.createProfile(profileRequest));
        verify(profileRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should retrieve profile by user ID successfully")
    void getProfileByUserId_Success() {
        when(profileRepository.findByUserId(100L)).thenReturn(Optional.of(userProfile));
        when(profileMapper.toResponse(userProfile)).thenReturn(profileResponse);

        UserProfileResponse response = profileService.getProfileByUserId(100L);

        assertNotNull(response);
        assertEquals(100L, response.getUserId());
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when user profile is not found")
    void getProfileByUserId_NotFound() {
        when(profileRepository.findByUserId(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> profileService.getProfileByUserId(999L));
    }

    @Test
    @DisplayName("Should reject access when caller is not the profile owner")
    void createProfile_ThrowsForbidden_WhenNotOwner() {
        // Authenticated as userId=999, but request.userId=100
        authenticateAs(999L);
        assertThrows(org.springframework.web.server.ResponseStatusException.class,
                () -> profileService.createProfile(profileRequest));
    }
}
