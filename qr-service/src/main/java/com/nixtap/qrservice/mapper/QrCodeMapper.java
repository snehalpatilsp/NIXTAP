package com.nixtap.qrservice.mapper;

import com.nixtap.qrservice.dto.response.QrCodeResponse;
import com.nixtap.qrservice.entity.QrCode;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface QrCodeMapper {

    /**
     * Maps a persisted QrCode entity to a QrCodeResponse DTO.
     * All fields map by name — no custom mappings needed.
     */
    QrCodeResponse toResponse(QrCode entity);
}
