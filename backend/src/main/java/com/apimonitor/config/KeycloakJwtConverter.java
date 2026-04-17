package com.apimonitor.config;

import com.apimonitor.model.User;
import com.apimonitor.service.UserSyncService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Component
@RequiredArgsConstructor
public class KeycloakJwtConverter implements Converter<Jwt, UsernamePasswordAuthenticationToken> {

    private final UserSyncService userSyncService;

    @Override
    public UsernamePasswordAuthenticationToken convert(Jwt jwt) {
        User user = userSyncService.syncFromJwt(jwt);
        return new UsernamePasswordAuthenticationToken(user, jwt, Collections.emptyList());
    }
}