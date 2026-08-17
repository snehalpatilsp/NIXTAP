package com.nixtap.businesscardservice.mapper;

import com.nixtap.businesscardservice.dto.request.BusinessCardRequest;
import com.nixtap.businesscardservice.dto.response.BusinessCardResponse;
import com.nixtap.businesscardservice.entity.BusinessCard;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface BusinessCardMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "userId", ignore = true)   // set by service from authenticated principal
    @Mapping(target = "slug", ignore = true)     // generated or validated by service
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    BusinessCard toEntity(BusinessCardRequest request);

    BusinessCardResponse toResponse(BusinessCard entity);

    java.util.List<BusinessCardResponse> toResponseList(java.util.List<BusinessCard> entities);
}