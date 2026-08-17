package com.nixtap.analyticsservice.config;

import com.nixtap.analyticsservice.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
@SuppressWarnings("null")
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth ->
                        auth
                            // Public: anonymous event logging (NFC/QR taps from any device)
                            .requestMatchers(
                                org.springframework.http.HttpMethod.POST,
                                "/api/v1/analytics/events").permitAll()
                            // Swagger / OpenAPI
                            .requestMatchers("/v3/api-docs/**", "/swagger-ui/**",
                                             "/swagger-ui.html").permitAll()
                            // Actuator health and info
                            .requestMatchers("/actuator/**").permitAll()
                            // Dashboard and event history require a valid JWT
                            .requestMatchers("/api/v1/analytics/dashboard/**").authenticated()
                            .requestMatchers("/api/v1/analytics/events/owner/**").authenticated()
                            .anyRequest().authenticated()
                );

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
