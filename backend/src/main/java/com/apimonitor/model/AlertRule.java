package com.apimonitor.model;

import jakarta.persistence.*;
import lombok.*;


@Entity
@Table(name = "alert_rules")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AlertRule extends BaseEntity {


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "endpoint_id", nullable = false)
    private ApiEndpoint endpoint;

    @Enumerated(EnumType.STRING)
    @Column(name="alert_type", nullable = false, length = 20)
    private AlertType alertType;

    /** Email address or webhook URL */
    @Column(nullable = false, length = 500)
    private String destination;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;


    public enum AlertType {
        EMAIL, WEBHOOK
    }
}
