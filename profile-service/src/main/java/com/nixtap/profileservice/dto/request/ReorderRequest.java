package com.nixtap.profileservice.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReorderRequest {
    @NotNull(message = "id is required")
    private Long id;

    @NotNull(message = "sortOrder is required")
    private Integer sortOrder;
}
