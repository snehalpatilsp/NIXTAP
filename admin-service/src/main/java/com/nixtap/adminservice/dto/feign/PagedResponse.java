package com.nixtap.adminservice.dto.feign;

import lombok.Data;

import java.util.List;

/**
 * Generic paged wrapper for Feign responses from paginated endpoints.
 * Mirrors the Spring Page object structure without requiring the full Page type.
 */
@Data
public class PagedResponse<T> {
    private List<T> content;
    private int totalPages;
    private long totalElements;
    private int number;
    private int size;
}
