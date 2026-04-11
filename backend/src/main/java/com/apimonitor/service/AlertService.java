package com.apimonitor.service;

import com.apimonitor.model.AlertHistory;
import com.apimonitor.model.AlertRule;
import com.apimonitor.model.ApiEndpoint;
import com.apimonitor.model.MonitoringResult;
import com.apimonitor.repository.AlertHistoryRepository;
import com.apimonitor.repository.AlertRuleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AlertService {

    private final AlertRuleRepository alertRuleRepository;
    private final AlertHistoryRepository alertHistoryRepository;
    private final JavaMailSender mailSender;
    private final RestTemplate restTemplate;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    @Value("${app.base-url:http://localhost:3000}")
    private String appBaseUrl;

    @Async
    public void sendDownAlert(ApiEndpoint endpoint, MonitoringResult result) {
        List<AlertRule> rules = alertRuleRepository.findByEndpointAndActiveTrue(endpoint);
        if (rules.isEmpty()) return;

        String subject = "[DOWN] " + endpoint.getName() + " is not responding";
        String message = buildAlertMessage(endpoint, result);

        for (AlertRule rule : rules) {
            if (rule.getAlertType() == AlertRule.AlertType.EMAIL) {
                sendEmail(rule.getDestination(), subject, message, endpoint, rule);
            } else if (rule.getAlertType() == AlertRule.AlertType.WEBHOOK) {
                sendWebhook(rule.getDestination(), buildWebhookPayload(endpoint, result), endpoint, rule);
            }
        }
    }

    private void sendEmail(String to, String subject, String text, ApiEndpoint endpoint, AlertRule rule) {
        boolean success = true;
        String errorMsg = null;
        try {
            SimpleMailMessage mail = new SimpleMailMessage();
            mail.setFrom(fromEmail);
            mail.setTo(to);
            mail.setSubject(subject);
            mail.setText(text);
            mailSender.send(mail);
            log.info("Alert email sent to {} for endpoint {}", to, endpoint.getName());
        } catch (MailException e) {
            success = false;
            errorMsg = e.getMessage();
            log.error("Failed to send alert email to {}: {}", to, e.getMessage());
        }

        alertHistoryRepository.save(AlertHistory.builder()
            .endpoint(endpoint)
            .alertType(AlertRule.AlertType.EMAIL)
            .destination(to)
            .message(success ? subject : "FAILED: " + errorMsg)
            .success(success)
            .build());
    }

    private void sendWebhook(String url, String payload, ApiEndpoint endpoint, AlertRule rule) {
        boolean success = true;
        String errorMsg = null;
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> entity = new HttpEntity<>(payload, headers);
            restTemplate.postForEntity(url, entity, String.class);
            log.info("Webhook alert sent to {} for endpoint {}", url, endpoint.getName());
        } catch (Exception e) {
            success = false;
            errorMsg = e.getMessage();
            log.error("Failed to send webhook to {}: {}", url, e.getMessage());
        }

        alertHistoryRepository.save(AlertHistory.builder()
            .endpoint(endpoint)
            .alertType(AlertRule.AlertType.WEBHOOK)
            .destination(url)
            .message(success ? "Webhook delivered" : "FAILED: " + errorMsg)
            .success(success)
            .build());
    }

    private String buildAlertMessage(ApiEndpoint endpoint, MonitoringResult result) {
        return String.format("""
            ⚠️  API DOWN ALERT

            Endpoint:     %s
            URL:          %s
            Status Code:  %s
            Error:        %s
            Response Time: %s ms
            Time:         %s

            View details: %s/endpoints/%s

            ---
            APIMonitor - Business API Reliability Platform
            """,
            endpoint.getName(),
            endpoint.getUrl(),
            result.getStatusCode() != null ? result.getStatusCode() : "N/A",
            result.getErrorMessage() != null ? result.getErrorMessage() : "N/A",
            result.getResponseTimeMs() != null ? result.getResponseTimeMs() : "N/A",
            result.getCheckedAt(),
            appBaseUrl, endpoint.getId()
        );
    }

    private String buildWebhookPayload(ApiEndpoint endpoint, MonitoringResult result) {
        return String.format("""
            {
              "event": "endpoint.down",
              "endpoint": {
                "id": "%s",
                "name": "%s",
                "url": "%s"
              },
              "result": {
                "statusCode": %s,
                "responseTimeMs": %s,
                "errorMessage": "%s",
                "checkedAt": "%s"
              }
            }""",
            endpoint.getId(),
            endpoint.getName(),
            endpoint.getUrl(),
            result.getStatusCode() != null ? result.getStatusCode() : "null",
            result.getResponseTimeMs() != null ? result.getResponseTimeMs() : "null",
            result.getErrorMessage() != null ? result.getErrorMessage().replace("\"", "'") : "",
            result.getCheckedAt()
        );
    }
}
