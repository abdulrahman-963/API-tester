package com.apimonitor.dto.endpoint;

import com.apimonitor.model.ApiEndpoint;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class EndpointResponse {
    private UUID id;
    private String name;
    private String url;
    private ApiEndpoint.HttpMethod method;
    private int checkIntervalMinutes;
    private int expectedStatus;
    private int timeoutMs;
    private boolean active;
    private ApiEndpoint.EndpointStatus lastStatus;
    private Instant lastCheckedAt;
    private Instant createdAt;
    private Instant updatedAt;
    // Live stats (optional — populated when fetching single endpoint)
    private Double uptimePercent;
    private Double avgResponseTimeMs;
    private Long failureCount;
}
