# ── Build Stage ──
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Cache dependencies
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .
RUN mvn dependency:go-offline -B

# Copy source and package JAR
COPY src ./src
RUN mvn clean package -DskipTests

# ── Runtime Stage ──
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Add non-root system user for security
RUN addgroup -S gymbro && adduser -S gymbro -G gymbro
USER gymbro:gymbro

# Copy compiled artifact
COPY --from=build --chown=gymbro:gymbro /app/target/*.jar app.jar

# JVM Performance & Memory flags for containers
ENV JAVA_OPTS="-Xms128m -Xmx384m -XX:+UseSerialGC -XX:+ExitOnOutOfMemoryError"

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/auth/health || exit 0

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
