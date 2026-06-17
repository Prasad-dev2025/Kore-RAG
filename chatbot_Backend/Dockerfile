# Use the official Eclipse Temurin image for Java 25
FROM eclipse-temurin:25-jdk-jammy

# Set the working directory inside the container
WORKDIR /app

# Copy the JAR file from the local target folder to the container
# This assumes you have already run './mvnw clean package' locally
COPY target/*.jar app.jar

# Expose the port your Spring Boot app uses
EXPOSE 8080

# Run the JAR file when the container starts
ENTRYPOINT ["java", "-jar", "app.jar"]