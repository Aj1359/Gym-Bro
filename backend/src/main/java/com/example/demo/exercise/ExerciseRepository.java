package com.example.demo.exercise;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface ExerciseRepository extends JpaRepository<Exercise, UUID> {

    @Query(value = """
            SELECT * FROM exercises
            WHERE (:muscle IS NULL OR EXISTS (SELECT 1 FROM unnest(primary_muscles) m WHERE m ILIKE '%' || :muscle || '%'))
            AND (:equipment IS NULL OR equipment = :equipment)
            AND (:level IS NULL OR level = :level)
            AND (:search IS NULL OR to_tsvector('english', name) @@ plainto_tsquery('english', :search))
            """,
            countQuery = """
            SELECT count(*) FROM exercises
            WHERE (:muscle IS NULL OR EXISTS (SELECT 1 FROM unnest(primary_muscles) m WHERE m ILIKE '%' || :muscle || '%'))
            AND (:equipment IS NULL OR equipment = :equipment)
            AND (:level IS NULL OR level = :level)
            AND (:search IS NULL OR to_tsvector('english', name) @@ plainto_tsquery('english', :search))
            """,
            nativeQuery = true)
    Page<Exercise> search(@Param("muscle") String muscle,
                          @Param("equipment") String equipment,
                          @Param("level") String level,
                          @Param("search") String search,
                          Pageable pageable);
}
