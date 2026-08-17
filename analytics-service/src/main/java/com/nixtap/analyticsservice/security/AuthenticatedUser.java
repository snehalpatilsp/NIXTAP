package com.nixtap.analyticsservice.security;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Lightweight principal stored in the SecurityContext.
 * Populated by {@link JwtAuthenticationFilter} from JWT claims so that service-layer
 * ownership checks can access userId without a database round-trip.
 */
@Getter
@AllArgsConstructor
public class AuthenticatedUser {

    private final Long userId;
    private final String email;
}
