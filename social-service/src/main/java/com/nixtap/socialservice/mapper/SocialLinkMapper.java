package com.nixtap.socialservice.mapper;

import com.nixtap.socialservice.dto.response.SocialLinkResponse;
import com.nixtap.socialservice.entity.SocialLink;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface SocialLinkMapper {
    SocialLinkResponse toResponse(SocialLink entity);
}
