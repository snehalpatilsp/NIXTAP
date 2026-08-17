package com.nixtap.themeservice.mapper;

import com.nixtap.themeservice.dto.response.ThemeResponse;
import com.nixtap.themeservice.entity.Theme;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ThemeMapper {
    ThemeResponse toResponse(Theme entity);
}
