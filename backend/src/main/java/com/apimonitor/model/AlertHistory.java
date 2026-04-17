package com.apimonitor.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "alert_history")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AlertHistory extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "endpoint_id", nullable = false)
    private ApiEndpoint endpoint;

    @Enumerated(EnumType.STRING)
    @Column(name="alert_type", nullable = false, length = 20)
    private AlertRule.AlertType alertType;

    @Column(nullable = false, length = 500)
    private String destination;

    @Column(name="sent_at", nullable = false, updatable = false)
    @Builder.Default
    private Instant sentAt = Instant.now();

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false)
    @Builder.Default
    private boolean success = true;
}
