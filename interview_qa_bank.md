# 🏋️‍♂️ GymBro — Complete Interview Master Question Bank
*Authoritative Architectural Answers, Deep-Dives, Tradeoffs, and Failure Modes*

---

## 1. System Design Questions

### 1. Walk me through the end-to-end architecture of GymBro, from the browser to the database.
*   **Frontend**: React 19 SPA served via Nginx with client-side routing. Global authentication state is managed in Redux Toolkit. Outgoing HTTP requests pass through an Axios interceptor that injects `Authorization: Bearer <accessToken>`.
*   **Gateway / Web Layer**: Nginx reverse-proxies `/auth/**`, `/workouts/**`, etc., to the Spring Boot 3 backend running on port `8080`.
*   **Security & Filter Chain**: The request enters Spring Security's `SecurityFilterChain`. `JwtAuthFilter` extracts and validates the token using JJWT (HMAC-SHA256). If valid, it populates `SecurityContextHolder` with the user's `UUID` principal without querying the database.
*   **Controller & Validation**: `@RestController` maps the route. `@Valid` validates the DTO parameters before executing method code. Any constraint failure triggers `@RestControllerAdvice` (`GlobalExceptionHandler`) to return a `400 Bad Request`.
*   **Service & Business Logic**: The Service layer executes business rules within `@Transactional` boundaries. It calculates domain math (e.g., Epley 1RM, Mifflin-St Jeor TDEE) and checks cache availability.
*   **Caching Layer (Redis)**: High-read operations (exercise catalog search, exercise history) query Redis (port `6379`) via `@Cacheable`. Writes trigger `@CacheEvict`.
*   **Data Access Layer (JPA / Flyway / PostgreSQL)**: Spring Data JPA executes generated queries against PostgreSQL (port `5432` / Supabase transaction pooler port `6543`). The database schema is versioned via Flyway migrations (`V1`–`V9`).
*   **Event Bus (Kafka)**: Upon workout completion, `WorkoutService` publishes an asynchronous `WorkoutCompletedEvent` to Apache Kafka (port `9092`). `WorkoutEventConsumer` asynchronously consumes the message to calculate PRs and write in-app notifications.

---

### 2. Why did you choose a microservice-adjacent event bus (Kafka) instead of keeping everything in one monolithic Spring Boot service?
*   **Problem**: In workout tracking apps, ending a workout triggers heavy asynchronous side-effects: calculating all-time PRs, generating notifications, updating leaderboard aggregates, and sending external push/email notifications.
*   **Monolithic Pitfall**: Calling `notificationService.createNotification(...)` synchronously inside `completeWorkout()` ties the latency of the user's HTTP request to all downstream tasks. If a notification write is slow or fails, the core workout completion transaction is blocked or rolled back.
*   **Kafka Decoupling**:
    1.  **Latency**: `completeWorkout()` saves the workout state, fires the event to Kafka in $<5\text{ms}$, and immediately returns `200 OK` to the user.
    2.  **Fault Tolerance**: If the notification service or third-party push gateway goes down, events remain durably buffered in Kafka without dropping user data.
    3.  **Extensibility**: Adding new consumers (e.g., AI workout analysis, analytics pipelines) requires zero modifications to `WorkoutService`.

---

### 3. How would you scale GymBro to 1 million concurrent users? Where are the first bottlenecks?
*   **Bottleneck 1: Database Connection Saturation & Write Contention**:
    *   *Mitigation*: Implement PgBouncer / Supabase Transaction Pooler, read-replicas for query offloading (`getUserWorkouts`, `getExerciseLibrary`), and vertical partitioning of write-heavy tables (`workout_sets`).
*   **Bottleneck 2: Backend Stateless Scaling**:
    *   *Mitigation*: Since our JWT authentication and Spring Security sessions are strictly `STATELESS`, we can place the backend behind an AWS ALB / Nginx reverse proxy and horizontally scale Spring Boot pods in Kubernetes using Horizontal Pod Autoscaling (HPA).
