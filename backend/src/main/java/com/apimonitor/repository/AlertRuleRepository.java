package com.apimonitor.repository;

import com.apimonitor.model.AlertRule;
import com.apimonitor.model.ApiEndpoint;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AlertRuleRepository extends JpaRepository<AlertRule, UUID> {
    List<AlertRule> findByEndpointAndActiveTrue(ApiEndpoint endpoint);
    List<AlertRule> findByEndpoint(ApiEndpoint endpoint);
}
