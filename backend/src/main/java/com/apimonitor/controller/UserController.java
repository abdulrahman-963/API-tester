package com.apimonitor.controller;

import com.apimonitor.dto.user.UserProfileResponse;
import com.apimonitor.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> me(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(new UserProfileResponse(
                user.getId().toString(),
                user.getEmail(),
                user.getFullName(),
                user.getPlan().name()
        ));
    }
}