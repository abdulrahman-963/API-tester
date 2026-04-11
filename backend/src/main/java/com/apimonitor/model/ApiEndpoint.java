package com.apimonitor.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "api_endpoints")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ApiEndpoint {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, length = 2048)
    private String url;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    @Builder.Default
    private HttpMethod method = HttpMethod.GET;

    /** Interval in minutes: 1, 5, or 10 */
    @Column(nullable = false)
    @Builder.Default
    private int checkIntervalMinutes = 5;

    @Column(nullable = false)
    @Builder.Default
    private int expectedStatus = 200;

    /** Timeout in milliseconds */
    @Column(nullable = false)
    @Builder.Default
    private int timeoutMs = 5000;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    /** Optional request body (JSON string) for POST/PUT checks */
    @Column(columnDefinition = "TEXT")
    private String requestBody;

    /** Optional custom headers (JSON string) */
    @Column(columnDefinition = "TEXT")
    private String requestHeaders;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    @Builder.Default
    private EndpointStatus lastStatus = EndpointStatus.UNKNOWN;

    private Instant lastCheckedAt;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(nullable = false)
    @Builder.Default
    private Instant updatedAt = Instant.now();

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public enum HttpMethod {
        GET, POST, PUT, DELETE, PATCH, HEAD
    }

    public enum EndpointStatus {
        UP, DOWN, UNKNOWN
    }
}
