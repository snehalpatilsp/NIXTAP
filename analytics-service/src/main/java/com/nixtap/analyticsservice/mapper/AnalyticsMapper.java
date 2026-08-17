package com.nixtap.analyticsservice.mapper;

import com.nixtap.analyticsservice.dto.response.AnalyticsEventResponse;
import com.nixtap.analyticsservice.entity.AnalyticsEvent;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AnalyticsMapper {

    /**
     * Maps a persisted AnalyticsEvent entity to an AnalyticsEventResponse DTO.
     * All fields map by name — no custom mappings needed.
     */
    AnalyticsEventResponse toResponse(AnalyticsEvent entity);
}
