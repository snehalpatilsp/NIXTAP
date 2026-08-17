package com.nixtap.notificationservice.service.impl;

import com.nixtap.notificationservice.dto.request.NotificationPreferenceRequest;
import com.nixtap.notificationservice.dto.request.SendNotificationRequest;
import com.nixtap.notificationservice.dto.response.NotificationLogResponse;
import com.nixtap.notificationservice.dto.response.NotificationPreferenceResponse;
import com.nixtap.notificationservice.entity.NotificationLog;
import com.nixtap.notificationservice.entity.NotificationPreference;
import com.nixtap.notificationservice.exception.NotificationAccessDeniedException;
import com.nixtap.notificationservice.exception.ResourceNotFoundException;
import com.nixtap.notificationservice.mapper.NotificationMapper;
import com.nixtap.notificationservice.repository.NotificationLogRepository;
import com.nixtap.notificationservice.repository.NotificationPreferenceRepository;
import com.nixtap.notificationservice.security.AuthenticatedUser;
import com.nixtap.notificationservice.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Slf4j
@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class NotificationServiceImpl implements NotificationService {

    private final NotificationPreferenceRepository preferenceRepository;
    private final NotificationLogRepository        logRepository;
    private final NotificationMapper               notificationMapper;
    private final JavaMailSender                   mailSender;

    // -----------------------------------------------------------------------
    // Security helpers
    // -----------------------------------------------------------------------

    private Long getAuthenticatedUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof AuthenticatedUser principal)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required.");
        }
        return principal.getUserId();
    }

    private String getAuthenticatedEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof AuthenticatedUser principal)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required.");
        }
        return principal.getEmail();
    }

    // -----------------------------------------------------------------------
    // Preferences
    // -----------------------------------------------------------------------

    @Override
    @Transactional
    public NotificationPreferenceResponse getMyPreferences() {
        Long userId = getAuthenticatedUserId();
        NotificationPreference pref = preferenceRepository.findByUserId(userId)
                .orElseGet(() -> {
                    NotificationPreference defaults = NotificationPreference.builder().userId(userId).build();
                    return preferenceRepository.save(defaults);
                });
        return notificationMapper.toPreferenceResponse(pref);
    }

    @Override
    @Transactional
    public NotificationPreferenceResponse updateMyPreferences(NotificationPreferenceRequest request) {
        Long userId = getAuthenticatedUserId();
        NotificationPreference pref = preferenceRepository.findByUserId(userId)
                .orElseGet(() -> NotificationPreference.builder().userId(userId).build());

        pref.setEmailEnabled(request.getEmailEnabled());
        pref.setSmsEnabled(request.getSmsEnabled());
        pref.setPushEnabled(request.getPushEnabled());
        pref.setNotifyOnView(request.getNotifyOnView());
        pref.setNotifyOnMeetingRequest(request.getNotifyOnMeetingRequest());
        pref.setNotifyOnFeedback(request.getNotifyOnFeedback());

        return notificationMapper.toPreferenceResponse(preferenceRepository.save(pref));
    }

    // -----------------------------------------------------------------------
    // Logs
    // -----------------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationLogResponse> getMyLogs(Pageable pageable) {
        Long userId = getAuthenticatedUserId();
        return logRepository.findByUserIdOrderBySentAtDesc(userId, pageable)
                .map(notificationMapper::toLogResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public long countUnread() {
        return logRepository.countByUserIdAndIsRead(getAuthenticatedUserId(), false);
    }

    @Override
    @Transactional
    public void markAsRead(Long logId) {
        Long userId = getAuthenticatedUserId();
        NotificationLog entry = logRepository.findById(logId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification log not found: " + logId));
        if (!entry.getUserId().equals(userId)) {
            throw new NotificationAccessDeniedException("You cannot mark another user's notification.");
        }
        entry.setRead(true);
        logRepository.save(entry);
    }

    @Override
    @Transactional
    public void markAllAsRead() {
        Long userId = getAuthenticatedUserId();
        // Single bulk UPDATE instead of N+1 individual saves
        logRepository.markAllReadByUserId(userId);
    }

    // -----------------------------------------------------------------------
    // Internal dispatch
    // -----------------------------------------------------------------------

    @Override
    @Transactional
    public void sendNotification(SendNotificationRequest request) {
        NotificationPreference pref = preferenceRepository.findByUserId(request.getUserId())
                .orElseGet(() -> NotificationPreference.builder().userId(request.getUserId()).build());

        boolean emailEnabled = pref.isEmailEnabled();
        String  status       = "SKIPPED";
        String  errorMsg     = null;

        if (emailEnabled && (request.getChannel() == null || "EMAIL".equalsIgnoreCase(request.getChannel()))) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(request.getRecipientEmail()); // real recipient email from request
                message.setSubject(request.getSubject());
                message.setText(request.getBody());
                mailSender.send(message);
                status = "SENT";
                log.info("Notification email sent to userId={} type={}", request.getUserId(), request.getType());
            } catch (MailException e) {
                status   = "FAILED";
                errorMsg = e.getMessage();
                log.error("Failed to send notification to userId={}: {}", request.getUserId(), e.getMessage());
            }
        }

        NotificationLog logEntry = NotificationLog.builder()
                .userId(request.getUserId())
                .channel(request.getChannel() != null ? request.getChannel() : "EMAIL")
                .type(request.getType())
                .subject(request.getSubject())
                .body(request.getBody())
                .status(status)
                .errorMessage(errorMsg)
                .build();
        logRepository.save(logEntry);
    }
}
