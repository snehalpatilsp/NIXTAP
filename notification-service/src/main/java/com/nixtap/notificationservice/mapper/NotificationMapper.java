package com.nixtap.notificationservice.mapper;

import com.nixtap.notificationservice.dto.response.NotificationLogResponse;
import com.nixtap.notificationservice.dto.response.NotificationPreferenceResponse;
import com.nixtap.notificationservice.entity.NotificationLog;
import com.nixtap.notificationservice.entity.NotificationPreference;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface NotificationMapper {
    NotificationPreferenceResponse toPreferenceResponse(NotificationPreference entity);
    NotificationLogResponse toLogResponse(NotificationLog entity);
}
