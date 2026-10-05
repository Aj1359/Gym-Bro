# 🏋️‍♂️ GymBro: Complete System Architecture & Interview Preparation Master Guide

This document is a comprehensive technical reference for the **GymBro** project. It details the system architecture, component breakdown across backend and frontend, operations/port setups, and deep-dive interview questions with optimal answers.

---

# Table of Contents
1. [System Overview & Architecture Diagram](#1-system-overview--architecture-diagram)
2. [Backend Architecture & Component Walkthrough](#2-backend-architecture--component-walkthrough)
   - [Security & Authentication](#security--authentication)
   - [Profile & Goal Calculations](#profile--goal-calculations)
   - [Exercise Library & Caching](#exercise-library--caching)
   - [Workouts, Templates & Stats Engine](#workouts-templates--stats-engine)
   - [Event-Driven Notifications with Kafka](#event-driven-notifications-with-kafka)
   - [Nutrition, Hydration & Progress](#nutrition-hydration--progress)
   - [Database Migrations (Flyway V1–V9)](#database-migrations-flyway-v1v9)
3. [Frontend Architecture & Component Walkthrough](#3-frontend-architecture--component-walkthrough)
   - [Global State & Theme Context](#global-state--theme-context)
   - [Axios Interceptors & Silent 401 Queueing](#axios-interceptors--silent-401-queueing)
   - [Route Protection & App Layout](#route-protection--app-layout)
4. [Operations Guide (Ports, Commands & Startup)](#4-operations-guide-ports-commands--startup)
   - [Port Allocation Matrix](#port-allocation-matrix)
   - [Running the Services (Windows / PowerShell)](#running-the-services-windows--powershell)
5. [Interview Preparation: Technical Q&A Cheat Sheet](#5-interview-preparation-technical-qa-cheat-sheet)

---

# 1. System Overview & Architecture Diagram

```
                                  [ React 19 Frontend (Vite) ]
                                    Port: 5173 / 5174
                                          │
                                          │ HTTP Requests + Bearer JWT
                                          ▼
                               [ Spring Boot 3 Backend ]
                                     Port: 8080
                      ┌───────────────────┼───────────────────┐
                      ▼                   ▼                   ▼
            [ Supabase Postgres ]   [ Redis Cache ]     [ Apache Kafka ]
               Port: 5432 / 6543       Port: 6379          Port: 9092
                 (JPA / Flyway)      (Exercises/1RM)      (Event Bus)
                                                              │
                                                              ▼
                                                   [ Notification Consumer ]
```

---

# 2. Backend Architecture & Component Walkthrough

### Security & Authentication
* **`User.java`**: Core entity mapping to `users` table. Fields: `id` (UUID), `email` (unique), `password` (BCrypt hash), `emailVerified`, `createdAt`.
* **`RefreshToken.java`**: Entity mapping to `refresh_tokens`. Uses a `@ManyToOne` association to `User`, stores a 64-byte URL-safe cryptographic token, `expiry` (7 days), and `revoked` flag.
* **`JwtService.java`**:
  * Generates 15-minute Access Tokens signed via HMAC-SHA256 (`Keys.hmacShaKeyFor`).
  * Embeds `subject` (`userId`) and custom claims (`email`).
  * Parsed and verified via `parseSignedClaims`, extracting user identity without hitting the DB on every request.
* **`JwtAuthFilter.java`**:
  * Extends `OncePerRequestFilter`. Intercepts incoming HTTP requests.
  * Extracts `Authorization: Bearer <token>`, validates via `JwtService`, and populates `SecurityContextHolder.getContext().setAuthentication(...)`.
* **`SecurityConfig.java`**:
  * Configures `SessionCreationPolicy.STATELESS` (no `HttpSession`).
  * Disables CSRF (stateless token APIs are immune to cookie-based CSRF attacks).
  * Configures CORS for `http://localhost:5173` and `http://localhost:5174`.
  * Allows public access to `/auth/**`, requiring authentication for all other endpoints.
  * Injects `JwtAuthFilter` before `UsernamePasswordAuthenticationFilter`.
* **`AuthService.java`**:
  * `register()`: Hashes plaintext passwords with BCrypt, saves user, and issues token pair.
  * `login()`: Compares passwords via `passwordEncoder.matches()`. Uses identical error messages for user-not-found and wrong-password to prevent email enumeration.
  * `refresh()`: **Implements Refresh Token Rotation**. Validates token, marks the old refresh token as `revoked = true`, and issues a brand new access + refresh token pair.
  * `logout()`: Marks the refresh token as revoked.
* **`AuthController.java`**: Exposes POST `/auth/register`, `/auth/login`, `/auth/refresh`, and `/auth/logout` (returning `204 No Content`).

---

### Profile & Goal Calculations
* **`Profile.java`**: Entity capturing age, gender, height (cm), weight (kg), activity level (`sedentary`, `light`, `moderate`, `active`, `very_active`), and goal (`cut`, `maintain`, `bulk`).
* **`GoalCalculationService.java`**:
  * **Pure, deterministic calculation engine** (no DB/HTTP dependencies).
  * **BMI**: $\text{weight (kg)} / \text{height (m)}^2$.
  * **BMR (Mifflin-St Jeor Equation)**:
    * Male: $10 \times \text{weight} + 6.25 \times \text{height} - 5 \times \text{age} + 5$
    * Female: $10 \times \text{weight} + 6.25 \times \text{height} - 5 \times \text{age} - 161$
  * **TDEE**: $\text{BMR} \times \text{Activity Multiplier}$ ($1.2 \to 1.9$).
  * **Calorie Target**: $-20\%$ for Cut, $+10\%$ for Bulk, $\pm0\%$ for Maintain.
  * **Macros**: Protein ($2\text{g}/\text{kg}$), Fat ($25\%$ of calories $/ 9\text{ kcal}$), Carbs (remaining calories $/ 4\text{ kcal}$), Fibre ($14\text{g}$ per $1000\text{ kcal}$), Water ($33\text{ml}/\text{kg}$).

---

### Exercise Library & Caching
* **`Exercise.java`**: Stores name, muscle group, equipment, difficulty level, instructions, and Supabase image URL.
* **`ExerciseSeeder.java`**: Reads `seed-data/exercises.json` on application startup to seed 50+ exercises if the table is empty.
* **`ExerciseService.java`**:
  * Implements **Redis Caching** via `@Cacheable(value = "exercises", key = "#muscle + ':' + #equipment + ':' + #level + ':' + #search + ':' + #pageable.pageNumber")`.
  * Reduces database load on repeated catalog filtering and pagination.

---

### Workouts, Templates & Stats Engine
* **`Workout.java`** & **`WorkoutSet.java`**: Tracks live workout sessions, completed timestamps, and individual logged sets (weight, reps, RPE).
* **`WorkoutStatsService.java`**:
  * **Estimated 1-Rep Max (Epley Formula)**:
    $$\text{1RM} = \text{weight} \times \left(1 + \frac{\text{reps}}{30}\right)$$
  * **Volume Calculation**: $\sum (\text{weight} \times \text{reps})$.
  * **PR Detection**: Compares current set 1RM against all historical sets for that exercise.
* **`WorkoutService.java`**:
  * Logs sets with `@CacheEvict(value = "exerciseHistory", key = "#userId + ':' + #request.exerciseId()")`.
  * On `completeWorkout()`, calculates PR count and publishes a `WorkoutCompletedEvent` to **Kafka**.

---

### Event-Driven Notifications with Kafka
* **`WorkoutEventProducer.java`**:
  * Uses Spring Kafka's `KafkaTemplate` to publish `WorkoutCompletedEvent` to the `workout-completed` topic with `userId` as the message partition key.
* **`WorkoutEventConsumer.java`**:
  * `@KafkaListener(topics = "workout-completed", groupId = "gymbro-backend")`.
  * Consumes the event asynchronously, evaluates if PRs were broken, formats celebration text, and persists an in-app `Notification`.

---

### Nutrition, Hydration & Progress
* **`NutritionService.java`**: Manages foods, custom meals, favorite toggle, water intake logs, and aggregates daily calories/macros against profile targets.
* **`ProgressService.java`**: Tracks weight logs, body fat %, chest/waist/arm measurements over time for chart visualization.

---

### Database Migrations (Flyway V1–V9)
* `V1`: `users` & `refresh_tokens`
* `V2`: `profiles` (1-to-1 with users)
* `V3`: `exercises` (with full-text search indexes)
* `V4`: `workouts` & `workout_sets`
* `V5`: `workout_day_templates` & `workout_day_exercises`
* `V6`: `foods` & `meals`
* `V7`: `favorite_foods` & `water_logs`
* `V8`: `body_measurements`
* `V9`: `notifications`

---

# 3. Frontend Architecture & Component Walkthrough

### Global State & Theme Context
* **`src/app/store.ts`**: Configured Redux Toolkit store. Exports `RootState` and `AppDispatch` types.
* **`src/features/auth/authSlice.ts`**: Stores `accessToken`, `refreshToken`, `isAuthenticated`. Reducers: `setCredentials` and `clearCredentials`.
* **`src/app/ThemeContext.tsx`**: Provides global Dark/Light mode state persisted to `localStorage` and synchronized with Tailwind's `.dark` class.

---

### Axios Interceptors & Silent 401 Queueing
* **`src/api/axiosInstance.ts`**:
  * **Request Interceptor**: Reads `auth.accessToken` from Redux and automatically injects `Authorization: Bearer <token>`.
  * **Response Interceptor (Silent 401 Auto-Refresh with Queuing Pattern)**:
    * Catches `401 Unauthorized`.
    * Uses an `isRefreshing` boolean flag and a `refreshSubscribers: ((token: string) => void)[]` callback queue.
    * **Why this matters**: If 5 API calls fail simultaneously with 401, only the *first* triggers `/auth/refresh`. The other 4 wait in the queue. When the fresh token arrives, all 5 requests retry with the new token. If refresh fails, it dispatches `clearCredentials()` and redirects to `/login`.

---

### Route Protection & App Layout
* **`src/routes/ProtectedRoute.tsx`**: Reads `isAuthenticated` from Redux. If false, renders `<Navigate to="/login" replace />`. If true, renders `<Outlet />`.
* **`src/components/AppLayout.tsx`**: Sidebar navigation, Header, Notification bell, Theme Toggle, and User profile menu.
* **`src/App.tsx`**: Top-level router with nested protected routes (`/dashboard`, `/profile`, `/exercises`, `/splits`, `/workout`, `/history`, `/nutrition`, `/progress`).

---

# 4. Operations Guide (Ports, Commands & Startup)

### Port Allocation Matrix

| Service | Port | Protocol | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend (Vite)** | `5173` (or `5174`) | HTTP | React Web Client UI |
| **Backend (Spring Boot)** | `8080` | HTTP / REST | Main API Server |
| **PostgreSQL (Supabase)** | `6543` (or `5432`) | TCP / JDBC | Database (Flyway + Hibernate) |
| **Redis** | `6379` | TCP / RESP | Caching (Exercise catalog, 1RM History) |
| **Kafka Broker** | `9092` | TCP / PLAINTEXT | Event Bus (Workout events) |
| **Zookeeper** | `2181` | TCP | Kafka Cluster Coordinator |

---

### Running the Services (Windows / PowerShell)

#### Step 1: Start Infrastructure (Redis & Kafka) via Docker
```powershell
cd e:\GymBro
docker-compose up -d
```

#### Step 2: Run the Backend (Spring Boot 3)
```powershell
cd e:\GymBro\backend

# Set JDK environment variables
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.11.10-hotspot"
$env:PATH = "$env:JAVA_HOME\bin;" + $env:PATH
$env:SUPABASE_DB_PASSWORD = "YOUR_SUPABASE_PASSWORD"

# Normal Run:
.\mvnw.cmd spring-boot:run

# Low-Memory / Resource-Constrained Run:
java -Xmx192m -Xms64m -XX:ReservedCodeCacheSize=32m -XX:MaxMetaspaceSize=128m -XX:CompressedClassSpaceSize=32m -XX:+UseSerialGC -jar target/demo-0.0.1-SNAPSHOT.jar
```

#### Step 3: Run the Frontend (React + Vite)
```powershell
cd e:\GymBro\frontend
npm run dev
```
Open browser at `http://localhost:5173`.

---

# 5. Interview Preparation: Technical Q&A Cheat Sheet

### Q1: Why did you choose JWT with Refresh Token Rotation instead of standard Session Cookies?
> **Answer**:  
> "We chose a stateless JWT architecture to make the backend horizontally scalable without needing sticky sessions or distributed session replication.  
> To solve the revocation problem of JWTs, we split authentication into two tokens:
> 1. **Short-lived Access Token (15 mins)**: Sent in the `Authorization: Bearer` header for fast, stateless verification without hitting the database.
> 2. **Long-lived Refresh Token (7 days)**: Stored in PostgreSQL with a `revoked` boolean.  
> Every time the client requests a new access token, the backend executes **Refresh Token Rotation**: it revokes the old refresh token and issues a brand-new pair. If an attacker steals a refresh token and uses it, the legitimate user's next request will attempt to reuse the revoked token, immediately flagging a security breach and invalidating the session."

---

### Q2: How did you handle race conditions when multiple API requests receive 401s at the same time?
> **Answer**:  
> "In Axios, if a user opens a dashboard that triggers 5 simultaneous requests (e.g. `/profile`, `/workouts`, `/nutrition`, `/notifications`, `/dashboard`), all 5 would fail with a 401 when the access token expires.  
> If all 5 attempted to hit `/auth/refresh` simultaneously, our database's Refresh Token Rotation would cause 4 of them to fail because the first one would revoke the refresh token.  
> We solved this by implementing a **Subscriber Queue pattern** in our Axios response interceptor:
> - An `isRefreshing` boolean flag ensures only the first failing request calls `/auth/refresh`.
> - The remaining 4 requests are converted into unresolved Promises and added to a `refreshSubscribers` callback array.
> - Once the refresh call succeeds, the queue is drained and all pending requests retry with the new access token seamlessly without throwing any error to the UI."

---

### Q3: Why did you use Flyway for database management instead of Hibernate's `ddl-auto: update`?
> **Answer**:  
> "Using `ddl-auto: update` or `create` in production is dangerous and non-deterministic. Hibernate can alter column types unpredictably, fail to handle table renames, and cannot perform complex data migrations.  
> With **Flyway**, database migrations are version-controlled SQL scripts (`V1__...`, `V2__...`) executed in strict order. Flyway maintains a `flyway_schema_history` table to guarantee that every environment has an identical, reproducible schema. We set Hibernate to `ddl-auto: validate`, ensuring Hibernate only verifies that our Java `@Entity` annotations match the Flyway-generated tables."

---

### Q4: How is Apache Kafka used in this project, and why not just process everything synchronously in the service?
> **Answer**:  
> "When a user completes a workout, several non-critical side effects must happen: calculating personal records, formatting notifications, generating push alerts, and updating historical leaderboards.  
> If done synchronously in `WorkoutService.completeWorkout()`, the user's HTTP request would be blocked for hundreds of milliseconds while waiting for notification and metric writes.  
> Instead, we adopted an **Event-Driven Architecture**:
> - `WorkoutService` finishes the transaction and fires a lightweight `WorkoutCompletedEvent` to Kafka on the `workout-completed` topic.
> - The HTTP response returns immediately (`200 OK`).
> - The `WorkoutEventConsumer` asynchronously processes the event in the background, checks PR criteria, and creates the notification. This decouples our write-heavy workout tracking from our notification subsystem."

---

### Q5: How did you implement caching with Redis, and how do you prevent stale cache data?
> **Answer**:  
> "We used Spring Cache with Redis for high-read, low-write endpoints like the **Exercise Library** and **1RM Exercise History**.  
> - For exercises: We cache search results using a composite key: `#muscle + ':' + #equipment + ':' + #level + ':' + #search + ':' + #pageable.pageNumber`.
> - For exercise history: Cached by `#userId + ':' + #exerciseId`.  
> To avoid stale cache data, whenever a user logs a new set in `WorkoutService.logSet()`, we trigger `@CacheEvict(value = "exerciseHistory", key = "#userId + ':' + #request.exerciseId()")`. This immediately invalidates the cache so subsequent PR calculations and history views reflect the newly logged set."

---

### Q6: How does the Global Exception Handling architecture work?
> **Answer**:  
> "We implemented `@RestControllerAdvice` in `GlobalExceptionHandler.java` to catch application exceptions globally:
> 1. `IllegalArgumentException`: Returns a clean `400 Bad Request` with `{"error": "..."}`.
> 2. `MethodArgumentNotValidException` (triggered by `@Valid` on DTOs): Extracts all `FieldError` objects and returns a field-level error dictionary (e.g. `{"email": "Must be a valid email", "password": "Must be at least 8 characters"}`).  
> This ensures the backend never leaks raw stack traces or internal server details (500 errors) to the client."
