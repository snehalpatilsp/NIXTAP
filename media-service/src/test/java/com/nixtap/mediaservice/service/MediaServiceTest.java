package com.nixtap.mediaservice.service;

import com.nixtap.mediaservice.dto.response.MediaFileResponse;
import com.nixtap.mediaservice.dto.response.StorageStatsResponse;
import com.nixtap.mediaservice.entity.MediaFile;
import com.nixtap.mediaservice.exception.MediaAccessDeniedException;
import com.nixtap.mediaservice.exception.ResourceNotFoundException;
import com.nixtap.mediaservice.repository.MediaFileRepository;
import com.nixtap.mediaservice.security.AuthenticatedUser;
import com.nixtap.mediaservice.service.impl.MediaServiceImpl;
import com.nixtap.mediaservice.util.FileStorageUtil;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class MediaServiceTest {

    @Mock private MediaFileRepository repository;
    @Mock private FileStorageUtil      fileStorageUtil;

    @InjectMocks private MediaServiceImpl service;

    private static final Long   USER_ID   = 1L;
    private static final Long   FILE_ID   = 100L;
    private static final String FILE_PATH = "./media-storage-test/1/test-uuid.jpg";
    private static final String PUBLIC_URL = "http://localhost:8095/api/v1/media/files/100/download";

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(service, "baseUrl", "http://localhost:8095");
        authenticateAs(USER_ID);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private void authenticateAs(Long userId) {
        AuthenticatedUser p = new AuthenticatedUser(userId, "test@nixtap.com");
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(p, null, List.of()));
    }

    private MediaFile buildMediaFile(Long userId) {
        return MediaFile.builder()
                .id(FILE_ID).userId(userId).mediaType("PROFILE_IMAGE")
                .fileName("test-uuid.jpg").originalName("photo.jpg")
                .mimeType("image/jpeg").fileSize(204800L)
                .filePath(FILE_PATH).publicUrl(PUBLIC_URL)
                .createdAt(LocalDateTime.now()).build();
    }

    private MediaFileResponse buildResponse(Long userId) {
        return MediaFileResponse.builder()
                .id(FILE_ID).userId(userId).mediaType("PROFILE_IMAGE")
                .fileName("test-uuid.jpg").originalName("photo.jpg")
                .mimeType("image/jpeg").fileSize(204800L)
                .publicUrl(PUBLIC_URL).createdAt(LocalDateTime.now()).build();
    }

    // -----------------------------------------------------------------------
    // upload()
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("upload() — saves file to disk, persists record, returns publicUrl")
    void upload_Success() {
        MockMultipartFile mockFile = new MockMultipartFile(
                "file", "photo.jpg", "image/jpeg", new byte[1024]);

        MediaFile savedFirst  = buildMediaFile(USER_ID);
        savedFirst.setPublicUrl("pending");
        MediaFile savedFinal  = buildMediaFile(USER_ID);

        when(fileStorageUtil.save(mockFile, USER_ID)).thenReturn("test-uuid.jpg");
        when(fileStorageUtil.buildAbsolutePath(USER_ID, "test-uuid.jpg")).thenReturn(FILE_PATH);
        when(repository.save(any(MediaFile.class))).thenReturn(savedFirst, savedFinal);

        MediaFileResponse result = service.upload(mockFile, "PROFILE_IMAGE", null);

        assertNotNull(result);
        assertTrue(result.getPublicUrl().contains("/api/v1/media/files/"));
        verify(fileStorageUtil).save(mockFile, USER_ID);
        verify(repository, times(2)).save(any(MediaFile.class));
    }

    // -----------------------------------------------------------------------
    // downloadBytes()
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("downloadBytes() — public endpoint reads file bytes from disk")
    void downloadBytes_Success() {
        byte[] bytes = new byte[]{1, 2, 3, 4};
        MediaFile file = buildMediaFile(USER_ID);

        when(repository.findById(FILE_ID)).thenReturn(Optional.of(file));
        when(fileStorageUtil.readBytes(FILE_PATH)).thenReturn(bytes);

        byte[] result = service.downloadBytes(FILE_ID);
        assertArrayEquals(bytes, result);
        verify(fileStorageUtil).readBytes(FILE_PATH);
    }

    @Test
    @DisplayName("downloadBytes() — throws ResourceNotFoundException when file not found")
    void downloadBytes_ThrowsNotFound() {
        when(repository.findById(999L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> service.downloadBytes(999L));
    }

    // -----------------------------------------------------------------------
    // getMyFiles()
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("getMyFiles() — returns all files for authenticated user")
    void getMyFiles_Success() {
        MediaFile file = buildMediaFile(USER_ID);
        when(repository.findByUserIdOrderByCreatedAtDesc(USER_ID)).thenReturn(List.of(file));

        List<MediaFileResponse> result = service.getMyFiles();
        assertEquals(1, result.size());
        assertEquals(FILE_ID, result.get(0).getId());
    }

    @Test
    @DisplayName("getMyFiles() — returns empty list when user has no files")
    void getMyFiles_Empty() {
        when(repository.findByUserIdOrderByCreatedAtDesc(USER_ID)).thenReturn(List.of());
        assertTrue(service.getMyFiles().isEmpty());
    }

    // -----------------------------------------------------------------------
    // getMyStorageStats()
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("getMyStorageStats() — returns correct counts and formatted size")
    void getMyStorageStats_Success() {
        when(repository.countByUserId(USER_ID)).thenReturn(5L);
        when(repository.sumFileSizeByUserId(USER_ID)).thenReturn(2621440L); // 2.5 MB

        StorageStatsResponse stats = service.getMyStorageStats();
        assertEquals(USER_ID, stats.getUserId());
        assertEquals(5L,      stats.getTotalFiles());
        assertEquals(2621440L, stats.getTotalSizeBytes());
        assertEquals("2.5 MB", stats.getTotalSizeReadable());
    }

    // -----------------------------------------------------------------------
    // deleteFile()
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("deleteFile() — deletes from disk and DB when owner calls")
    void deleteFile_Success() {
        MediaFile file = buildMediaFile(USER_ID);
        when(repository.findById(FILE_ID)).thenReturn(Optional.of(file));
        doNothing().when(fileStorageUtil).delete(FILE_PATH);
        doNothing().when(repository).delete(file);

        assertDoesNotThrow(() -> service.deleteFile(FILE_ID));
        verify(fileStorageUtil).delete(FILE_PATH);
        verify(repository).delete(file);
    }

    @Test
    @DisplayName("deleteFile() — throws MediaAccessDeniedException when caller is not owner")
    void deleteFile_ThrowsAccessDenied_WhenNotOwner() {
        MediaFile file = buildMediaFile(999L); // belongs to userId 999
        when(repository.findById(FILE_ID)).thenReturn(Optional.of(file));
        // Authenticated as USER_ID=1, file belongs to 999
        assertThrows(MediaAccessDeniedException.class, () -> service.deleteFile(FILE_ID));
        verify(repository, never()).delete(any());
    }

    @Test
    @DisplayName("deleteFile() — throws ResourceNotFoundException when file does not exist")
    void deleteFile_ThrowsNotFound_WhenFileAbsent() {
        when(repository.findById(999L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> service.deleteFile(999L));
    }
}
