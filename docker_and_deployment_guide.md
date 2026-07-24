# Dockerization and Deployment Guide

This guide details how to containerize the Alumni Management System microservices using Docker and run/deploy them locally or to the cloud.

---

## 1. Directory Structure with Docker Assets

When containerization is implemented, the project structure will look like this:

```
e:\alumni-management-system\
├── pom.xml
├── docker-compose.yml               # Orchestrates database and all containers
├── ServiceRegistry\
│   ├── Dockerfile
│   └── ...
├── ApiGateway\
│   ├── Dockerfile
│   └── ...
├── UserService\
│   ├── Dockerfile
│   └── ...
├── TemplateMS\
│   ├── Dockerfile
│   └── ...
```

---

## 2. Dockerfile Templates

Each microservice is built into a self-contained executable JAR using Maven and then run on a lightweight Java Runtime Environment (JRE) base image.

### A. Infrastructure Services (`ServiceRegistry` and `ApiGateway`)
Create a file named `Dockerfile` in `/ServiceRegistry` and `/ApiGateway` directories:

```dockerfile
# Use a lightweight JRE base image
FROM eclipse-temurin:17-jre-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the packaged jar from the target folder
COPY target/*.jar app.jar

# Run the jar file
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### B. Functional Services (`UserService`, `TemplateMS` and others)
Create a file named `Dockerfile` in `/UserService` (and eventually `/ProfileMS`, `/JobMS`, etc.):

```dockerfile
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY target/*.jar app.jar

# Wait utility (optional but recommended) to ensure DB is up before the service starts
# Expose default port
EXPOSE 8081

ENTRYPOINT ["java", "-jar", "app.jar"]
```

---

## 3. The Multi-Container Orchestra (`docker-compose.yml`)

The root `docker-compose.yml` defines the MySQL database and all microservices, tying them together on a shared virtual network so they can resolve each other by service names.

Create a `docker-compose.yml` file at the root of `e:\alumni-management-system\`:

```yaml
version: '3.8'

services:
  # 1. MySQL Database Container
  alumni-db:
    image: mysql:8.0
    container_name: alumni-db
    ports:
      - "3306:3306"
    environment:
      MYSQL_DATABASE: alumni_db
      MYSQL_ROOT_PASSWORD: manager
    networks:
      - alumni-network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-pmanager"]
      interval: 10s
      timeout: 5s
      retries: 5

  # 2. Service Registry (Eureka Server)
  service-registry:
    build:
      context: ./ServiceRegistry
      dockerfile: Dockerfile
    container_name: service-registry
    ports:
      - "8761:8761"
    networks:
      - alumni-network
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:8761/actuator/health"]
      interval: 10s
      timeout: 5s
      retries: 5

  # 3. API Gateway
  api-gateway:
    build:
      context: ./ApiGateway
      dockerfile: Dockerfile
    container_name: api-gateway
    ports:
      - "9191:9191"
    environment:
      - EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://service-registry:8761/eureka/
      - JWT_SECRET=my_super_secret_key_which_is_long_enough_for_sha256_key_and_more_characters_for_security
    depends_on:
      service-registry:
        condition: service_healthy
    networks:
      - alumni-network

  # 4. UserService (Authentication Core)
  user-service:
    build:
      context: ./UserService
      dockerfile: Dockerfile
    container_name: user-service
    ports:
      - "8081:8081"
    environment:
      - SPRING_DATASOURCE_URL=jdbc:mysql://alumni-db:3306/alumni_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
      - SPRING_DATASOURCE_USERNAME=root
      - SPRING_DATASOURCE_PASSWORD=manager
      - EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://service-registry:8761/eureka/
      - JWT_SECRET=my_super_secret_key_which_is_long_enough_for_sha256_key_and_more_characters_for_security
      - JWT_EXPIRATION_MS=86400000
    depends_on:
      alumni-db:
        condition: service_healthy
      service-registry:
        condition: service_healthy
    networks:
      - alumni-network

networks:
  alumni-network:
    driver: bridge
```

---

## 4. How to Run Locally with Docker

Follow these commands to build and start your application:

### Step A: Build the Executable JARs
Ensure Maven is installed locally. Run from the workspace root (`e:\alumni-management-system`):
```bash
mvn clean package -DskipTests
```
This command compiles all the Java services and outputs `.jar` files in their respective `target/` directories.

### Step B: Build and Start Containers
Spin up all containers (DB + Registry + Gateway + UserService):
```bash
docker-compose up --build
```

- To run in the background (detached mode): `docker-compose up -d --build`
- To stop the services: `docker-compose down`
- To stop and delete all volumes (clears database): `docker-compose down -v`

---

## 5. Cloud Deployment Roadmap

When deploying to production, follow these steps:

### A. Publish Images to a Registry
Build and tag the images, then push them to a container registry like Docker Hub or Amazon ECR:
```bash
docker build -t yourdockerhub/user-service:latest ./UserService
docker push yourdockerhub/user-service:latest
```

### B. Deployment Options
1. **Single VM (e.g., AWS EC2 / DigitalOcean Droplet)**:
   - Install Docker and Docker Compose on the VM.
   - Clone your project's `docker-compose.yml` to the VM.
   - Run `docker-compose up -d` to launch the entire environment.
2. **Managed Container Services (e.g., AWS ECS or GCP Cloud Run)**:
   - Deploy individual containers.
   - Configure AWS App Mesh or an Application Load Balancer instead of the Gateway if preferred, or run the Spring API Gateway container as the public entrance.
3. **Enterprise Kubernetes (EKS, GKE, AKS)**:
   - Convert the `docker-compose.yml` configurations into Kubernetes deployment and service YAML descriptors.
   - Use Kubernetes secret management to inject database credentials and JWT secret tokens securely.
