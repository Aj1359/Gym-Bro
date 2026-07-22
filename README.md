# GymBro

GymBro is a full-stack fitness application with a Spring Boot backend, a React + TypeScript frontend, PostgreSQL storage, and Docker-based local database setup.

## Project structure

- Backend: Spring Boot authentication API with JWT-based security
- Frontend: React application with routing and authentication pages
- Database: PostgreSQL managed through Docker Compose

## Tech stack

- Java 21 / Spring Boot
- React 19 / TypeScript / Vite
- PostgreSQL
- Docker Compose

## Getting started

### Prerequisites

- Java 21
- Node.js 20+
- Docker Desktop

### Run the database

```bash
docker compose up -d postgres
```

### Run the backend

```bash
cd backend
./mvnw spring-boot:run
```

### Run the frontend

```bash
cd frontend
npm install
npm run dev
```

## Notes

The backend uses Flyway migrations and the database configuration is defined in the application settings under the backend resources folder.
