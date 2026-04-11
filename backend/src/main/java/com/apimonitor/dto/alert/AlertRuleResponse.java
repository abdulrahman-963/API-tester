package com.apimonitor.dto.alert;

import com.apimonitor.model.AlertRule;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class AlertRuleResponse {
    private UUID id;
    private AlertRule.AlertType alertType;
    private String destination;
    private boolean active;
    private Instant createdAt;
}
