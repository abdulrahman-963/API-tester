package com.apimonitor.dto.monitoring;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EndpointStatsResponse {
    private double uptimePercent;
    private double avgResponseTimeMs;
    private long totalChecks;
    private long failureCount;
    private long errorCount;
    /** Period in hours these stats cover */
    private int periodHours;
}
