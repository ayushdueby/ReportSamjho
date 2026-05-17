FROM maven:3.9-eclipse-temurin-21 AS dev

WORKDIR /app

# Cache dependencies first
COPY pom.xml .
RUN mvn dependency:go-offline -q

# Copy source
COPY src ./src

EXPOSE 5001

CMD ["mvn", "spring-boot:run"]
