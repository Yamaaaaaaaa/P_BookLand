# Stage 1: Build the backend with Gradle
FROM gradle:8.5-jdk17 AS builder
WORKDIR /app

# Copy gradle files
COPY build.gradle settings.gradle ./
# COPY gradle/ gradle/
# COPY gradlew ./

# Download dependencies (cache layer)
RUN gradle dependencies --no-daemon || true

# Copy source code and build
COPY src/ src/
RUN gradle build -x test --no-daemon

# Stage 2: Run the application
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy the built jar from the builder stage
COPY --from=builder /app/build/libs/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
