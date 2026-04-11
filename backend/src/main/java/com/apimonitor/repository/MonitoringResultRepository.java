package com.apimonitor.repository;

import com.apimonitor.model.ApiEndpoint;
import com.apimonitor.model.MonitoringResult;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MonitoringResultRepository extends JpaRepository<MonitoringResult, UUID> {

    Page<MonitoringResult> findByEndpointOrderByCheckedAtDesc(ApiEndpoint endpoint, Pageable pageable);

    Optional<MonitoringResult> findFirstByEndpointOrderByCheckedAtDesc(ApiEndpoint endpoint);

    @Query("SELECT COUNT(r) FROM MonitoringResult r WHERE r.endpoint = :endpoint AND r.status = 'UP' AND r.checkedAt >= :since")
    long countUpSince(@Param("endpoint") ApiEndpoint endpoint, @Param("since") Instant since);

    @Query("SELECT COUNT(r) FROM MonitoringResult r WHERE r.endpoint = :endpoint AND r.checkedAt >= :since")
    long countTotalSince(@Param("endpoint") ApiEndpoint endpoint, @Param("since") Instant since);

    @Query("SELECT AVG(r.responseTimeMs) FROM MonitoringResult r WHERE r.endpoint = :endpoint AND r.checkedAt >= :since AND r.responseTimeMs IS NOT NULL")
    Double avgResponseTimeSince(@Param("endpoint") ApiEndpoint endpoint, @Param("since") Instant since);

    @Query("SELECT COUNT(r) FROM MonitoringResult r WHERE r.endpoint = :endpoint AND r.statusCode >= 400 AND r.checkedAt >= :since")
    long countErrorsSince(@Param("endpoint") ApiEndpoint endpoint, @Param("since") Instant since);

    List<MonitoringResult> findTop5ByEndpointOrderByCheckedAtDesc(ApiEndpoint endpoint);

    @Query("SELECT r FROM MonitoringResult r WHERE r.endpoint.user.id = :userId AND r.onDemand = true ORDER BY r.checkedAt DESC")
    List<MonitoringResult> findRecentOnDemandByUser(@Param("userId") UUID userId, Pageable pageable);
}
