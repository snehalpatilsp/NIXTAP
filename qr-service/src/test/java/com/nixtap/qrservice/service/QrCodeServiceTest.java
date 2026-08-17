package com.nixtap.qrservice.service;

import com.nixtap.qrservice.dto.request.QrCodeRequest;
import com.nixtap.qrservice.dto.response.QrCodeResponse;
import com.nixtap.qrservice.entity.QrCode;
import com.nixtap.qrservice.exception.QrAccessDeniedException;
import com.nixtap.qrservice.exception.ResourceNotFoundException;
import com.nixtap.qrservice.mapper.QrCodeMapper;
import com.nixtap.qrservice.repository.QrCodeRepository;
import com.nixtap.qrservice.security.AuthenticatedUser;
import com.nixtap.qrservice.service.impl.QrCodeServiceImpl;
import com.nixtap.qrservice.util.QrGeneratorUtil;
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

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class QrCodeServiceTest {

    @Mock private QrCodeRepository qrCodeRepository;
    @Mock private QrCodeMapper     qrCodeMapper;
    @Mock private QrGeneratorUtil  qrGeneratorUtil;

    @InjectMocks
    private QrCodeServiceImpl qrCodeService;

    // -----------------------------------------------------------------------
    // Test fixtures
    // -----------------------------------------------------------------------

    private QrCode       qrCode;
    private QrCodeRequest   request;
    private QrCodeResponse  response;

    private static final Long   USER_ID    = 100L;
    private static final Long   CARD_ID    = 10L;
    private static final Long   QR_ID      = 1L;
    private static final String TARGET_URL = "https://nixtap.com/card/executive-tech-card";
    private static final String FG_COLOR   = "#000000";
    private static final String BG_COLOR   = "#FFFFFF";
    private static final String FILE_PATH  = "/qr-storage/test-uuid.png";

    // -----------------------------------------------------------------------
    // SecurityContext seeding — mirrors the pattern from BusinessCardServiceTest
    // -----------------------------------------------------------------------

    private void authenticateAs(Long userId) {
        AuthenticatedUser principal = new AuthenticatedUser(userId, "test@nixtap.com");
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(principal, null, List.of());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @BeforeEach
    void setUp() {
        authenticateAs(USER_ID);

        qrCode = QrCode.builder()
                .id(QR_ID)
                .userId(USER_ID)
                .cardId(CARD_ID)
                .targetUrl(TARGET_URL)
                .foregroundColor(FG_COLOR)
                .backgroundColor(BG_COLOR)
                .qrCodePath(FILE_PATH)
                .active(true)
                .build();

        request = new QrCodeRequest();
        request.setUserId(USER_ID);
        request.setCardId(CARD_ID);
        request.setTargetUrl(TARGET_URL);
        request.setForegroundColor(FG_COLOR);
        request.setBackgroundColor(BG_COLOR);

        response = QrCodeResponse.builder()
                .id(QR_ID)
                .userId(USER_ID)
                .cardId(CARD_ID)
                .targetUrl(TARGET_URL)
                .foregroundColor(FG_COLOR)
                .backgroundColor(BG_COLOR)
                .qrCodePath(FILE_PATH)
                .active(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    // -----------------------------------------------------------------------
    // generate()
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("generate() — should create QR code, persist entity, and return response")
    void generate_Success() {
        when(qrGeneratorUtil.generateAndSave(TARGET_URL, FG_COLOR, BG_COLOR))
                .thenReturn(FILE_PATH);
        when(qrCodeRepository.save(any(QrCode.class))).thenReturn(qrCode);
        when(qrCodeMapper.toResponse(qrCode)).thenReturn(response);

        QrCodeResponse result = qrCodeService.generate(request);

        assertNotNull(result);
        assertEquals(QR_ID,      result.getId());
        assertEquals(USER_ID,    result.getUserId());
        assertEquals(TARGET_URL, result.getTargetUrl());
        assertEquals(FILE_PATH,  result.getQrCodePath());

        verify(qrGeneratorUtil).generateAndSave(TARGET_URL, FG_COLOR, BG_COLOR);
        verify(qrCodeRepository).save(any(QrCode.class));
    }

    @Test
    @DisplayName("generate() — should throw QrAccessDeniedException when userId does not match caller")
    void generate_ThrowsAccessDenied_WhenUserIdMismatch() {
        // Authenticated as USER_ID=100, but request.userId=999
        request.setUserId(999L);

        assertThrows(QrAccessDeniedException.class,
                () -> qrCodeService.generate(request));
        verify(qrCodeRepository, never()).save(any());
    }

    // -----------------------------------------------------------------------
    // download()
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("download() — should return PNG bytes for a valid QR code ID")
    void download_Success() {
        byte[] pngBytes = new byte[]{1, 2, 3, 4};
        when(qrCodeRepository.findById(QR_ID)).thenReturn(Optional.of(qrCode));
        when(qrGeneratorUtil.readFileBytes(FILE_PATH)).thenReturn(pngBytes);

        byte[] result = qrCodeService.download(QR_ID);

        assertNotNull(result);
        assertArrayEquals(pngBytes, result);
        verify(qrGeneratorUtil).readFileBytes(FILE_PATH);
    }

    @Test
    @DisplayName("download() — should throw ResourceNotFoundException when QR code ID does not exist")
    void download_ThrowsNotFound_WhenIdMissing() {
        when(qrCodeRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> qrCodeService.download(999L));
        verify(qrGeneratorUtil, never()).readFileBytes(anyString());
    }

    // -----------------------------------------------------------------------
    // getByUserId()
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("getByUserId() — should return list of QR codes for the authenticated user")
    void getByUserId_Success() {
        when(qrCodeRepository.findByUserId(USER_ID)).thenReturn(List.of(qrCode));
        when(qrCodeMapper.toResponse(qrCode)).thenReturn(response);

        List<QrCodeResponse> result = qrCodeService.getByUserId(USER_ID);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(QR_ID, result.get(0).getId());
    }

    @Test
    @DisplayName("getByUserId() — should throw QrAccessDeniedException when caller requests another user's codes")
    void getByUserId_ThrowsAccessDenied_WhenNotOwner() {
        // Authenticated as 100, requesting userId=999
        assertThrows(QrAccessDeniedException.class,
                () -> qrCodeService.getByUserId(999L));
        verify(qrCodeRepository, never()).findByUserId(any());
    }

    // -----------------------------------------------------------------------
    // getByCardId()
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("getByCardId() — should return QR code metadata for the given card ID")
    void getByCardId_Success() {
        when(qrCodeRepository.findByCardId(CARD_ID)).thenReturn(Optional.of(qrCode));
        when(qrCodeMapper.toResponse(qrCode)).thenReturn(response);

        QrCodeResponse result = qrCodeService.getByCardId(CARD_ID);

        assertNotNull(result);
        assertEquals(CARD_ID, result.getCardId());
    }

    @Test
    @DisplayName("getByCardId() — should throw ResourceNotFoundException when card has no QR code")
    void getByCardId_ThrowsNotFound_WhenMissing() {
        when(qrCodeRepository.findByCardId(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> qrCodeService.getByCardId(999L));
    }

    // -----------------------------------------------------------------------
    // regenerate()
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("regenerate() — should delete old file, generate new PNG, and update entity")
    void regenerate_Success() {
        String newPath = "/qr-storage/new-uuid.png";
        when(qrCodeRepository.findById(QR_ID)).thenReturn(Optional.of(qrCode));
        when(qrGeneratorUtil.regenerateAndSave(FILE_PATH, TARGET_URL, FG_COLOR, BG_COLOR))
                .thenReturn(newPath);
        when(qrCodeRepository.save(any(QrCode.class))).thenReturn(qrCode);
        when(qrCodeMapper.toResponse(qrCode)).thenReturn(response);

        QrCodeResponse result = qrCodeService.regenerate(QR_ID, request);

        assertNotNull(result);
        verify(qrGeneratorUtil).regenerateAndSave(FILE_PATH, TARGET_URL, FG_COLOR, BG_COLOR);
        verify(qrCodeRepository).save(any(QrCode.class));
    }

    @Test
    @DisplayName("regenerate() — should throw ResourceNotFoundException when ID does not exist")
    void regenerate_ThrowsNotFound_WhenIdMissing() {
        when(qrCodeRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> qrCodeService.regenerate(999L, request));
    }

    @Test
    @DisplayName("regenerate() — should throw QrAccessDeniedException when caller does not own the record")
    void regenerate_ThrowsAccessDenied_WhenNotOwner() {
        // Authenticated as 100, qrCode belongs to 100 — switch caller to 999
        authenticateAs(999L);
        when(qrCodeRepository.findById(QR_ID)).thenReturn(Optional.of(qrCode));

        assertThrows(QrAccessDeniedException.class,
                () -> qrCodeService.regenerate(QR_ID, request));
    }

    // -----------------------------------------------------------------------
    // delete()
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("delete() — should remove PNG file and delete entity from database")
    void delete_Success() {
        when(qrCodeRepository.findById(QR_ID)).thenReturn(Optional.of(qrCode));
        doNothing().when(qrGeneratorUtil).deleteFile(FILE_PATH);
        doNothing().when(qrCodeRepository).delete(qrCode);

        assertDoesNotThrow(() -> qrCodeService.delete(QR_ID));

        verify(qrGeneratorUtil).deleteFile(FILE_PATH);
        verify(qrCodeRepository).delete(qrCode);
    }

    @Test
    @DisplayName("delete() — should throw ResourceNotFoundException when ID does not exist")
    void delete_ThrowsNotFound_WhenIdMissing() {
        when(qrCodeRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> qrCodeService.delete(999L));
        verify(qrCodeRepository, never()).delete(any());
    }

    @Test
    @DisplayName("delete() — should throw QrAccessDeniedException when caller does not own the record")
    void delete_ThrowsAccessDenied_WhenNotOwner() {
        authenticateAs(999L);
        when(qrCodeRepository.findById(QR_ID)).thenReturn(Optional.of(qrCode));

        assertThrows(QrAccessDeniedException.class,
                () -> qrCodeService.delete(QR_ID));
        verify(qrCodeRepository, never()).delete(any());
    }
}
