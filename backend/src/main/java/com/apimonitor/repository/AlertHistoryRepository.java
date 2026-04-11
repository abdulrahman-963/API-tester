package com.apimonitor.repository;

import com.apimonitor.model.AlertHistory;
import com.apimonitor.model.ApiEndpoint;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AlertHistoryRepository extends JpaRepository<AlertHistory, UUID> {
    Page<AlertHistory> findByEndpointOrderBySentAtDesc(ApiEndpoint endpoint, Pageable pageable);
}
