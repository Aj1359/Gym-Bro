package com.example.demo.profile;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface ProfileRepository extends JpaRepository<Profile, UUID> {
    // findById(UUID) is inherited from JpaRepository — no custom queries needed
    // because a profile is always fetched by its PK (user_id), never by any other field
}
