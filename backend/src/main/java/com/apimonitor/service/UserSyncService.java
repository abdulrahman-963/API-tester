package com.apimonitor.service;

import com.apimonitor.model.User;
import com.apimonitor.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserSyncService {

    private final UserRepository userRepository;

    @Transactional
    public User syncFromJwt(Jwt jwt) {
        String keycloakId = jwt.getSubject();
        return userRepository.findByKeycloakId(keycloakId)
                .orElseGet(() -> createUser(jwt, keycloakId));
    }

    private User createUser(Jwt jwt, String keycloakId) {
        String email     = jwt.getClaimAsString("email");
        String fullName  = resolveFullName(jwt);

        return userRepository.save(User.builder()
                .keycloakId(keycloakId)
                .email(email != null ? email : keycloakId + "@keycloak.local")
                .fullName(fullName != null ? fullName : "Unknown")
                .plan(User.Plan.FREE)
                .active(true)
                .build());
    }

    private String resolveFullName(Jwt jwt) {
        String name = jwt.getClaimAsString("name");
        if (name != null && !name.isBlank()) return name;

        String given  = jwt.getClaimAsString("given_name");
        String family = jwt.getClaimAsString("family_name");
        if (given != null && family != null) return given + " " + family;
        if (given != null) return given;

        return jwt.getClaimAsString("preferred_username");
    }
}