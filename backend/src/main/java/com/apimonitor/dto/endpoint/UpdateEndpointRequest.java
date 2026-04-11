package com.apimonitor.dto.endpoint;

import com.apimonitor.model.ApiEndpoint;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class UpdateEndpointRequest {

    @Size(max = 200)
    private String name;

    @Size(max = 2048)
    @Pattern(regexp = "^https?://.*", message = "URL must start with http:// or https://")
    private String url;

    private ApiEndpoint.HttpMethod method;

    @Min(1) @Max(60)
    private Integer checkIntervalMinutes;

    @Min(100) @Max(599)
    private Integer expectedStatus;

    @Min(1000) @Max(30000)
    private Integer timeoutMs;

    private String requestBody;
    private String requestHeaders;
}
