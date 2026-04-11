package com.apimonitor.dto.dashboard;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class DashboardSummaryResponse {
    private long totalEndpoints;
    private long upEndpoints;
    private long downEndpoints;
    private long unknownEndpoints;
    private double overallUptimePercent;
    private List<EndpointSummaryDTO> endpoints;
}
