package com.apimonitor.dto.endpoint;

import com.apimonitor.model.ApiEndpoint;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CreateEndpointRequest {

    @NotBlank
    @Size(max = 200)
    private String name;

    @NotBlank
    @Size(max = 2048)
    @Pattern(regexp = "^https?://.*", message = "URL must start with http:// or https://")
    private String url;

    private ApiEndpoint.HttpMethod method = ApiEndpoint.HttpMethod.GET;

    @Min(1) @Max(60)
    private int checkIntervalMinutes = 5;

    @Min(100) @Max(599)
    private int expectedStatus = 200;

    @Min(1000) @Max(30000)
    private int timeoutMs = 5000;

    private String requestBody;
    private String requestHeaders;
}
