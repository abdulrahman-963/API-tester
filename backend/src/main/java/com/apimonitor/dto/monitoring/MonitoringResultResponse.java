package com.apimonitor.dto.monitoring;

import com.apimonitor.model.ApiEndpoint;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class MonitoringResultResponse {
    private UUID id;
    private ApiEndpoint.EndpointStatus status;
    private Integer statusCode;
    private Long responseTimeMs;
    private String errorMessage;
    private String responseBodyPreview;
    private boolean onDemand;
    private Instant checkedAt;
}
