package com.apimonitor.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "api_endpoints")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ApiEndpoint extends BaseEntity {



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
    @Column(name = "check_Interval_Minutes", nullable = false)
    @Builder.Default
    private int checkIntervalMinutes = 5;

    @Column(name="expected_Status", nullable = false)
    @Builder.Default
    private int expectedStatus = 200;

    /** Timeout in milliseconds */
    @Column(name="timeout_Ms", nullable = false)
    @Builder.Default
    private int timeoutMs = 5000;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    /** Optional request body (JSON string) for POST/PUT checks */
    @Column(name="request_Body", columnDefinition = "TEXT")
    private String requestBody;

    /** Optional custom headers (JSON string) */
    @Column(name="request_Headers", columnDefinition = "TEXT")
    private String requestHeaders;

    @Enumerated(EnumType.STRING)
    @Column(name="last_Status", nullable = false, length = 10)
    @Builder.Default
    private EndpointStatus lastStatus = EndpointStatus.UNKNOWN;

    @Column(name="last_Checked_At")
    private Instant lastCheckedAt;

    public enum HttpMethod {
        GET, POST, PUT, DELETE, PATCH, HEAD
    }

    public enum EndpointStatus {
        UP, DOWN, UNKNOWN
    }
}
