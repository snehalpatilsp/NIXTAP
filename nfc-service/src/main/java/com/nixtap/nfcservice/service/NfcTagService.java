package com.nixtap.nfcservice.service;

import com.nixtap.nfcservice.dto.request.NfcTagLinkRequest;
import com.nixtap.nfcservice.dto.request.NfcTagRegisterRequest;
import com.nixtap.nfcservice.dto.response.NfcTagResponse;

import java.util.List;

public interface NfcTagService {
    NfcTagResponse registerTag(NfcTagRegisterRequest request);
    NfcTagResponse linkToCard(Long tagId, NfcTagLinkRequest request);
    NfcTagResponse unlinkFromCard(Long tagId);
    NfcTagResponse deactivateTag(Long tagId, String status);
    NfcTagResponse replaceTag(Long oldTagId, NfcTagRegisterRequest newTagRequest);
    List<NfcTagResponse> getTagsByUserId(Long userId);
    NfcTagResponse getTagById(Long tagId);
    NfcTagResponse getTagByUid(String uid);
    void deleteTag(Long tagId);
}
