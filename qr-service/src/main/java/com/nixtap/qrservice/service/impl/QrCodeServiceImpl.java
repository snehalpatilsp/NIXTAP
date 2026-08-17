package com.nixtap.qrservice.service.impl;

import com.nixtap.qrservice.dto.request.QrCodeRequest;
import com.nixtap.qrservice.dto.response.QrCodeResponse;
import com.nixtap.qrservice.entity.QrCode;
import com.nixtap.qrservice.exception.QrAccessDeniedException;
import com.nixtap.qrservice.exception.ResourceNotFoundException;
import com.nixtap.qrservice.mapper.QrCodeMapper;
import com.nixtap.qrservice.repository.QrCodeRepository;
import com.nixtap.qrservice.security.AuthenticatedUser;
import com.nixtap.qrservice.service.QrCodeService;
import com.nixtap.qrservice.util.QrGeneratorUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class QrCodeServiceImpl implements QrCodeService {

    private final QrCodeRepository qrCodeRepository;
    private final QrCodeMapper     qrCodeMapper;
    private final QrGeneratorUtil  qrGeneratorUtil;

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

    private void assertOwner(QrCode qrCode) {
        Long callerId = getAuthenticatedUserId();
        if (!qrCode.getUserId().equals(callerId)) {
            throw new QrAccessDeniedException(
                    "You do not have permission to access this QR code.");
        }
    }

    // -----------------------------------------------------------------------
    // Service operations
    // -----------------------------------------------------------------------

    @Override
    @Transactional
    public QrCodeResponse generate(QrCodeRequest request) {
        // Ensure the caller is generating a QR for their own userId
        Long callerId = getAuthenticatedUserId();
        if (!request.getUserId().equals(callerId)) {
            throw new QrAccessDeniedException(
                    "You can only generate QR codes for your own account.");
        }

        // Resolve colors — request defaults are already set via @Builder.Default;
        // fall back defensively in case nulls slip through
        String fg = (request.getForegroundColor() != null)
                ? request.getForegroundColor() : "#000000";
        String bg = (request.getBackgroundColor() != null)
                ? request.getBackgroundColor() : "#FFFFFF";

        String savedPath = qrGeneratorUtil.generateAndSave(request.getTargetUrl(), fg, bg);

        QrCode qrCode = QrCode.builder()
                .userId(request.getUserId())
                .cardId(request.getCardId())
                .targetUrl(request.getTargetUrl())
                .foregroundColor(fg)
                .backgroundColor(bg)
                .qrCodePath(savedPath)
                .active(true)
                .build();

        QrCode saved = qrCodeRepository.save(qrCode);
        return qrCodeMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] download(Long id) {
        // Download is intentionally public — no ownership check.
        // The security model is: if you know the ID you can download the PNG.
        QrCode qrCode = qrCodeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "QR code not found with ID: " + id));

        return qrGeneratorUtil.readFileBytes(qrCode.getQrCodePath());
    }

    @Override
    @Transactional(readOnly = true)
    public List<QrCodeResponse> getByUserId(Long userId) {
        // Ownership check: authenticated user may only list their own QR codes
        Long callerId = getAuthenticatedUserId();
        if (!userId.equals(callerId)) {
            throw new QrAccessDeniedException(
                    "You can only view your own QR codes.");
        }
        return qrCodeRepository.findByUserId(userId)
                .stream()
                .map(qrCodeMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public QrCodeResponse getByCardId(Long cardId) {
        QrCode qrCode = qrCodeRepository.findByCardId(cardId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "QR code not found for card ID: " + cardId));
        assertOwner(qrCode);
        return qrCodeMapper.toResponse(qrCode);
    }

    @Override
    @Transactional
    public QrCodeResponse regenerate(Long id, QrCodeRequest request) {
        QrCode qrCode = qrCodeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "QR code not found with ID: " + id));

        assertOwner(qrCode);

        String fg = (request.getForegroundColor() != null)
                ? request.getForegroundColor() : qrCode.getForegroundColor();
        String bg = (request.getBackgroundColor() != null)
                ? request.getBackgroundColor() : qrCode.getBackgroundColor();
        String url = (request.getTargetUrl() != null && !request.getTargetUrl().isBlank())
                ? request.getTargetUrl() : qrCode.getTargetUrl();

        // Delete old PNG and generate fresh one
        String newPath = qrGeneratorUtil.regenerateAndSave(
                qrCode.getQrCodePath(), url, fg, bg);

        // Update entity fields
        qrCode.setTargetUrl(url);
        qrCode.setForegroundColor(fg);
        qrCode.setBackgroundColor(bg);
        qrCode.setQrCodePath(newPath);

        QrCode updated = qrCodeRepository.save(qrCode);
        return qrCodeMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        QrCode qrCode = qrCodeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "QR code not found with ID: " + id));

        assertOwner(qrCode);

        // Best-effort: remove the PNG file before deleting the DB record
        qrGeneratorUtil.deleteFile(qrCode.getQrCodePath());
        qrCodeRepository.delete(qrCode);
    }
}
