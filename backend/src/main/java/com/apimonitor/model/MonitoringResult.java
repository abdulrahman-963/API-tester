package com.apimonitor.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "monitoring_results", indexes = {
    @Index(name = "idx_monitoring_endpoint_checked", columnList = "endpoint_id, checked_at DESC")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MonitoringResult extends BaseEntity {


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "endpoint_id", nullable = false)
    private ApiEndpoint endpoint;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private ApiEndpoint.EndpointStatus status;

    @Column(name="status_code")
    private Integer statusCode;

    /** Response time in milliseconds */
    @Column(name="response_Time_Ms")
    private Long responseTimeMs;

    @Column(name="error_message", columnDefinition = "TEXT")
    private String errorMessage;

    /** Preview of response body (first 500 chars) */
    @Column(name="response_Body_Preview", columnDefinition = "TEXT")
    private String responseBodyPreview;

    /** true = triggered manually by user; false = scheduled check */
    @Column(name="on_demand", nullable = false)
    @Builder.Default
    private boolean onDemand = false;

    @Column(name="checked_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant checkedAt = Instant.now();
}