*   **Bottleneck 3: Redis Memory & Network Saturation**:
    *   *Mitigation*: Transition from standalone Redis to a Redis Cluster with read replicas and client-side caching (Lettuce cache).
*   **Bottleneck 4: Kafka Throughput & Consumer Lag**:
    *   *Mitigation*: Increase `workout-completed` partitions from 3 to 32+ and scale the consumer group instances to match partition counts.

---

### 4. Why is the backend stateless, and what tradeoffs did that force on you?
*   **Rationale**: Stateless architecture eliminates server-affinity (sticky sessions) and distributed session replication clusters (e.g., Spring Session + Redis backing `HttpSession`). Any backend instance can handle any user request.
*   **Tradeoffs & Mitigations**:
    *   *Tradeoff 1: Token Revocation*: Once a 15-minute access token is issued, it cannot be revoked server-side until it expires.
    *   *Mitigation*: We kept access token TTL short (15 mins) and enforce revocation checks on the 7-day database-backed Refresh Token.
    *   *Tradeoff 2: Client Memory Resets*: Page refreshes clear Redux state.
    *   *Mitigation*: Handled via silent background token rehydration or httpOnly cookie persistence.

---

### 5. If you had to shard the Postgres database, what sharding key would you pick and why?
*   **Chosen Key**: `user_id` (UUID).
*   **Rationale**: 
    1.  GymBro is an **isolated multi-user system**: 99% of relational queries filter by `WHERE user_id = ?` (workouts, meals, profile, measurements, notifications).
    2.  Sharding by `user_id` ensures that all related tables for a single user reside on the **same physical shard**, completely avoiding expensive distributed cross-shard joins (`JOIN workouts ON users.id`).
*   **Global Tables**: The `exercises` catalog table has no `user_id` and is low-write. It would be replicated globally across all shards as a reference table or served purely out of Redis.

---

### 6. How would you design a leaderboard feature on top of your current schema?
*   **Architecture**: Hybrid Relational + Redis Sorted Sets (`ZSET`).
*   **Implementation**:
    1.  **Redis ZSET**: Key = `leaderboard:exercise:{exerciseId}`. Member = `userId`. Score = `estimated1RM` (or max weight).
    2.  **Write Path**: When `WorkoutStatsService.isPersonalRecord()` evaluates to `true`, execute `ZADD leaderboard:exercise:{exerciseId} {1RM} {userId}`.
    3.  **Read Path**: Fetch top 50 in $O(\log N + M)$ time using `ZREVRANGEBYSCORE leaderboard:exercise:{exerciseId} +inf -inf WITHSCORES LIMIT 0 50`.
    4.  **Enrichment**: Fetch username/avatar profiles in a single batched `SELECT id, email FROM users WHERE id IN (...)` query.

---

### 7. Kafka has 3 partitions on `workout-completed` — why 3? How do you decide partition count, and what happens if you scale consumers beyond 3?
*   **Why 3?**: 3 is the standard baseline allowing up to 3 parallel consumer instances in the `gymbro-backend` consumer group for local clustering simulation without excessive resource overhead.
*   **Sizing Formula**: $\text{Partitions} = \max\left(\frac{\text{Target Throughput}}{\text{Producer Throughput}}, \frac{\text{Target Throughput}}{\text{Consumer Throughput}}\right)$.
*   **Consumer Scaling Rule**: Kafka allocates at most **one consumer per partition per consumer group**. If you have 3 partitions and spin up 4 consumer instances, the 4th consumer remains completely idle. To scale to $N$ active parallel consumers, you must have at least $N$ partitions.

---

