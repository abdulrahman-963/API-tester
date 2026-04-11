package com.apimonitor.service;

import com.apimonitor.dto.dashboard.DashboardSummaryResponse;
import com.apimonitor.dto.dashboard.EndpointSummaryDTO;
import com.apimonitor.model.ApiEndpoint;
import com.apimonitor.model.User;
import com.apimonitor.repository.ApiEndpointRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ApiEndpointRepository endpointRepository;
    private final MonitoringService monitoringService;

    @Transactional(readOnly = true)
    public DashboardSummaryResponse getSummary(User user) {
        List<ApiEndpoint> endpoints = endpointRepository.findByUserOrderByCreatedAtDesc(user);

        long up = endpoints.stream()
            .filter(e -> e.getLastStatus() == ApiEndpoint.EndpointStatus.UP).count();
        long down = endpoints.stream()
            .filter(e -> e.getLastStatus() == ApiEndpoint.EndpointStatus.DOWN).count();
        long unknown = endpoints.stream()
            .filter(e -> e.getLastStatus() == ApiEndpoint.EndpointStatus.UNKNOWN).count();

        double overallUptime = endpoints.isEmpty() ? 0.0
            : endpoints.stream()
                .mapToDouble(ep -> monitoringService.getStats(ep, 24).getUptimePercent())
                .average()
                .orElse(0.0);

        List<EndpointSummaryDTO> summaries = endpoints.stream()
            .map(ep -> {
                var stats = monitoringService.getStats(ep, 24);
                return EndpointSummaryDTO.builder()
                    .id(ep.getId())
                    .name(ep.getName())
                    .url(ep.getUrl())
                    .status(ep.getLastStatus())
                    .uptimePercent(stats.getUptimePercent())
                    .avgResponseTimeMs(stats.getAvgResponseTimeMs())
                    .failureCount(stats.getFailureCount())
                    .lastCheckedAt(ep.getLastCheckedAt())
                    .active(ep.isActive())
                    .build();
            })
            .collect(Collectors.toList());

        return DashboardSummaryResponse.builder()
            .totalEndpoints(endpoints.size())
            .upEndpoints(up)
            .downEndpoints(down)
            .unknownEndpoints(unknown)
            .overallUptimePercent(Math.round(overallUptime * 100.0) / 100.0)
            .endpoints(summaries)
            .build();
    }
}
