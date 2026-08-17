package com.nixtap.nfcservice.service;

import com.nixtap.nfcservice.dto.request.NfcTagRegisterRequest;
import com.nixtap.nfcservice.dto.response.NfcTagResponse;
import com.nixtap.nfcservice.entity.NfcTag;
import com.nixtap.nfcservice.exception.DuplicateTagUidException;
import com.nixtap.nfcservice.exception.NfcAccessDeniedException;
import com.nixtap.nfcservice.exception.ResourceNotFoundException;
import com.nixtap.nfcservice.mapper.NfcTagMapper;
import com.nixtap.nfcservice.repository.NfcTagRepository;
import com.nixtap.nfcservice.security.AuthenticatedUser;
import com.nixtap.nfcservice.service.impl.NfcTagServiceImpl;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
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
class NfcTagServiceTest {

    @Mock private NfcTagRepository repository;
    @Mock private NfcTagMapper     mapper;
    @InjectMocks private NfcTagServiceImpl service;

    private static final Long   USER_ID = 1L;
    private static final String TAG_UID = "04:AB:CD:12:34:56:78";

    private NfcTag buildTag(Long userId) {
        return NfcTag.builder().id(1L).userId(userId).tagUid(TAG_UID)
                .tagType("NTAG215").status("ACTIVE").build();
    }

    private void authenticateAs(Long userId) {
        AuthenticatedUser p = new AuthenticatedUser(userId, "test@nixtap.com");
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(p, null, List.of()));
    }

    @BeforeEach void setUp()    { authenticateAs(USER_ID); }
    @AfterEach  void tearDown() { SecurityContextHolder.clearContext(); }

    @Test @DisplayName("registerTag() — saves and returns response")
    void registerTag_Success() {
        NfcTagRegisterRequest req = new NfcTagRegisterRequest();
        req.setUserId(USER_ID); req.setTagUid(TAG_UID); req.setTagType("NTAG215");

        NfcTag saved = buildTag(USER_ID);
        NfcTagResponse response = NfcTagResponse.builder().id(1L).tagUid(TAG_UID).build();

        when(repository.existsByTagUid(TAG_UID)).thenReturn(false);
        when(repository.save(any())).thenReturn(saved);
        when(mapper.toResponse(saved)).thenReturn(response);

        NfcTagResponse result = service.registerTag(req);
        assertNotNull(result);
        assertEquals(TAG_UID, result.getTagUid());
    }

    @Test @DisplayName("registerTag() — throws DuplicateTagUidException when UID exists")
    void registerTag_ThrowsDuplicate_WhenUidExists() {
        NfcTagRegisterRequest req = new NfcTagRegisterRequest();
        req.setUserId(USER_ID); req.setTagUid(TAG_UID);
        when(repository.existsByTagUid(TAG_UID)).thenReturn(true);
        assertThrows(DuplicateTagUidException.class, () -> service.registerTag(req));
    }

    @Test @DisplayName("registerTag() — throws NfcAccessDeniedException when userId mismatch")
    void registerTag_ThrowsAccessDenied_WhenNotOwner() {
        NfcTagRegisterRequest req = new NfcTagRegisterRequest();
        req.setUserId(999L); req.setTagUid(TAG_UID);
        assertThrows(NfcAccessDeniedException.class, () -> service.registerTag(req));
    }

    @Test @DisplayName("getTagByUid() — public lookup returns tag without auth check")
    void getTagByUid_Success_Public() {
        NfcTag tag = buildTag(USER_ID);
        NfcTagResponse response = NfcTagResponse.builder().tagUid(TAG_UID).build();
        when(repository.findByTagUid(TAG_UID)).thenReturn(Optional.of(tag));
        when(mapper.toResponse(tag)).thenReturn(response);
        NfcTagResponse result = service.getTagByUid(TAG_UID);
        assertEquals(TAG_UID, result.getTagUid());
    }

    @Test @DisplayName("deleteTag() — throws NfcAccessDeniedException when caller is not owner")
    void deleteTag_ThrowsAccessDenied_WhenNotOwner() {
        NfcTag tag = buildTag(999L);
        when(repository.findById(1L)).thenReturn(Optional.of(tag));
        assertThrows(NfcAccessDeniedException.class, () -> service.deleteTag(1L));
    }

    @Test @DisplayName("deleteTag() — deletes tag when owner calls")
    void deleteTag_Success() {
        NfcTag tag = buildTag(USER_ID);
        when(repository.findById(1L)).thenReturn(Optional.of(tag));
        doNothing().when(repository).delete(tag);
        assertDoesNotThrow(() -> service.deleteTag(1L));
        verify(repository).delete(tag);
    }

    @Test @DisplayName("deactivateTag() — sets status LOST and saves")
    void deactivateTag_Success() {
        NfcTag tag = buildTag(USER_ID);
        NfcTagResponse response = NfcTagResponse.builder().id(1L).status("LOST").build();
        when(repository.findById(1L)).thenReturn(Optional.of(tag));
        when(repository.save(tag)).thenReturn(tag);
        when(mapper.toResponse(tag)).thenReturn(response);
        NfcTagResponse result = service.deactivateTag(1L, "LOST");
        assertEquals("LOST", result.getStatus());
    }

    @Test @DisplayName("getTagsByUserId() — throws when caller is not the owner")
    void getTagsByUserId_ThrowsAccessDenied_WhenNotOwner() {
        assertThrows(NfcAccessDeniedException.class, () -> service.getTagsByUserId(999L));
        verify(repository, never()).findByUserIdOrderByCreatedAtDesc(any());
    }

    @Test @DisplayName("getTagById() — throws ResourceNotFoundException when tag missing")
    void getTagById_ThrowsNotFound() {
        when(repository.findById(999L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> service.getTagById(999L));
    }
}
