package com.example.demo.exercise;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

@Component
public class ExerciseSeeder implements CommandLineRunner {

    private final ExerciseRepository exerciseRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${supabase.storage-base-url}")
    private String storageBaseUrl;

    public ExerciseSeeder(ExerciseRepository exerciseRepository) {
        this.exerciseRepository = exerciseRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (exerciseRepository.count() > 0) {
            System.out.println("Exercises already seeded (" + exerciseRepository.count() + " rows) — skipping.");
            return;
        }

        try (InputStream is = new ClassPathResource("seed-data/exercises.json").getInputStream()) {
            JsonNode root = objectMapper.readTree(is);
            List<Exercise> exercises = new ArrayList<>();

            for (JsonNode node : root) {
                exercises.add(new Exercise(
                        node.get("name").asText(),
                        textOrNull(node, "force"),
                        node.get("level").asText("intermediate"),
                        textOrNull(node, "mechanic"),
                        textOrNull(node, "equipment"),
                        toStringArray(node.get("primaryMuscles")),
                        toStringArray(node.get("secondaryMuscles")),
                        toStringArray(node.get("instructions")),
                        node.get("category").asText("strength"),
                        toFullImageUrls(node.get("images"))
                ));
            }

            exerciseRepository.saveAll(exercises);
            System.out.println("Seeded " + exercises.size() + " exercises.");
        }
    }

    private String textOrNull(JsonNode node, String field) {
        JsonNode value = node.get(field);
        return (value == null || value.isNull()) ? null : value.asText();
    }

    private String[] toStringArray(JsonNode arrayNode) {
        if (arrayNode == null || !arrayNode.isArray()) return new String[0];
        List<String> list = new ArrayList<>();
        arrayNode.forEach(n -> list.add(n.asText()));
        return list.toArray(new String[0]);
    }

    private String[] toFullImageUrls(JsonNode imagesNode) {
        if (imagesNode == null || !imagesNode.isArray()) return new String[0];
        List<String> urls = new ArrayList<>();
        imagesNode.forEach(n -> urls.add(storageBaseUrl + n.asText()));
        return urls.toArray(new String[0]);
    }
}
