package com.apimonitor.service;

import com.apimonitor.dto.monitoring.EndpointStatsResponse;
import com.apimonitor.dto.monitoring.MonitoringResultResponse;
import com.apimonitor.exception.ApiException;
import com.apimonitor.model.ApiEndpoint;
import com.apimonitor.model.MonitoringResult;
import com.apimonitor.model.User;
import com.apimonitor.repository.ApiEndpointRepository;
import com.apimonitor.repository.MonitoringResultRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class MonitoringService {

    private final MonitoringResultRepository resultRepository;
    private final ApiEndpointRepository endpointRepository;
    private final RestTemplate restTemplate;
    private final AlertService alertService;

    /** Run a scheduled or on-demand check on an endpoint */
    @Transactional
    public MonitoringResult checkEndpoint(ApiEndpoint endpoint, boolean onDemand) {
        long start = System.currentTimeMillis();
        MonitoringResult.MonitoringResultBuilder resultBuilder = MonitoringResult.builder()
            .endpoint(endpoint)
            .onDemand(onDemand)
            .checkedAt(Instant.now());

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> entity = new HttpEntity<>(endpoint.getRequestBody(), headers);

            ResponseEntity<String> response = restTemplate.exchange(
                endpoint.getUrl(),
                org.springframework.http.HttpMethod.valueOf(endpoint.getMethod().name()),
                entity,
                String.class
            );

            long responseTime = System.currentTimeMillis() - start;
            boolean isUp = response.getStatusCode().value() == endpoint.getExpectedStatus();

            String bodyPreview = null;
            if (response.getBody() != null) {
                bodyPreview = response.getBody().length() > 500
                    ? response.getBody().substring(0, 500) + "..."
                    : response.getBody();
            }

            resultBuilder
                .status(isUp ? ApiEndpoint.EndpointStatus.UP : ApiEndpoint.EndpointStatus.DOWN)
                .statusCode(response.getStatusCode().value())
                .responseTimeMs(responseTime)
                .responseBodyPreview(bodyPreview)
                .errorMessage(isUp ? null : "Unexpected status: " + response.getStatusCode().value()
                    + " (expected " + endpoint.getExpectedStatus() + ")");

        } catch (ResourceAccessException e) {
            long responseTime = System.currentTimeMillis() - start;
            String msg = responseTime >= endpoint.getTimeoutMs()
                ? "Request timed out after " + responseTime + "ms"
                : "Connection failed: " + e.getMessage();

            resultBuilder
                .status(ApiEndpoint.EndpointStatus.DOWN)
                .responseTimeMs(responseTime)
                .errorMessage(msg);

        } catch (Exception e) {
            resultBuilder
                .status(ApiEndpoint.EndpointStatus.DOWN)
                .responseTimeMs(System.currentTimeMillis() - start)
                .errorMessage("Error: " + e.getMessage());
        }

        MonitoringResult result = resultRepository.save(resultBuilder.build());

        // Update endpoint's last status
        boolean wasDown = endpoint.getLastStatus() == ApiEndpoint.EndpointStatus.DOWN;
        boolean isNowDown = result.getStatus() == ApiEndpoint.EndpointStatus.DOWN;

        endpoint.setLastStatus(result.getStatus());
        endpoint.setLastCheckedAt(result.getCheckedAt());
        endpointRepository.save(endpoint);

        // Send alert only when transitioning from UP → DOWN (not on every check)
        if (isNowDown ) {
            alertService.sendDownAlert(endpoint, result);
        }

        return result;
    }

    @Transactional(readOnly = true)
    public Page<MonitoringResultResponse> getHistory(UUID endpointId, User user, int page, int size) {
        ApiEndpoint endpoint = endpointRepository.findByIdAndUser(endpointId, user)
            .orElseThrow(() -> ApiException.notFound("Endpoint"));

        return resultRepository
            .findByEndpointOrderByCheckedAtDesc(endpoint, PageRequest.of(page, size))
            .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public MonitoringResultResponse runOnDemandTest(UUID endpointId, User user) {
        ApiEndpoint endpoint = endpointRepository.findByIdAndUser(endpointId, user)
            .orElseThrow(() -> ApiException.notFound("Endpoint"));

        MonitoringResult result = checkEndpoint(endpoint, true);
        return toResponse(result);
    }

    public EndpointStatsResponse getStats(ApiEndpoint endpoint, int periodHours) {
        Instant since = Instant.now().minus(periodHours, ChronoUnit.HOURS);

        long total = resultRepository.countTotalSince(endpoint, since);
        long upCount = resultRepository.countUpSince(endpoint, since);
        long errors = resultRepository.countErrorsSince(endpoint, since);
        Double avgResponseTime = resultRepository.avgResponseTimeSince(endpoint, since);

        double uptime = total > 0 ? (double) upCount / total * 100.0 : 0.0;

        return EndpointStatsResponse.builder()
            .uptimePercent(Math.round(uptime * 100.0) / 100.0)
            .avgResponseTimeMs(avgResponseTime != null ? Math.round(avgResponseTime * 100.0) / 100.0 : 0.0)
            .totalChecks(total)
            .failureCount(total - upCount)
            .errorCount(errors)
            .periodHours(periodHours)
            .build();
    }

    private MonitoringResultResponse toResponse(MonitoringResult r) {
        return MonitoringResultResponse.builder()
            .id(r.getId())
            .status(r.getStatus())
            .statusCode(r.getStatusCode())
            .responseTimeMs(r.getResponseTimeMs())
            .errorMessage(r.getErrorMessage())
            .responseBodyPreview(r.getResponseBodyPreview())
            .onDemand(r.isOnDemand())
            .checkedAt(r.getCheckedAt())
            .build();
    }
}
