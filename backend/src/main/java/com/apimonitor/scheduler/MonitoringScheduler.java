package com.apimonitor.scheduler;

import com.apimonitor.model.ApiEndpoint;
import com.apimonitor.repository.ApiEndpointRepository;
import com.apimonitor.service.MonitoringService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class MonitoringScheduler {

    private final ApiEndpointRepository endpointRepository;
    private final MonitoringService monitoringService;

    /**
     * Runs every minute. For each active endpoint, checks whether
     * enough time has elapsed since the last check to trigger a new one.
     */
    @Scheduled(fixedDelay = 60_000)
    public void runScheduledChecks() {
        List<ApiEndpoint> activeEndpoints = endpointRepository.findByActiveTrue();
        log.debug("Scheduler tick — {} active endpoint(s)", activeEndpoints.size());

        for (ApiEndpoint endpoint : activeEndpoints) {
            try {
                if (isDue(endpoint)) {
                    log.debug("Checking endpoint: {} [{}]", endpoint.getName(), endpoint.getUrl());
                    monitoringService.checkEndpoint(endpoint, false);
                }
            } catch (Exception e) {
                log.error("Scheduler error for endpoint {}: {}", endpoint.getId(), e.getMessage());
            }
        }
    }

    private boolean isDue(ApiEndpoint endpoint) {
        if (endpoint.getLastCheckedAt() == null) return true;

        Instant nextCheck = endpoint.getLastCheckedAt()
            .plus(endpoint.getCheckIntervalMinutes(), ChronoUnit.MINUTES);

        return Instant.now().isAfter(nextCheck);
    }
}
