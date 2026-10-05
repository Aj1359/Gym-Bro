package com.example.demo.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.listener.DeadLetterPublishingRecoverer;
import org.springframework.kafka.listener.DefaultErrorHandler;
import org.springframework.util.backoff.FixedBackOff;

@Configuration
public class KafkaConfig {

    public static final String WORKOUT_COMPLETED_TOPIC = "workout-completed-events";
    public static final String CIRCUIT_COMPLETED_TOPIC = "circuit-completed-events";

    @Bean
    public NewTopic workoutCompletedTopic() {
        return TopicBuilder.name(WORKOUT_COMPLETED_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }
    
    @Bean
    public NewTopic circuitCompletedTopic() {
        return TopicBuilder.name(CIRCUIT_COMPLETED_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }

    // Consumer Retries and Dead-Letter Queue Configuration
    @Bean
    public DefaultErrorHandler errorHandler(KafkaTemplate<Object, Object> template) {
        // Publish to a DLT (Dead Letter Topic) if all retries fail
        DeadLetterPublishingRecoverer recoverer = new DeadLetterPublishingRecoverer(template);
        
        // Retry 3 times with a 2-second fixed delay between retries
        FixedBackOff backOff = new FixedBackOff(2000L, 3);
        
        return new DefaultErrorHandler(recoverer, backOff);
    }
}
