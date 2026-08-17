package com.nixtap.adminservice.dto.feign;

import lombok.Data;

@Data
public class UserSummary {
    private Long id;
    private String email;
    private String fullName;
    private String role;
    private boolean enabled;
    private boolean emailVerified;
    private String username;
    private boolean isPublic = true;
    private String designation;
    private String company;
    private String profileImage;
}
