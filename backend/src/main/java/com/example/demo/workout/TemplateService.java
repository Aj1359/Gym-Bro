package com.example.demo.workout;

import com.example.demo.exercise.Exercise;
import com.example.demo.exercise.ExerciseRepository;
import com.example.demo.workout.dto.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TemplateService {

    private final WorkoutDayTemplateRepository templateRepository;
    private final WorkoutDayExerciseRepository templateExerciseRepository;
    private final ExerciseRepository exerciseRepository;

    public TemplateService(WorkoutDayTemplateRepository templateRepository,
                            WorkoutDayExerciseRepository templateExerciseRepository,
                            ExerciseRepository exerciseRepository) {
        this.templateRepository = templateRepository;
        this.templateExerciseRepository = templateExerciseRepository;
        this.exerciseRepository = exerciseRepository;
    }

    @Transactional
    public TemplateResponse createTemplate(UUID userId, CreateTemplateRequest request) {
        int nextOrder = templateRepository.findByUserIdOrderByDisplayOrderAsc(userId).size();
        WorkoutDayTemplate template = new WorkoutDayTemplate(userId, request.name(), nextOrder);
        template = templateRepository.save(template);
        return toResponse(template);
    }

    public List<TemplateResponse> getUserTemplates(UUID userId) {
        return templateRepository.findByUserIdOrderByDisplayOrderAsc(userId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public TemplateResponse getTemplate(UUID userId, UUID templateId) {
        return toResponse(findOwnedTemplate(userId, templateId));
    }

    @Transactional
    public TemplateResponse addExercise(UUID userId, UUID templateId, AddTemplateExerciseRequest request) {
        WorkoutDayTemplate template = findOwnedTemplate(userId, templateId);

        int nextOrder = templateExerciseRepository.findByTemplateIdOrderByOrderIndexAsc(templateId).size();

        WorkoutDayExercise entry = new WorkoutDayExercise(
                template.getId(), request.exerciseId(), nextOrder,
                request.targetSets(), request.targetReps(), request.targetWeightKg()
        );
        templateExerciseRepository.save(entry);

        return toResponse(template);
    }

    @Transactional
    public void deleteTemplate(UUID userId, UUID templateId) {
        WorkoutDayTemplate template = findOwnedTemplate(userId, templateId);
        templateRepository.delete(template);
    }

    private WorkoutDayTemplate findOwnedTemplate(UUID userId, UUID templateId) {
        WorkoutDayTemplate template = templateRepository.findById(templateId)
                .orElseThrow(() -> new IllegalArgumentException("Template not found"));
        if (!template.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Template not found");
        }
        return template;
    }

    List<TemplateExerciseResponse> buildExerciseResponses(UUID templateId) {
        List<WorkoutDayExercise> entries = templateExerciseRepository.findByTemplateIdOrderByOrderIndexAsc(templateId);

        return entries.stream().map(entry -> {
            Exercise exercise = exerciseRepository.findById(entry.getExerciseId())
                    .orElseThrow(() -> new IllegalStateException("Referenced exercise missing"));

            String imageUrl = exercise.getImages().length > 0 ? exercise.getImages()[0] : null;

            return new TemplateExerciseResponse(
                    entry.getId(), exercise.getId(), exercise.getName(), imageUrl,
                    List.of(exercise.getInstructions()), entry.getTargetSets(),
                    entry.getTargetReps(), entry.getTargetWeightKg()
            );
        }).collect(Collectors.toList());
    }

    private TemplateResponse toResponse(WorkoutDayTemplate template) {
        return new TemplateResponse(template.getId(), template.getName(), template.getDisplayOrder(),
                buildExerciseResponses(template.getId()));
    }
}
