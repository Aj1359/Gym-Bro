# 🏋️‍♂️ GymBro — Full-Stack Fitness & Workout Intelligence Platform

[![Spring Boot 3](https://img.shields.io/badge/Spring_Boot-3.4+-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![Apache Kafka](https://img.shields.io/badge/Apache_Kafka-7.5-231F20?logo=apachekafka&logoColor=white)](https://kafka.apache.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Docker Compose](https://img.shields.io/badge/Docker_Compose-Supported-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

**GymBro** is a production-grade, full-stack fitness and athletic intelligence web application designed for serious lifters. It combines rigorous exercise science (Mifflin-St Jeor BMR/TDEE calculations, Epley 1-Rep Max estimations, automatic PR detection) with high-performance distributed systems architecture (JWT token rotation, Redis caching, and Kafka-driven asynchronous notification processing).

---

## 📑 Table of Contents
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Core Features](#-core-features)
- [System Topology & Event Flow](#-system-topology--event-flow)
- [Database Schema (Flyway V1–V9)](#-database-schema-flyway-v1v9)
- [Quickstart with Docker Compose](#-quickstart-with-docker-compose)
- [Manual Local Development](#-manual-local-development)
- [API Endpoints Reference](#-api-endpoints-reference)
- [Security & Concurrency Highlights](#-security--concurrency-highlights)
- [Testing & Quality Assurance](#-testing--quality-assurance)

---

## 🏗 Architecture & Tech Stack

### **Backend**
* **Framework:** Java 21 / Spring Boot 3
* **Security:** Spring Security with Stateless JWT (HMAC-SHA256) & Database-backed Refresh Token Rotation
* **Persistence & ORM:** Spring Data JPA / Hibernate 7
* **Database Migrations:** Flyway (9 Versioned Migrations)
* **Caching:** Spring Data Redis (`@Cacheable`, `@CacheEvict`)
* **Event Bus:** Apache Kafka (Producer/Consumer with JSON serialization)
* **Build Tool:** Maven

### **Frontend**
* **Framework:** React 19 / TypeScript / Vite
* **State Management:** Redux Toolkit (`authSlice`)
* **Networking:** Axios with Request/Response Interceptors (Silent 401 token refresh queue)
* **Routing:** React Router DOM v7 (Nested Protected Route Guards)
* **Styling & Theme:** Tailwind CSS v4 + Dynamic Dark/Light Mode Theme Context
* **Data Visualization:** Recharts for progressive metric trends

### **Infrastructure**
* **Relational DB:** PostgreSQL 16 (Local Docker or Supabase Cloud with Transaction Pooling)
* **In-Memory Store:** Redis 7 Alpine (Port `6379`)
* **Message Broker:** Apache Kafka 7.5 & Zookeeper 7.5 (Ports `9092` & `2181`)
* **Web Server:** Nginx Alpine (Production SPA serving with Gzip & Client Routing)

---

## ✨ Core Features

1. 🔐 **Enterprise Auth & Token Rotation:**
   - 15-minute access tokens & 7-day refresh tokens.
   - Every refresh request revokes the previous token and issues a fresh pair, actively preventing token reuse and replay attacks.
   - Axios subscriber queue pattern handles concurrent 401s without duplicate refresh calls.

2. 🎯 **Scientific Profile & Goal Calculation:**
   - Pure, deterministic calculation engine based on the **Mifflin-St Jeor equation**.
   - Computes BMI, BMR, TDEE, Calorie targets (Cut $-20\%$, Bulk $+10\%$, Maintain $\pm0\%$), protein ($2\text{g}/\text{kg}$), fats ($25\%$), carbs, fibre, and hydration goals ($33\text{ml}/\text{kg}$).

3. 📖 **Exercise Library & Redis Caching:**
   - 50+ seeded multi-muscle exercises with equipment, difficulty levels, and CDN images.
   - Redis cached queries with composite keys ensure sub-millisecond response times.

4. 🏋️‍♂️ **Live Workout Session & Automatic 1RM Tracking:**
   - Interactive live set logger with weight, reps, and RPE.
   - Dynamic **Epley 1-Rep Max calculation** ($\text{1RM} = \text{weight} \times (1 + \text{reps}/30)$).
   - Real-time comparison against prior historical sets to detect and flag **Personal Records (PRs)**.

5. ⚡ **Event-Driven Asynchronous Notifications (Kafka):**
   - Completing a workout dispatches a `WorkoutCompletedEvent` to Kafka and immediately returns `200 OK`.
   - The asynchronous consumer computes PR metrics and generates personalized in-app celebration alerts.

6. 🥗 **Nutrition & Hydration Tracking:**
   - Daily calorie/macro summaries vs. target goals.
   - Custom meal logging, favorite foods quick-toggle, and water intake counters.

7. 📈 **Progress & Body Measurement Visualizer:**
   - Historical tracking for body weight, body fat percentage, chest, waist, and arms with responsive Recharts trend lines.

---

## 🔄 System Topology & Event Flow

```
                                  [ React 19 Client ]
                                           │
                                           │ HTTP (Bearer JWT)
                                           ▼
                               [ Spring Boot 3 Backend ]
                                     Port: 8080
                      ┌────────────────────┼────────────────────┐
                      ▼                    ▼                    ▼
            [ PostgreSQL 16 ]        [ Redis 7 Cache ]    [ Apache Kafka ]
               Port: 5432               Port: 6379           Port: 9092
            (Relational Data)         (Catalog / 1RM)       (Event Stream)
                                                                │
                                                                ▼
                                                     [ Notification Consumer ]
```

---

## 🗄 Database Schema (Flyway V1–V9)

All database schema evolutions are strictly version-controlled under `backend/src/main/resources/db/migration`:

| Migration | Target Table(s) | Description |
| :--- | :--- | :--- |
| **`V1`** | `users`, `refresh_tokens` | Authentication tables, UUID keys, password hashes, revocation flags. |
| **`V2`** | `profiles` | 1-to-1 user physical metrics, fitness goals, and activity levels. |
| **`V3`** | `exercises` | Exercise catalog with full-text search indexes on name/muscle. |
| **`V4`** | `workouts`, `workout_sets` | Workout sessions, logged sets, reps, weight, RPE, volume. |
| **`V5`** | `workout_day_templates`, `workout_day_exercises` | Reusable workout split routines and planned exercise orders. |
| **`V6`** | `foods`, `meals` | Food database and daily meal logs with macro breakdowns. |
| **`V7`** | `favorite_foods`, `water_logs` | Quick-add favorite foods and daily water consumption tracking. |
| **`V8`** | `body_measurements` | Time-series physical measurements (weight, body fat, limbs). |
| **`V9`** | `notifications` | In-app alerts, read status, compound index on `(user_id, created_at)`. |

---

## 🚀 Quickstart with Docker Compose

Run the entire GymBro ecosystem with a single command:

### 1. Clone & Configure Environment
```bash
git clone https://github.com/your-username/gymbro.git
cd gymbro
cp .env.example .env
```

### 2. Start Full Stack
```bash
docker compose up -d --build
```

### 3. Verify Running Services
```bash
docker compose ps
```

* **Frontend:** [http://localhost:5173](http://localhost:5173) or [http://localhost](http://localhost)
* **Backend API:** [http://localhost:8080](http://localhost:8080)
* **Health Endpoint:** [http://localhost:8080/auth/health](http://localhost:8080/auth/health)

---

## 💻 Manual Local Development

If you prefer running services natively outside Docker:

### 1. Start Infrastructure (PostgreSQL, Redis, Kafka)
```bash
docker compose up -d postgres redis zookeeper kafka
```

### 2. Start Backend (Spring Boot 3)
```powershell
cd backend
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.11.10-hotspot"
$env:PATH = "$env:JAVA_HOME\bin;" + $env:PATH

# Standard Run:
.\mvnw.cmd spring-boot:run

# Low-Memory / Resource-Constrained Environments:
java -Xmx192m -Xms64m -XX:ReservedCodeCacheSize=32m -XX:MaxMetaspaceSize=128m -XX:CompressedClassSpaceSize=32m -XX:+UseSerialGC -jar target/demo-0.0.1-SNAPSHOT.jar
```

### 3. Start Frontend (React + Vite)
```powershell
cd frontend
npm install
npm run dev
```

---

## 📡 API Endpoints Reference

### 🔐 Authentication (`/auth`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Register a new user account | ❌ Public |
| `POST` | `/auth/login` | Authenticate user & issue tokens | ❌ Public |
| `POST` | `/auth/refresh` | Rotate and issue new token pair | ❌ Public |
| `POST` | `/auth/logout` | Revoke active refresh token | ❌ Public |
| `GET` | `/auth/health` | Service health check | ❌ Public |

### 👤 Profile & Goals (`/profile`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/profile` | Retrieve user profile & calculated BMR/TDEE goals | ✅ Bearer |
| `PUT` | `/profile` | Update physical stats & recalculate macros | ✅ Bearer |

### 📖 Exercises (`/exercises`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/exercises` | Search/filter exercises (Redis Cached) | ✅ Bearer |
| `GET` | `/exercises/{id}` | Retrieve specific exercise details | ✅ Bearer |

### 🏋️ Workouts (`/workouts`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/workouts/start` | Start live workout session | ✅ Bearer |
| `GET` | `/workouts` | Retrieve user workout history | ✅ Bearer |
| `GET` | `/workouts/{id}` | Get active workout session details | ✅ Bearer |
| `POST` | `/workouts/{id}/sets` | Log set (weight, reps, RPE, 1RM, PR check) | ✅ Bearer |
| `POST` | `/workouts/{id}/complete` | Finish workout & dispatch Kafka event | ✅ Bearer |

### 🥗 Nutrition & Hydration (`/nutrition`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/nutrition/daily` | Get daily calorie/macro consumption vs. targets | ✅ Bearer |
| `POST` | `/nutrition/meals` | Log a custom meal | ✅ Bearer |
| `POST` | `/nutrition/water` | Log water intake (ml) | ✅ Bearer |

### 🔔 Notifications (`/notifications`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/notifications` | Fetch user notification list | ✅ Bearer |
| `GET` | `/notifications/unread-count`| Get unread badge count | ✅ Bearer |
| `PUT` | `/notifications/{id}/read` | Mark notification as read | ✅ Bearer |

---

## 🛡 Security & Concurrency Highlights

* **Stateless API Design:** No `HttpSession` overhead; horizontal scaling is supported out-of-the-box.
* **Refresh Token Rotation:** Mitigates stolen token risks. An invalidated or reused token triggers immediate revocation.
* **Axios 401 Queue Pattern:** Multiple parallel 401 errors are merged into a single refresh request, preventing race condition token revocations.
* **Input Validation & Fail-Fast:** `@Valid` annotations on records enforce constraints (`@Email`, `@Size(min=8)`) before business logic execution.
* **Global Exception Handling:** `@RestControllerAdvice` guarantees clean, sanitized JSON error responses without exposing internal stack traces.

---

## 🧪 Testing & Quality Assurance

GymBro includes an automated end-to-end authentication and API verification test suite:

```powershell
cd backend
python scratch/auth_test.py
```

### Verified Test Cases:
1. ✅ User Registration (`200 OK`)
2. ✅ Duplicate Email Prevention (`400 Bad Request`)
3. ✅ Password Length Validation (`400 Bad Request`)
4. ✅ User Login with BCrypt verification (`200 OK`)
5. ✅ Invalid Credentials Handling (`400 Bad Request`)
6. ✅ Refresh Token Rotation (`200 OK`)
7. ✅ Rotated Token Reuse Blocking (`400 Bad Request`)
8. ✅ User Logout & Revocation (`204 No Content`)
9. ✅ Post-Logout Token Invalidation (`400 Bad Request`)

---

## 📜 License
This project is licensed under the MIT License.
