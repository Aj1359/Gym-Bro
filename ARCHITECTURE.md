# GymBro — Architecture & Vision

## 1. Core Philosophy
> **GymBro is a personal fitness intelligence platform, not just a workout tracker.**

**Architectural Principle**: Start as a modular monolith. Scale it horizontally. Extract services only when there is a real reason to do so. The system uses a robust foundation (Spring Boot, PostgreSQL, JWT, Redis, Kafka) to enable asynchronous, event-driven workflows that keep the core API fast.

---

## 2. Target Architecture

```text
                                  ┌──────────────────┐
                                  │      USER        │
                                  │ Web / Mobile PWA │
                                  └─────────┬────────┘
                                            │
                                            ▼
                                  ┌──────────────────┐
                                  │   API Gateway    │
                                  │ Rate Limiting    │
                                  │ Routing          │
                                  └─────────┬────────┘
                                            │
                     ┌──────────────────────┴──────────────────────┐
                     │                                             │
                     ▼                                             ▼
             ┌────────────────┐                            ┌────────────────┐
             │ Spring Boot #1 │                            │ Spring Boot #2 │
             └───────┬────────┘                            └───────┬────────┘
                     │                                             │
                     └──────────────────┬──────────────────────────┘
                                        │
                             ┌──────────▼──────────┐
                             │   DOMAIN LAYER      │
                             │                     │
                             │ Identity            │
                             │ Users               │
                             │ Workouts            │
                             │ Nutrition           │
                             │ Progress            │
                             │ Dashboard           │
                             │ Notifications       │
                             │ Achievements        │
                             │ Recommendations     │
                             └───────┬───────┬─────┘
                                     │       │
                       ┌─────────────┘       └───────────────┐
                       ▼                                     ▼
               ┌───────────────┐                     ┌──────────────┐
               │  PostgreSQL   │                     │    Redis     │
               │               │                     │              │
               │ Source Truth  │                     │ Cache        │
               │ Transactions  │                     │ Rate limits  │
               │ History       │                     │ Locks        │
               └───────┬───────┘                     └──────────────┘
                       │
                       ▼
                ┌─────────────┐
                │   Outbox    │
                └──────┬──────┘
                       │
                       ▼
                  ┌─────────┐
                  │  Kafka  │
                  └────┬────┘
                       │
       ┌───────────────┼──────────────────┐
       │               │                  │
       ▼               ▼                  ▼
 Notification      Analytics        Fitness AI
   Worker            Worker           Worker
```

---

## 3. The "Fitness Intelligence" Loop

GymBro dynamically changes training plans based on actual performance, recovery, nutrition, and consistency. 

```text
                    ┌──────────────┐
                    │     USER     │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │     DATA     │
                    │ (Workouts,   │
                    │  Recovery,   │
                    │  Nutrition)  │
                    └──────┬───────┘
                           │
                           ▼
                 ┌───────────────────┐
                 │ FITNESS INTELLIGENCE │
                 │       ENGINE      │
                 └─────────┬─────────┘
                           │
             ┌─────────────┼──────────────┐
             ▼             ▼              ▼
         What to do?   How much?      Why?
             │             │              │
             └─────────────┼──────────────┘
                           ▼
                    PERSONAL PLAN
```

### Unique Features
1. **Adaptive Fitness Engine**: Dynamically adjust volume and intensity based on recovery and fatigue.
2. **Readiness Score**: An aggregate of sleep, nutrition, recent load, and muscle fatigue.
3. **Muscle Fatigue Map**: Real-time tracking of body part recovery (e.g., "Back is 84% fatigued").
4. **Progressive Overload Engine**: Deterministic rules that mandate weight increases when RIR (Reps in Reserve) drops.
5. **AI as an Explanation Layer**: The system uses deterministic algorithms to decide the plan, and the LLM merely translates *why* the decision was made to the user. 
6. **Behavioral Consistency Intelligence**: Identifies patterns like "You miss 42% of 8 AM workouts" and adapts schedules.
7. **Plateau Detector**: Automatically identifies stagnant lifts and suggests variations or deloads.

---

## 4. Technical Strategy

### The Outbox Pattern
Avoid dual-write failures (e.g., saving a workout succeeds, but publishing the Kafka event fails). All domain events are saved in the same transaction to an `Outbox` table in PostgreSQL, which is then reliably published to Kafka by a background worker.

### Caching Architecture (Redis)
- **Exercise Catalog** (`exercise:*`): 24h TTL.
- **Dashboard** (`dashboard:{userId}`): 30-120s TTL, actively invalidated on new workout.
- **Rate Limiting** (`rate-limit:api:{userId}`).
- **Distributed Locks** (`lock:workout:{workoutId}`) to prevent duplicate submissions.

### Asynchronous Event-Driven Flow
Features like Notifications, Achievements, Analytics, and AI Recommendations do not block the main request thread. They listen to events like `gymbro.workout.completed` from Kafka.

---

## 5. Development Roadmap

### Phase 1 — Fix the foundation (COMPLETED)
1. Authentication & Authorization
2. DTO validation & Exception handling
3. Transaction boundaries
4. DB constraints & indexes
5. Clean up architecture (remove MVC/WebFlux mix if any)

### Phase 2 — Correct infrastructure (COMPLETED)
6. Redis caching & rate limiting strategy
7. Kafka topic design & Consumer retries
8. Idempotent consumers & Dead-letter queues
9. The Outbox pattern implementation

### Phase 3 — Product (IN PROGRESS)
10. Onboarding flow
11. Advanced Dashboard
12. Workout Engine (Progressive overload, Readiness score)
13. Achievements

### Phase 4 — Intelligence (IN PROGRESS)
14. Recommendation Engine (Coach Mode)
15. Personal Fitness Twin
16. Behavioral consistency analysis
17. AI explanation layer

### Phase 5 — Production
18. CI/CD, Monitoring, Distributed Tracing
19. Horizontal scaling
20. Load testing & Disaster recovery
