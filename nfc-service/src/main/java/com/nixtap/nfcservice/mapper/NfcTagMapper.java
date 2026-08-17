package com.nixtap.nfcservice.mapper;

import com.nixtap.nfcservice.dto.response.NfcTagResponse;
import com.nixtap.nfcservice.entity.NfcTag;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface NfcTagMapper {
    NfcTagResponse toResponse(NfcTag entity);
}
