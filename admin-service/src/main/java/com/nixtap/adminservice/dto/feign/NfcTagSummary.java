package com.nixtap.adminservice.dto.feign;

import lombok.Data;

@Data
public class NfcTagSummary {
    private Long id;
    private Long userId;
    private String tagUid;
    private String status;
}
