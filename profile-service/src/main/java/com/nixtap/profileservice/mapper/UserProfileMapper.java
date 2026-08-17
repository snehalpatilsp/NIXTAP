package com.nixtap.profileservice.mapper;

import com.nixtap.profileservice.dto.request.UserProfileRequest;
import com.nixtap.profileservice.dto.response.UserProfileResponse;
import com.nixtap.profileservice.entity.UserProfile;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserProfileMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    UserProfile toEntity(UserProfileRequest request);

    UserProfileResponse toResponse(UserProfile entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromRequest(UserProfileRequest request, @org.mapstruct.MappingTarget UserProfile entity);
}