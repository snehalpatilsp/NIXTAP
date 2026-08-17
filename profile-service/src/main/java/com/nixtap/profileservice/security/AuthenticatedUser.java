package com.nixtap.profileservice.security;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Lightweight principal stored in the SecurityContext for downstream services.
 * Carries the userId extracted from the JWT so ownership checks can be performed
 * without an extra database round-trip.
 */
@Getter
@AllArgsConstructor
public class AuthenticatedUser {

    private final Long userId;
    private final String email;
}
