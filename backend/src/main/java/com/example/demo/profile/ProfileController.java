package com.example.demo.profile;

import com.example.demo.profile.dto.ProfileRequest;
import com.example.demo.profile.dto.ProfileResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * First genuinely protected controller in the project.
 *
 * @AuthenticationPrincipal UUID userId — this works because:
 *   1. SecurityConfig requires auth for everything outside /auth/**
 *   2. JwtAuthFilter validates the Bearer token and calls
 *      SecurityContextHolder.getContext().setAuthentication(
 *          new UsernamePasswordAuthenticationToken(userId, null, ...)
 *      )
 *   3. @AuthenticationPrincipal retrieves that same UUID from the context
 *
 * No manual token parsing here. No new security configuration needed.
 * Every future protected controller (Workout, Nutrition, Dashboard) copies
 * this exact one-line pattern.
 */
@RestController
@RequestMapping("/profile")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping
    public ResponseEntity<ProfileResponse> getProfile(@AuthenticationPrincipal UUID userId) {
        return ResponseEntity.ok(profileService.getProfile(userId));
    }

    @PutMapping
    public ResponseEntity<ProfileResponse> updateProfile(
            @AuthenticationPrincipal UUID userId,
            @Valid @RequestBody ProfileRequest request) {
        return ResponseEntity.ok(profileService.upsertProfile(userId, request));
    }
}
