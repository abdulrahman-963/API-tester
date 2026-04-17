package com.apimonitor.controller;

import com.apimonitor.dto.endpoint.CreateEndpointRequest;
import com.apimonitor.dto.endpoint.EndpointResponse;
import com.apimonitor.dto.endpoint.UpdateEndpointRequest;
import com.apimonitor.model.User;
import com.apimonitor.service.EndpointService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Page;

import java.util.UUID;

@RestController
@RequestMapping("/api/endpoints")
@RequiredArgsConstructor
public class EndpointController {

    private final EndpointService endpointService;

    @GetMapping
    public ResponseEntity<Page<EndpointResponse>> list(
        @AuthenticationPrincipal User user,
        @RequestParam(defaultValue = "0")  int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(endpointService.listEndpoints(user, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EndpointResponse> get(
        @PathVariable UUID id,
        @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(endpointService.getEndpoint(id, user));
    }

    @PostMapping
    public ResponseEntity<EndpointResponse> create(
        @Valid @RequestBody CreateEndpointRequest req,
        @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(endpointService.createEndpoint(req, user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EndpointResponse> update(
        @PathVariable UUID id,
        @Valid @RequestBody UpdateEndpointRequest req,
        @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(endpointService.updateEndpoint(id, req, user));
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<EndpointResponse> toggle(
        @PathVariable UUID id,
        @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(endpointService.toggleEndpoint(id, user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
        @PathVariable UUID id,
        @AuthenticationPrincipal User user
    ) {
        endpointService.deleteEndpoint(id, user);
        return ResponseEntity.noContent().build();
    }
}