### 8. What happens if the Kafka consumer crashes mid-processing? Walk through delivery guarantees and idempotency.
*   **Delivery Guarantee**: Spring Kafka defaults to **at-least-once delivery** when using manual or after-record offset commits. If a consumer crashes after creating a notification but before committing the Kafka offset, the rebalanced consumer will re-read the message.
*   **Idempotency Solution**:
    *   Add a unique constraint or deduplication key in the `notifications` table: `UNIQUE(workout_id, type)`.
    *   Alternatively, store processed `event_id` keys in Redis with `SET event:{id} 1 NX EX 86400`. If `SETNX` returns 0, skip processing.

---

### 9. How would you extend the notification system to support push notifications or email?
*   **Fan-out Pattern via Kafka Consumer Groups**:
    1.  Keep `WorkoutEventProducer` unchanged.
    2.  Create separate consumer groups for each channel:
        *   Group `notification-inapp-group`: Writes to PostgreSQL `notifications` table.
        *   Group `notification-push-group`: Sends Firebase Cloud Messaging (FCM) / Apple APNs push payload.
        *   Group `notification-email-group`: Invokes AWS SES / SendGrid for weekly progress digests.
    3.  Failure or rate-limits in the email service will never block or delay in-app notifications.

---

### 10. Design a rate limiter for `/auth/login` to prevent brute-force attacks — where would it live?
*   **Location**: Inside a custom Spring Security Filter positioned before `JwtAuthFilter`, or at the API Gateway / Nginx layer.
*   **Algorithm**: **Sliding Window Counter** or **Token Bucket** in Redis.
*   **Redis Key**: `rate:auth:login:{clientIp}` or `rate:auth:login:{email}`.
*   **Mechanism**:
    1.  Execute atomic Lua script: increment attempt count with a 60-second TTL.
    2.  If attempts $> 5$, immediately short-circuit the request and return `429 Too Many Requests` with a `Retry-After: 60` header.

---

### 11. How would you add a "social" feature (friends, feed) without breaking bounded contexts?
*   **Domain Boundaries**: Create a dedicated `com.example.demo.social` module.
*   **Decoupled Schema**: Create `friendships` (`user_id`, `friend_id`, `status`) and `activity_feed` tables.
*   **Event-Driven Integration**: The social module listens to the existing Kafka topic `workout-completed`. When an event arrives, `SocialFeedConsumer` fans out feed items into the activity feeds of all confirmed friends (`feed:user:{friendId}`).

---

### 12. Your Redis cache key includes muscle, equipment, level, search, and pageable. What's the cardinality risk, and how would you mitigate it?
*   **Cardinality Risk**: Unrestricted `search` query parameters create infinite cache permutations (e.g., typos, random strings), leading to **cache explosion** and OOM.
*   **Mitigations**:
    1.  **Input Normalization**: `toLowerCase()`, `trim()`, and truncate search strings.
    2.  **Bypass Cache on Arbitrary Search**: Only cache when `search == null` or `search.length() < 3`. Route arbitrary free-text queries directly to PostgreSQL full-text search.
    3.  **Redis Eviction Policy**: Configure `maxmemory-policy allkeys-lru` or `volatile-lru` so Redis automatically evicts least-recently-used keys when memory thresholds are reached.

---

### 13. If Redis goes down entirely, what's the blast radius on GymBro? How do you design for graceful degradation?
*   **Blast Radius**: Zero data loss (Postgres is the source of truth), but increased database query load and response latency on exercise library and workout 1RM queries.
*   **Graceful Degradation**:
    *   Wrap Redis cache calls with a custom `CacheErrorHandler` in Spring.
    *   If a `RedisConnectionException` occurs, log a warning, catch the exception, and execute the fallback method body (reading directly from PostgreSQL) rather than failing the HTTP request with a 500 error.

---

### 14. How would you evolve this into a multi-tenant SaaS for gyms?
*   **Database Architecture Options**:
    *   *Option A (Shared Database, Discriminator Column)*: Add `gym_id UUID NOT NULL` to all tables. Enforce multi-tenancy via Hibernate `@TenantId` or PostgreSQL Row-Level Security (RLS).
    *   *Option B (Schema per Tenant)*: Route Flyway migrations and dynamic `DataSource` routing based on the tenant subdomain (`gymA.gymbro.com`).
