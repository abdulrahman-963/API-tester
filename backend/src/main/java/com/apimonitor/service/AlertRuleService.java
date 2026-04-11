package com.apimonitor.service;

import com.apimonitor.dto.alert.AlertRuleResponse;
import com.apimonitor.dto.alert.CreateAlertRuleRequest;
import com.apimonitor.exception.ApiException;
import com.apimonitor.model.AlertRule;
import com.apimonitor.model.ApiEndpoint;
import com.apimonitor.model.User;
import com.apimonitor.repository.AlertRuleRepository;
import com.apimonitor.repository.ApiEndpointRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AlertRuleService {

    private final AlertRuleRepository alertRuleRepository;
    private final ApiEndpointRepository endpointRepository;

    @Transactional(readOnly = true)
    public List<AlertRuleResponse> listRules(UUID endpointId, User user) {
        ApiEndpoint endpoint = findOwned(endpointId, user);
        return alertRuleRepository.findByEndpoint(endpoint).stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    @Transactional
    public AlertRuleResponse createRule(UUID endpointId, CreateAlertRuleRequest req, User user) {
        ApiEndpoint endpoint = findOwned(endpointId, user);

        AlertRule rule = AlertRule.builder()
            .endpoint(endpoint)
            .alertType(req.getAlertType())
            .destination(req.getDestination())
            .build();

        return toResponse(alertRuleRepository.save(rule));
    }

    @Transactional
    public void deleteRule(UUID endpointId, UUID ruleId, User user) {
        findOwned(endpointId, user);
        AlertRule rule = alertRuleRepository.findById(ruleId)
            .orElseThrow(() -> ApiException.notFound("Alert rule"));
        if (!rule.getEndpoint().getId().equals(endpointId)) {
            throw ApiException.forbidden();
        }
        alertRuleRepository.delete(rule);
    }

    private ApiEndpoint findOwned(UUID endpointId, User user) {
        return endpointRepository.findByIdAndUser(endpointId, user)
            .orElseThrow(() -> ApiException.notFound("Endpoint"));
    }

    private AlertRuleResponse toResponse(AlertRule rule) {
        return AlertRuleResponse.builder()
            .id(rule.getId())
            .alertType(rule.getAlertType())
            .destination(rule.getDestination())
            .active(rule.isActive())
            .createdAt(rule.getCreatedAt())
            .build();
    }
}
