package com.apimonitor.repository;

import com.apimonitor.model.ApiEndpoint;
import com.apimonitor.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ApiEndpointRepository extends JpaRepository<ApiEndpoint, UUID> {

    List<ApiEndpoint> findByUserOrderByCreatedAtDesc(User user);

    Optional<ApiEndpoint> findByIdAndUser(UUID id, User user);

    List<ApiEndpoint> findByActiveTrue();

    @Query("SELECT COUNT(e) FROM ApiEndpoint e WHERE e.user = :user AND e.active = true")
    long countActiveByUser(@Param("user") User user);
}