*   **Auth Adjustment**: Embed `gym_id` into the JWT claims (`claim("gymId", gymId)`).

---

### 15. Explain your CDN/caching strategy for exercise images and how you'd optimize it further.
*   **Current Setup**: Exercise images are stored in a public Supabase Storage S3-compatible bucket and served via CDN URLs (`supabase.storage-base-url`).
*   **Optimizations**:
    1.  **Immutable Cache Headers**: Serve images with `Cache-Control: public, max-age=31536000, immutable`.
    2.  **Next-Gen Formats**: Use a Cloudflare Worker or Supabase Image Transformation to automatically convert PNG/JPGs to modern `.webp` and `.avif` formats with responsive width srcset attributes.

---

## 2. Technical Deep-Dive Questions

### Auth & Security

#### 16. Why 15-minute access tokens and 7-day refresh tokens specifically?
*   **15-minute Access Token**: Minimizes the damage window if a bearer token is intercepted over the wire or extracted from memory.
*   **7-day Refresh Token**: Provides seamless UX so active lifters don't have to re-enter credentials every day, while bounding dormant session risk to 1 week.

#### 17. Explain refresh token rotation in detail — what gets revoked, and how does reuse-detection work?
*   **Rotation**: When `/auth/refresh` receives Token A:
    1.  Finds Token A in PostgreSQL.
    2.  Checks `revoked == false` and `expiry > now()`.
    3.  Sets Token A's `revoked = true` in the DB.
    4.  Issues and saves new Token B, returning Token B + new Access Token.
*   **Reuse Detection**: If an attacker steals Token A and uses it, Token A is revoked. When the legitimate user later tries to refresh with their local Token A, the backend detects `storedToken.isRevoked() == true`, immediately rejects the request with `400 Bad Request`, and can optionally revoke all active tokens for that `user_id` to shut down the compromised session.

#### 18. Why did you return identical error messages for "user not found" vs "wrong password"?
*   **Vulnerability**: Returning "User does not exist" allows attackers to perform **User Enumeration Attacks** (scripting thousands of email addresses to map which ones exist on GymBro).
*   **Mitigation**: Returning `400 Bad Request: "Invalid email or password"` for both cases conceals whether the email exists.

#### 19. Why is CSRF disabled, and why is that safe here specifically?
*   **CSRF Mechanics**: CSRF exploits automatic browser cookie transmission on cross-origin requests.
*   **Our Architecture**: GymBro is stateless and uses the `Authorization: Bearer <token>` HTTP header. Browsers **never** attach custom authorization headers to cross-site requests automatically. Thus, cookie-based CSRF attacks are technically impossible.

#### 20. Where exactly does `JwtAuthFilter` sit in the Spring Security filter chain, and why does order matter?
*   **Position**: `.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)`.
*   **Why Order Matters**: Authentication must occur **before** Spring Security evaluates authorization rules (`.anyRequest().authenticated()`). If `JwtAuthFilter` ran after authorization checks, Spring Security would inspect an empty `SecurityContext` and reject valid requests with a `401 Unauthorized`.

#### 21. If someone steals an access token, what is your exposure window and how would you reduce it further?
*   **Window**: At most 15 minutes.
*   **Advanced Mitigations**:
    1.  **DPoP (Demonstrating Proof-of-Possession)**: Cryptographically bind access tokens to a client-generated public/private key pair.
    2.  **IP & User-Agent Fingerprinting**: Store client metadata in token claims and reject requests if client ASN/IP subnet changes drastically.

#### 22. How is the JWT signed (HMAC-SHA256) — what's the tradeoff vs RSA/ECDSA?
*   **HMAC-SHA256 (Symmetric)**: Uses the *same* secret key to sign and verify.
    *   *Pros*: Extremely fast, simple single-service setup.
    *   *Cons*: In microservices, every validating service must have the secret key. If one service is compromised, attackers can forge tokens.
