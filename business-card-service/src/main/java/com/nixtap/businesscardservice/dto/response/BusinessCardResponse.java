package com.nixtap.businesscardservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BusinessCardResponse {

    private Long id;
    private Long userId;
    private String cardTitle;
    private String company;
    private String designation;
    private String theme;
    private String slug;
    private boolean isPublic;
    private String profileImage;
    private String coverImage;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}