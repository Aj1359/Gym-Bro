package com.example.demo.exercise;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class ExerciseService {

    private final ExerciseRepository exerciseRepository;

    public ExerciseService(ExerciseRepository exerciseRepository) {
        this.exerciseRepository = exerciseRepository;
    }

    @Cacheable(value = "exercises", key = "#muscle + ':' + #equipment + ':' + #level + ':' + #search + ':' + #pageable.pageNumber")
    public Page<Exercise> searchExercises(String muscle, String equipment, String level, String search, Pageable pageable) {
        System.out.println("CACHE MISS — hitting database for exercises search");
        return exerciseRepository.search(muscle, equipment, level, search, pageable);
    }
}