*   **RSA/ECDSA (Asymmetric)**: Uses a Private Key to sign (Auth Service) and a Public Key to verify (all other services).
    *   *Pros*: Zero risk of token forgery if worker services are compromised.
    *   *Cons*: Higher CPU overhead during signature verification.

---

### Concurrency & Caching

#### 23. Explain the Axios "subscriber queue" pattern in your own words.
*   **The Problem**: When a 15-minute access token expires, a dashboard page triggering 5 simultaneous calls will receive 5 simultaneous `401 Unauthorized` responses.
*   **Without the Queue**: All 5 calls would hit `/auth/refresh` at the exact same millisecond. The first refresh call revokes the token, causing the other 4 to fail with `400 Token Revoked` and force-logout the user.
*   **With the Queue**:
    *   First 401 sets `isRefreshing = true` and calls `/auth/refresh`.
    *   The other 4 calls are suspended as unresolved Promises in `refreshSubscribers`.
    *   When the new token arrives, all subscribers are notified and retry cleanly with the new token.

#### 24. Walk through a race condition scenario: 5 requests get 401s simultaneously. Trace the interceptor step by step.
1. Request 1 gets 401 $\to$ checks `!originalRequest._retry` $\to$ sets `_retry = true`.
2. `isRefreshing == false` $\to$ sets `isRefreshing = true` $\to$ initiates `axios.post('/auth/refresh')`.
3. Requests 2, 3, 4, 5 get 401 $\to$ `isRefreshing == true` $\to$ pushed into `refreshSubscribers` array waiting for a callback.
4. Refresh API responds with `{ accessToken: "new_jwt", refreshToken: "new_rt" }`.
5. Redux dispatches `setCredentials`.
6. `onRefreshed("new_jwt")` executes all 4 queued callbacks, setting `Authorization = Bearer new_jwt` and resolving their Promises.
7. Original Request 1 retries with `new_jwt` and returns data to the UI.

#### 25. Why use `@CacheEvict` on `logSet()` instead of just setting a short TTL?
*   **Consistency**: If a user logs a new set with a heavier weight, their 1RM changes immediately. If we relied only on a TTL (e.g. 5 minutes), the user would see outdated 1RM and PR calculations on subsequent sets until the TTL elapsed.
*   `@CacheEvict(value = "exerciseHistory", key = "#userId + ':' + #request.exerciseId()")` provides **immediate write-through consistency** without sacrificing cache hit rates on read paths.

#### 26. What's the risk of cache stampede on the exercise catalog, and how do you mitigate it?
*   **Risk**: When the `exercises` cache key expires, 1000 concurrent requests simultaneously experience a cache miss and hammer the PostgreSQL database with identical search queries.
*   **Mitigations**:
    1.  **Distributed Lock (Redis Mutex)**: Only one thread gets to query the DB and repopulate the cache; other threads wait.
    2.  **Jittered TTLs**: Add random noise ($\pm 10\%$) to cache expiration times.

#### 27. Is your PR detection logic race-safe if a user logs two sets simultaneously from two devices?
*   **Analysis**: `isPersonalRecord()` compares against prior historical sets in the database. If two requests execute in parallel, both transactions could read the same prior max and flag both sets as PRs.
*   **Resolution**: Enforce database row locking using `SELECT ... FOR UPDATE` on the parent `workouts` row or run PR evaluation inside a single-threaded Kafka consumer.

---

### Data & Migrations

#### 28. Why Flyway over Hibernate `ddl-auto: update`? Give a concrete failure scenario.
*   **Failure Scenario**: Renaming a column `weight` to `weight_kg`.
    *   Hibernate `ddl-auto: update` does not know it was renamed: it creates a new column `weight_kg` (null values) and leaves the old `weight` column in place, causing silent data loss.
    *   **Flyway**: Executes an explicit SQL migration: `ALTER TABLE workout_sets RENAME COLUMN weight TO weight_kg;`, preserving all existing data.

