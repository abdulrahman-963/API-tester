package com.apimonitor.service;

import com.apimonitor.dto.endpoint.CreateEndpointRequest;
import com.apimonitor.dto.endpoint.EndpointResponse;
import com.apimonitor.dto.endpoint.UpdateEndpointRequest;
import com.apimonitor.exception.ApiException;
import com.apimonitor.model.ApiEndpoint;
import com.apimonitor.model.User;
import com.apimonitor.repository.ApiEndpointRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EndpointService {

    private static final int FREE_PLAN_LIMIT = 15;

    private final ApiEndpointRepository endpointRepository;
    private final MonitoringService monitoringService;

    @Transactional(readOnly = true)
    public Page<EndpointResponse> listEndpoints(User user, int page, int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return endpointRepository.findByUser(user, pageable)
            .map(ep -> toResponse(ep, false));
    }

    @Transactional(readOnly = true)
    public EndpointResponse getEndpoint(UUID id, User user) {
        ApiEndpoint ep = findOwned(id, user);
        return toResponse(ep, true);
    }

    @Transactional
    public EndpointResponse createEndpoint(CreateEndpointRequest req, User user) {
        long active = endpointRepository.countActiveByUser(user);
        if (user.getPlan() == User.Plan.FREE && active >= FREE_PLAN_LIMIT) {
            throw ApiException.badRequest(
                "Free plan is limited to " + FREE_PLAN_LIMIT + " monitored endpoints. Please upgrade to Pro."
            );
        }

        ApiEndpoint ep = ApiEndpoint.builder()
            .user(user)
            .name(req.getName())
            .url(req.getUrl())
            .method(req.getMethod() != null ? req.getMethod() : ApiEndpoint.HttpMethod.GET)
            .checkIntervalMinutes(req.getCheckIntervalMinutes())
            .expectedStatus(req.getExpectedStatus())
            .timeoutMs(req.getTimeoutMs())
            .requestBody(req.getRequestBody())
            .requestHeaders(req.getRequestHeaders())
            .build();

        return toResponse(endpointRepository.save(ep), false);
    }

    @Transactional
    public EndpointResponse updateEndpoint(UUID id, UpdateEndpointRequest req, User user) {
        ApiEndpoint ep = findOwned(id, user);

        if (req.getName() != null) ep.setName(req.getName());
        if (req.getUrl() != null) ep.setUrl(req.getUrl());
        if (req.getMethod() != null) ep.setMethod(req.getMethod());
        if (req.getCheckIntervalMinutes() != null) ep.setCheckIntervalMinutes(req.getCheckIntervalMinutes());
        if (req.getExpectedStatus() != null) ep.setExpectedStatus(req.getExpectedStatus());
        if (req.getTimeoutMs() != null) ep.setTimeoutMs(req.getTimeoutMs());
        if (req.getRequestBody() != null) ep.setRequestBody(req.getRequestBody());
        if (req.getRequestHeaders() != null) ep.setRequestHeaders(req.getRequestHeaders());

        return toResponse(endpointRepository.save(ep), false);
    }

    @Transactional
    public EndpointResponse toggleEndpoint(UUID id, User user) {
        ApiEndpoint ep = findOwned(id, user);
        ep.setActive(!ep.isActive());
        return toResponse(endpointRepository.save(ep), false);
    }

    @Transactional
    public void deleteEndpoint(UUID id, User user) {
        ApiEndpoint ep = findOwned(id, user);
        endpointRepository.delete(ep);
    }

    private ApiEndpoint findOwned(UUID id, User user) {
        return endpointRepository.findByIdAndUser(id, user)
            .orElseThrow(() -> ApiException.notFound("Endpoint"));
    }

    private EndpointResponse toResponse(ApiEndpoint ep, boolean includeStats) {
        EndpointResponse.EndpointResponseBuilder builder = EndpointResponse.builder()
            .id(ep.getId())
            .name(ep.getName())
            .url(ep.getUrl())
            .method(ep.getMethod())
            .checkIntervalMinutes(ep.getCheckIntervalMinutes())
            .expectedStatus(ep.getExpectedStatus())
            .timeoutMs(ep.getTimeoutMs())
            .active(ep.isActive())
            .lastStatus(ep.getLastStatus())
            .lastCheckedAt(ep.getLastCheckedAt())
            .createdAt(ep.getCreatedAt())
            .updatedAt(ep.getUpdatedAt());

        if (includeStats) {
            var stats = monitoringService.getStats(ep, 24);
            builder
                .uptimePercent(stats.getUptimePercent())
                .avgResponseTimeMs(stats.getAvgResponseTimeMs())
                .failureCount(stats.getFailureCount());
        }

        return builder.build();
    }
}
