package com.example.demo.exercise;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/exercises")
public class ExerciseController {

    private final ExerciseService exerciseService;

    public ExerciseController(ExerciseService exerciseService) {
        this.exerciseService = exerciseService;
    }

    @GetMapping
    public ResponseEntity<Page<Exercise>> getExercises(
            @RequestParam(required = false) String muscle,
            @RequestParam(required = false) String equipment,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20) Pageable pageable) {

        return ResponseEntity.ok(exerciseService.searchExercises(muscle, equipment, level, search, pageable));
    }
}