#### 29. What does `ddl-auto: validate` actually check at startup?
*   Hibernate inspects the database metadata and compares tables, column names, nullability constraints, and data types against all Java `@Entity` annotations.
*   If a field `@Column(nullable = false)` exists in Java but the database column allows NULLs (or if a column name is mismatched), Hibernate throws a `SchemaManagementException` and **halts application startup** immediately.

#### 30. Why does `notifications` have a compound index on `(user_id, created_at)`?
*   **Query Pattern**: `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC`.
*   **Index Mechanics**: A B-Tree compound index on `(user_id, created_at)` allows PostgreSQL to locate all notifications for a specific user and retrieve them already sorted in reverse chronological order in a single index scan, avoiding an expensive in-memory sort.

#### 31. How would you handle a schema migration that needs to backfill millions of rows without locking the table?
*   **Expand-Contract Pattern**:
    1.  Add new column as nullable without a default: `ALTER TABLE ... ADD COLUMN ...;` (instant metadata update).
    2.  Deploy application code that reads from old/new columns and writes to both.
    3.  Run an asynchronous background script to backfill data in small batches (`LIMIT 5000`).
    4.  Apply `NOT NULL` constraint with `NOT VALID`, then validate asynchronously: `ALTER TABLE ... VALIDATE CONSTRAINT ...;`.

---

### Kafka / Async

#### 32. Why fire the Kafka event *after* the DB transaction commits in `completeWorkout()`?
*   If you publish to Kafka *before* the database transaction commits, a fast consumer might receive the event and attempt to query the `workouts` table before PostgreSQL has finalized the commit, resulting in a `Workout Not Found` error (**Transaction Isolation Race Condition**).

#### 33. What happens to the notification if Kafka is down when a workout completes?
*   In the basic setup, the Kafka publish fails and logs an error.
*   **Production Fix (Transactional Outbox Pattern)**:
    1.  In the same PostgreSQL transaction that saves the workout, insert an event row into an `outbox_events` table.
    2.  A CDC tool (like Debezium) or a dedicated polling worker reads the outbox table and streams events to Kafka reliably with guaranteed delivery.

#### 34. Why key Kafka messages by `userId`?
*   Kafka uses the message key's hash to determine partition assignment: $\text{partition} = \text{hash}(\text{key}) \pmod{\text{numPartitions}}$.
*   Using `userId` guarantees that **all events for the same user land on the exact same partition**, ensuring strict chronological processing order.

#### 35. `spring.json.trusted.packages` is set to `com.example.demo.*` — why is this a security config?
*   Java JSON deserializers (like Jackson) can be vulnerable to **Remote Code Execution (RCE) gadgets** if allowed to deserialize arbitrary class types specified in payload metadata (`@class` properties).
*   Whitelisting only our domain packages restricts deserialization strictly to verified internal DTO records.

---

### Domain Logic

#### 36. Explain the Epley 1RM formula and its limitations.
*   **Formula**: $\text{1RM} = \text{weight} \times \left(1 + \frac{\text{reps}}{30}\right)$.
*   **Accuracy Window**: Highly accurate between 1 and 10 reps.
*   **Limitation**: For sets over 12–15 reps, muscular endurance skews the calculation, significantly overestimating maximal strength.

#### 37. Why use Mifflin-St Jeor over other BMR formulas?
*   **Comparison**:
    *   *Harris-Benedict (1919)*: Overestimates BMR by $\sim 5\%$.
    *   *Katch-McArdle*: Requires accurate body fat percentage (which most users do not know).
    *   *Mifflin-St Jeor (1990)*: Validated by the American Dietetic Association as the most reliable equation using only weight, height, age, and sex.

