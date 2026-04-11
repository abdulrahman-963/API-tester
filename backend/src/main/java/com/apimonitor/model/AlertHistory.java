package com.apimonitor.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "alert_history")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AlertHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "endpoint_id", nullable = false)
    private ApiEndpoint endpoint;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AlertRule.AlertType alertType;

    @Column(nullable = false, length = 500)
    private String destination;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private Instant sentAt = Instant.now();

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false)
    @Builder.Default
    private boolean success = true;
}
