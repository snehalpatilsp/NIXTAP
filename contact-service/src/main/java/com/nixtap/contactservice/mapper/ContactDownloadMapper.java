package com.nixtap.contactservice.mapper;

import com.nixtap.contactservice.dto.response.ContactDownloadResponse;
import com.nixtap.contactservice.entity.ContactDownload;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ContactDownloadMapper {
    ContactDownloadResponse toResponse(ContactDownload entity);
}
