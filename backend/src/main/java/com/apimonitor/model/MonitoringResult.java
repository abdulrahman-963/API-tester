package com.apimonitor.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "monitoring_results", indexes = {
    @Index(name = "idx_monitoring_endpoint_checked", columnList = "endpoint_id, checked_at DESC")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MonitoringResult {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "endpoint_id", nullable = false)
    private ApiEndpoint endpoint;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private ApiEndpoint.EndpointStatus status;

    private Integer statusCode;

    /** Response time in milliseconds */
    private Long responseTimeMs;

    @Column(columnDefinition = "TEXT")
    private String errorMessage;

    /** Preview of response body (first 500 chars) */
    @Column(columnDefinition = "TEXT")
    private String responseBodyPreview;

    /** true = triggered manually by user; false = scheduled check */
    @Column(nullable = false)
    @Builder.Default
    private boolean onDemand = false;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private Instant checkedAt = Instant.now();
}
