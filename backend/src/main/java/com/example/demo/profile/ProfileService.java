package com.example.demo.profile;

import com.example.demo.profile.dto.ProfileRequest;
import com.example.demo.profile.dto.ProfileResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final GoalCalculationService goalCalculationService;

    public ProfileService(ProfileRepository profileRepository,
                          GoalCalculationService goalCalculationService) {
        this.profileRepository = profileRepository;
        this.goalCalculationService = goalCalculationService;
    }

    /**
     * Returns the profile for the authenticated user.
     * Throws if no profile exists yet (first-time users must PUT first).
     */
    public ProfileResponse getProfile(UUID userId) {
        Profile profile = profileRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Profile not found. Please complete onboarding."));
        return toResponse(profile);
    }

    /**
     * Creates the profile on first call, updates it on subsequent calls.
     *
     * PUT semantics: idempotent create-or-replace — one method instead of
     * separate create/update, matching the single PUT /profile endpoint in the PRD.
     */
    @Transactional
    public ProfileResponse upsertProfile(UUID userId, ProfileRequest request) {
        Profile profile = profileRepository.findById(userId).orElse(null);

        if (profile == null) {
            // First time — create a new row using the userId copied from the authenticated user
            profile = new Profile(
                    userId,
                    request.age(),
                    request.heightCm(),
                    request.weightKg(),
                    request.gender(),
                    request.goal(),
                    request.activityLevel(),
                    request.experienceLevel()
            );
        } else {
            // Subsequent call — update all mutable fields in place
            profile.setAge(request.age());
            profile.setHeightCm(request.heightCm());
            profile.setWeightKg(request.weightKg());
            profile.setGender(request.gender());
            profile.setGoal(request.goal());
            profile.setActivityLevel(request.activityLevel());
            profile.setExperienceLevel(request.experienceLevel());
            profile.touchUpdatedAt();
        }

        profile = profileRepository.save(profile);
        return toResponse(profile);
    }

    /**
     * Converts a Profile entity to the response DTO.
     *
     * GoalTargets are always recalculated fresh from the current profile fields —
     * never stored in the database. This guarantees targets stay in sync if
     * weight, goal, or activity level changes. (Day 12 will add Redis caching
     * if per-request recalculation becomes a performance concern at scale.)
     */
    private ProfileResponse toResponse(Profile profile) {
        var targets = goalCalculationService.calculate(profile);
        return new ProfileResponse(
                profile.getAge(),
                profile.getHeightCm(),
                profile.getWeightKg(),
                profile.getGender(),
                profile.getGoal(),
                profile.getActivityLevel(),
                profile.getExperienceLevel(),
                targets
        );
    }
}
