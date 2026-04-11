package com.apimonitor.controller;

import com.apimonitor.dto.monitoring.EndpointStatsResponse;
import com.apimonitor.dto.monitoring.MonitoringResultResponse;
import com.apimonitor.model.ApiEndpoint;
import com.apimonitor.model.User;
import com.apimonitor.repository.ApiEndpointRepository;
import com.apimonitor.service.MonitoringService;
import com.apimonitor.exception.ApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/endpoints/{endpointId}")
@RequiredArgsConstructor
public class MonitoringController {

    private final MonitoringService monitoringService;
    private final ApiEndpointRepository endpointRepository;

    /** Run an on-demand test immediately */
    @PostMapping("/test")
    public ResponseEntity<MonitoringResultResponse> runTest(
        @PathVariable UUID endpointId,
        @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(monitoringService.runOnDemandTest(endpointId, user));
    }

    /** Paginated check history */
    @GetMapping("/results")
    public ResponseEntity<Page<MonitoringResultResponse>> getHistory(
        @PathVariable UUID endpointId,
        @AuthenticationPrincipal User user,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(monitoringService.getHistory(endpointId, user, page, Math.min(size, 100)));
    }

    /** Uptime stats for the last N hours (default 24) */
    @GetMapping("/stats")
    public ResponseEntity<EndpointStatsResponse> getStats(
        @PathVariable UUID endpointId,
        @AuthenticationPrincipal User user,
        @RequestParam(defaultValue = "24") int hours
    ) {
        ApiEndpoint endpoint = endpointRepository.findByIdAndUser(endpointId, user)
            .orElseThrow(() -> ApiException.notFound("Endpoint"));
        return ResponseEntity.ok(monitoringService.getStats(endpoint, Math.min(hours, 720)));
    }
}