#### 38. Defend your macro split (Protein 2g/kg, Fat 25%, Carbs remainder).
*   **Protein ($2\text{g}/\text{kg}$)**: Maximizes muscle protein synthesis (MPS) and preserves lean tissue in a caloric deficit.
*   **Fat ($25\%$)**: Provides essential fatty acids and supports hormonal production without taking away necessary carbohydrate energy.
*   **Carbs (Remainder)**: Replenishes muscle glycogen stores to sustain high-intensity anaerobic lifting performance.

#### 39. How do you validate that user inputs don't produce nonsensical calorie targets?
*   Bean Validation constraints (`@Min(30)`, `@Max(300)` for weight/height; `@Min(13)` for age).
*   In `GoalCalculationService`, we guard against negative remainder carbs using `Math.max(0, ...)`.

---

### Infrastructure

#### 40. Why multi-stage Docker builds for frontend and backend?
*   **Build Isolation**: The build stage contains heavy SDKs (JDK 21, Maven, Node.js, npm cache).
*   **Minimal Attack Surface & Size**: The final runtime image contains only the compiled `.jar` and lightweight JRE (or compiled HTML/JS/CSS on Nginx Alpine), reducing image size from $>800\text{MB}$ to $<150\text{MB}$.

#### 41. Why run the backend container as a non-root user?
*   **Principle of Least Privilege**: If an attacker discovers an RCE vulnerability in an application dependency, running as non-root (`USER gymbro:gymbro`) prevents them from modifying container system files, installing rootkits, or escaping the container to the host kernel.

#### 42. Explain your JVM flags (`-Xms128m -Xmx384m -XX:+UseSerialGC -XX:+ExitOnOutOfMemoryError`).
*   `-Xms128m -Xmx384m`: Caps heap memory to prevent container OOM-kills.
*   `-XX:+UseSerialGC`: The default G1 garbage collector reserves large virtual memory address spaces ($>1\text{GB}$). SerialGC has near-zero memory footprint, ideal for memory-constrained single-tenant containers.
*   `-XX:+ExitOnOutOfMemoryError`: If the JVM hits an OOM, it immediately terminates so Docker/Kubernetes can restart a fresh, healthy container.

#### 43. Why does Nginx need `try_files $uri $uri/ /index.html;`?
*   React Router handles routing purely in client-side JavaScript. When a user directly visits `http://localhost/dashboard`, Nginx looks for a physical file at `/usr/share/nginx/html/dashboard`.
*   Without `try_files`, Nginx returns a `404 Not Found`. `try_files` routes all unmatched paths to `index.html` so React Router can take over.

#### 44. Why isn't `depends_on` alone sufficient for Postgres/Kafka in Docker Compose?
*   `depends_on` only waits for the container to *start*, not for the service to be *ready to accept connections*.
*   PostgreSQL takes 3–5 seconds to initialize data files. Without `condition: service_healthy` (using `pg_isready`), the Spring Boot backend boots immediately, fails to connect to Postgres, and crashes.

---

## 3. Behavioral / Project-Management Questions

### 45. What was the single hardest bug you hit building GymBro, and how did you debug it?
*   **The Bug**: JVM crash (`errno=1455: The paging file is too small`) when launching Spring Boot via Maven in a memory-constrained Windows environment.
*   **Root Cause**: Maven launched a JVM to execute `mvnw`, which spawned a second child JVM for Spring Boot, while the default G1GC reserved 1GB+ of virtual memory.
*   **Solution**: Diagnosed using process memory inspection in PowerShell, configured `-XX:+UseSerialGC`, reduced CodeCache and Metaspace reservations, and transitioned to direct `java -jar` execution with bounded heap sizes.

### 46. What did you deliberately leave out of scope, and why?
*   **Deliberate Omissions**:
    1.  *Real-time WebSockets for notifications*: Replaced with 30-second polling to avoid WebSocket connection state management on Day 13.
    2.  *Social graphs / Feed*: Prioritized ironclad core lifting mechanics (1RM, PRs, split templates, macro calculations) before adding social features.

