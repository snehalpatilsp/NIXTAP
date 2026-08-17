package com.nixtap.adminservice.dto.feign;

import lombok.Data;

@Data
public class BusinessCardSummary {
    private Long id;
    private Long userId;
    private String cardTitle;
    private String company;
    private String slug;
    private boolean isPublic;
}
