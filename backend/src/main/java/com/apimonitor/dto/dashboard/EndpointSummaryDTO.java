package com.apimonitor.dto.dashboard;

import com.apimonitor.model.ApiEndpoint;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class EndpointSummaryDTO {
    private UUID id;
    private String name;
    private String url;
    private ApiEndpoint.EndpointStatus status;
    private Double uptimePercent;
    private Double avgResponseTimeMs;
    private Long failureCount;
    private Instant lastCheckedAt;
    private boolean active;
}
