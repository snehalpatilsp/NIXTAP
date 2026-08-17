package com.nixtap.portfolioservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


import java.time.LocalDateTime;


@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProjectResponse {

    private Long id;
    private Long userId;
    private String title;
    private String description;
    private String projectUrl;
    private String githubUrl;
    private String imageUrl;
    private String technologies;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}