### 47. If you had another 2 weeks before shipping, what would you prioritize next?
1.  **AI Meal Scanner**: Integrate Gemini Vision API to convert food photos into auto-filled meal logs.
2.  **WebSockets (STOMP / SockJS)**: Replace notification polling with instant push alerts.
3.  **Local Storage Rehydration**: Implement secure refresh token rehydration on browser refresh.

### 48. What would you do differently if you rebuilt GymBro from scratch today?
*   Adopt **UUIDv7** instead of random UUIDv4 for primary keys to provide time-ordered sequential indexing and reduce B-Tree fragmentation in PostgreSQL.
*   Use asymmetric RSA JWT signing to allow downstream worker microservices to verify tokens independently.

### 49. How did you decide the order to build features in?
*   **Bottom-Up Dependency Hierarchy**:
    1.  Schema & Migrations (Flyway) $\to$ Entities & Repositories $\to$ Security & Auth $\to$ Core Domain APIs $\to$ Caching & Async Events $\to$ Frontend Integration & Hardening.
    2.  Every step built upon a verified, compilable foundation without circular dependencies.

### 50. Tell me about a design decision you now think was suboptimal.
*   Coupling the Kafka event publish inside `WorkoutService.completeWorkout()` without an Outbox table. While pragmatic for Phase 1, a production system should use the Transactional Outbox pattern to guarantee zero message loss during crashes.

---

## 4. Curveball / "Break Your Design" Questions

### 51. Two users share the same account on two devices and both complete a workout at the exact same second — what happens?
*   Both HTTP requests reach the backend and save separate `Workout` rows with unique `id`s.
*   Both publish events to Kafka with the same `userId` key.
*   Because they share the same key, Kafka routes both events to the **same partition**. The consumer processes them sequentially, updating notifications and PRs in deterministic order without deadlocking.

### 52. Your refresh token table grows unbounded over time — how do you clean it up safely?
*   **Option 1**: Spring `@Scheduled` cron job running daily at midnight:
    `DELETE FROM refresh_tokens WHERE revoked = true OR expiry < now();`
*   **Option 2**: PostgreSQL Table Partitioning by month (`PARTITION BY RANGE (created_at)`) and dropping partitions older than 90 days in $O(1)$ time.

### 53. A malicious user scripts thousands of set logs to spam fake PRs — how do you stop this?
1.  **Rate Limiting**: Apply bucket rate limiting on `POST /workouts/{id}/sets` (e.g., max 10 sets per minute per user).
2.  **Domain Sanity Constraints**: Reject physiologically impossible inputs (e.g., weight $> 600\text{kg}$ or reps $> 100$).

### 54. Kafka topic `workout-completed` needs a breaking schema change — how do you roll this out without downtime?
1.  **Additive Evolution**: Add new fields with default/null values; never remove existing fields immediately.
2.  **Schema Registry**: Use Apache Avro or Protobuf with Confluent Schema Registry enforcing `BACKWARD` or `FULL` compatibility.
3.  **Two-Phase Deployment**: Upgrade consumers first (capable of reading old and new schemas), then upgrade producers.

### 55. "Why not just use WebSockets for notifications instead of a 30-second polling interval?" — Defend your choice.
*   **Defense**: Polling requires zero persistent connection state on the server, simplifies horizontal scaling, works seamlessly over HTTP/2, and avoids load balancer WebSocket timeout/reconnection complexities. For non-instant notifications (like post-workout celebrations), a 30-second delay is completely imperceptible to users.

### 56. If Redis and Postgres briefly disagree after a crash mid-write, what happens and how do you prevent it?
*   **Experience**: A user might see stale historical 1RM data for a few minutes until the Redis key expires.
*   **Prevention**: Always perform **Cache Eviction *after* database commit** (using Spring's `TransactionSynchronizationManager.registerSynchronization` with `afterCommit()`). If the DB transaction fails, the cache is never evicted; if the DB commits, the cache is cleared immediately.
