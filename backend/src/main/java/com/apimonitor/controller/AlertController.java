package com.apimonitor.controller;

import com.apimonitor.dto.alert.AlertRuleResponse;
import com.apimonitor.dto.alert.CreateAlertRuleRequest;
import com.apimonitor.model.User;
import com.apimonitor.service.AlertRuleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/endpoints/{endpointId}/alerts")
@RequiredArgsConstructor
public class AlertController {

    private final AlertRuleService alertRuleService;

    @GetMapping
    public ResponseEntity<List<AlertRuleResponse>> list(
        @PathVariable UUID endpointId,
        @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(alertRuleService.listRules(endpointId, user));
    }

    @PostMapping
    public ResponseEntity<AlertRuleResponse> create(
        @PathVariable UUID endpointId,
        @Valid @RequestBody CreateAlertRuleRequest req,
        @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(alertRuleService.createRule(endpointId, req, user));
    }

    @DeleteMapping("/{ruleId}")
    public ResponseEntity<Void> delete(
        @PathVariable UUID endpointId,
        @PathVariable UUID ruleId,
        @AuthenticationPrincipal User user
    ) {
        alertRuleService.deleteRule(endpointId, ruleId, user);
        return ResponseEntity.noContent().build();
    }
}
