package com.nixtap.adminservice.mapper;

import com.nixtap.adminservice.dto.response.AdminAuditLogResponse;
import com.nixtap.adminservice.entity.AdminAuditLog;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AdminAuditLogMapper {
    AdminAuditLogResponse toResponse(AdminAuditLog entity);
}
