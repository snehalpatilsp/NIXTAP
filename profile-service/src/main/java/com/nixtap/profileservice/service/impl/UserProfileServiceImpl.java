package com.nixtap.profileservice.service.impl;

import com.nixtap.profileservice.dto.request.UserProfileRequest;
import com.nixtap.profileservice.dto.response.UserProfileResponse;
import com.nixtap.profileservice.entity.UserProfile;
import com.nixtap.profileservice.exception.ProfileAlreadyExistsException;
import com.nixtap.profileservice.exception.ResourceNotFoundException;
import com.nixtap.profileservice.mapper.UserProfileMapper;
import com.nixtap.profileservice.repository.UserProfileRepository;
import com.nixtap.profileservice.security.AuthenticatedUser;
import com.nixtap.profileservice.service.UserProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class UserProfileServiceImpl implements UserProfileService {

    private final UserProfileRepository profileRepository;
    private final UserProfileMapper profileMapper;

    // -----------------------------------------------------------------------
    // Security helper
    // -----------------------------------------------------------------------

    private Long getAuthenticatedUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof AuthenticatedUser principal)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required.");
        }
        return principal.getUserId();
    }

    private void assertOwner(Long targetUserId) {
        Long callerId = getAuthenticatedUserId();
        if (!targetUserId.equals(callerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You do not have permission to modify this profile.");
        }
    }

    // -----------------------------------------------------------------------
    // CRUD
    // -----------------------------------------------------------------------

    @Override
    @Transactional
    public UserProfileResponse createProfile(UserProfileRequest request) {
        // Ensure the caller is creating their own profile
        assertOwner(request.getUserId());

        if (profileRepository.existsByUserId(request.getUserId())) {
            throw new ProfileAlreadyExistsException("Profile already exists for User ID: " + request.getUserId());
        }

        UserProfile profile = profileMapper.toEntity(request);
        profile.setPublic(request.isPublic());
        UserProfile savedProfile = profileRepository.save(profile);
        return profileMapper.toResponse(savedProfile);
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getMyProfile() {
        Long userId = getAuthenticatedUserId();
        UserProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for current user."));
        return profileMapper.toResponse(profile);
    }

    @Override
    @Transactional
    public UserProfileResponse updateMyProfile(UserProfileRequest request) {
        Long userId = getAuthenticatedUserId();
        UserProfile profile = profileRepository.findByUserId(userId).orElse(null);
        if (profile == null) {
            request.setUserId(userId);
            profile = profileMapper.toEntity(request);
            profile.setUserId(userId);
        } else {
            String newUsername = request.getUsername();
            profileMapper.updateEntityFromRequest(request, profile);
            if (newUsername != null && !newUsername.trim().isEmpty()) {
                profile.setUsername(newUsername.trim());
            }
        }
        profile.setPublic(request.isPublic());
        UserProfile saved = profileRepository.save(profile);
        return profileMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getProfileByUserId(Long userId) {
        UserProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for User ID: " + userId));
        return profileMapper.toResponse(profile);
    }

    /**
     * Public endpoint: only returns the profile if the user has set it to public.
     */
    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getPublicProfileByUserId(Long userId) {
        UserProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for User ID: " + userId));
        return profileMapper.toResponse(profile);
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getPublicProfileByUsername(String username) {
        UserProfile profile = profileRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for Username: " + username));
        return profileMapper.toResponse(profile);
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getProfileById(Long id) {
        UserProfile profile = profileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found with ID: " + id));
        // Ownership check: authenticated user can only retrieve their own profile by row ID
        assertOwner(profile.getUserId());
        return profileMapper.toResponse(profile);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserProfileResponse> getAllProfiles(Pageable pageable) {
        // Caller must have ADMIN role — enforced at the SecurityConfig level
        return profileRepository.findAll(pageable)
                .map(profileMapper::toResponse);
    }

    @Override
    @Transactional
    public UserProfileResponse updateProfile(Long userId, UserProfileRequest request) {
        assertOwner(userId);

        UserProfile existingProfile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for User ID: " + userId));

        existingProfile.setFullName(request.getFullName());
        existingProfile.setHeadline(request.getHeadline());
        existingProfile.setDesignation(request.getDesignation());
        existingProfile.setCompany(request.getCompany());
        existingProfile.setBio(request.getBio());
        existingProfile.setEmail(request.getEmail());
        existingProfile.setPhone(request.getPhone());
        existingProfile.setWebsite(request.getWebsite());
        existingProfile.setAddress(request.getAddress());
        existingProfile.setCity(request.getCity());
        existingProfile.setState(request.getState());
        existingProfile.setCountry(request.getCountry());
        existingProfile.setPublic(request.isPublic());

        if (request.getProfileImage() != null) {
            existingProfile.setProfileImage(request.getProfileImage());
        }
        if (request.getCoverImage() != null) {
            existingProfile.setCoverImage(request.getCoverImage());
        }

        UserProfile updatedProfile = profileRepository.save(existingProfile);
        return profileMapper.toResponse(updatedProfile);
    }

    @Override
    @Transactional
    public void deleteProfileByUserId(Long userId) {
        assertOwner(userId);
        // findByUserId validates existence — no need for a separate existsByUserId call
        UserProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for User ID: " + userId));
        profileRepository.delete(profile);
    }
}
