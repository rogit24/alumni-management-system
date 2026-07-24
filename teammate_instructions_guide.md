# Teammate Development Guide: Building Alumni Microservices

Welcome team! This document serves as the guide for **Member 2**, **Member 3**, and **Member 4** to build and integrate their microservices into our shared Alumni Management System.

Our Lead Architect (**Member 1**) has set up the core infrastructure: the **Service Registry**, the **API Gateway** (which handles security), the **UserService** (authentication), and a **TemplateMS** folder.

---

## 1. Work Allocation & Port Configurations

Please find your service descriptions and designated port allocations below:

| Member | Role / Scope | Deliverables | Port |
| :--- | :--- | :--- | :--- |
| **Member 2** | **Job & Application Catalog** | - **JobMS** (Manage job listings & search)<br>- **ApplicationMS** (Manage job applications) | `8083`<br>`8084` |
| **Member 3** | **User Profile & Communication** | - **ProfileMS** (Manage student & alumni profiles)<br>- **MessageMS** (Manage peer-to-peer chat logs) | `8082`<br>`8086` |
| **Member 4** | **Referral & Alert Orchestrator** | - **ReferralMS** (Orchestrates referrals via Feign)<br>- **NotificationMS** (Manages system notifications & alerts) | `8085`<br>`8087` |

---

## 2. Overview of the Security Contract

To make development simple, **you do not need to install Spring Security or configure JWT validation in your microservices.** 

Here is how security is handled for you:
1. A client calls your service through the API Gateway (port `9191`).
2. The API Gateway validates the client's JWT token.
3. If valid, the Gateway extracts the user's details and forwards them to your service in the HTTP request headers:
   - `X-User-Email`: The email of the logged-in user.
   - `X-User-Role`: The role of the user (e.g., `STUDENT`, `ALUMNI`, `ADMIN`).

---

## 3. Instructions for Members 2 & 3: Building a New Service

Follow these steps to create your service (e.g., `JobMS`, `ProfileMS`, `MessageMS`) from the template:

### Step 1: Copy and Rename the Template
1. Duplicate the `TemplateMS` folder at the root of the project.
2. Rename the folder to your service name (e.g., `JobMS`).

### Step 2: Update the `pom.xml`
Open the `pom.xml` inside your new service folder and modify:
1. The `<artifactId>` to match your service directory (e.g., `job-ms`).
2. The `<name>` and `<description>`.

Example modification:
```xml
<artifactId>job-ms</artifactId>
<name>JobMS</name>
<description>Alumni Connection Job Service</description>
```

### Step 3: Register in the Root `pom.xml`
Open the root `pom.xml` (at the very root of the repository) and add your directory to the `<modules>` list:
```xml
<modules>
    <module>ServiceRegistry</module>
    <module>ApiGateway</module>
    <module>UserService</module>
    <module>TemplateMS</module>
    <module>JobMS</module> <!-- Added by Member 2 -->
    <module>MessageMS</module> <!-- Added by Member 3 -->
</modules>
```

### Step 4: Configure `application.properties`
Modify `src/main/resources/application.properties` inside your service:
1. Update `spring.application.name` to register on Eureka. Use all-uppercase standard names (e.g., `JOB-SERVICE`, `MESSAGE-SERVICE`).
2. Assign your service port (refer to Section 1 for assignments).
3. Set your service's database schema name (we can share `alumni_db` or use independent schemas).

Example properties:
```properties
spring.application.name=JOB-SERVICE
server.port=8083

# Database configuration
spring.datasource.url=jdbc:mysql://localhost:3306/alumni_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=manager

# Register with Service Registry
eureka.client.serviceUrl.defaultZone=http://localhost:8761/eureka/
```

### Step 5: Read User Context in Controllers
When writing controllers, you can access the logged-in user's email and role by annotating parameters with `@RequestHeader`.

Here is a reference model:
```java
package com.alumniconnect.jobservice.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/jobs")
public class JobController {

    @PostMapping
    public ResponseEntity<String> createJob(
            @RequestBody JobDto jobDto,
            @RequestHeader("X-User-Email") String userEmail,
            @RequestHeader("X-User-Role") String userRole) {
        
        // 1. You automatically know the user is authenticated because Gateway passed the request
        // 2. You can restrict features based on role:
        if (!"ALUMNI".equalsIgnoreCase(userRole) && !"ADMIN".equalsIgnoreCase(userRole)) {
            return ResponseEntity.status(403).body("Only Alumni or Admin can post jobs!");
        }

        // 3. Process business logic using userEmail...
        return ResponseEntity.ok("Job posted successfully by: " + userEmail);
    }
}
```

---

## 4. Instructions for Member 4: Implementing the Orchestrator (`ReferralMS`)

As Member 4, your service (`ReferralMS`) needs to query details from other services. You will use **Spring Cloud OpenFeign** to perform load-balanced Rest calls easily.

### Step 1: Verify Dependencies
Ensure the OpenFeign starter is in your service's `pom.xml`:
```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-openfeign</artifactId>
</dependency>
```

### Step 2: Enable Feign Clients
Annotate your main application class with `@EnableFeignClients`:
```java
package com.alumniconnect.referralservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
public class ReferralApplication {
    public static void main(String[] args) {
        SpringApplication.run(ReferralApplication.class, args);
    }
}
```

### Step 3: Create Feign Client Declarations
Create interfaces representing the APIs of other microservices. Spring Cloud automatically builds the implementation and routes calls through Eureka.

**Call to UserService (to fetch User information):**
```java
package com.alumniconnect.referralservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

// Note: name matches the spring.application.name of Member 1's UserService
@FeignClient(name = "USER-SERVICE")
public interface UserServiceClient {

    @GetMapping("/api/v1/auth/users/{id}")
    UserDto getUserById(@PathVariable("id") Long id);
}
```

**Call to JobService (to check Job availability):**
```java
package com.alumniconnect.referralservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "JOB-SERVICE")
public interface JobServiceClient {

    @GetMapping("/api/v1/jobs/{id}")
    JobDto getJobById(@PathVariable("id") Long id);
}
```

### Step 4: Use Clients in Service Layer
Inject the interfaces into your Service layer and make simple Java calls:
```java
@Service
public class ReferralServiceImpl implements ReferralService {

    private final UserServiceClient userServiceClient;
    private final JobServiceClient jobServiceClient;

    public ReferralServiceImpl(UserServiceClient userServiceClient, JobServiceClient jobServiceClient) {
        this.userServiceClient = userServiceClient;
        this.jobServiceClient = jobServiceClient;
    }

    public ReferralResponse requestReferral(Long studentId, Long jobId) {
        // Query external services synchronously!
        UserDto student = userServiceClient.getUserById(studentId);
        JobDto job = jobServiceClient.getJobById(jobId);

        // Perform validation and persist locally...
        return new ReferralResponse("Referral requested for " + student.getName() + " at " + job.getCompany());
    }
}
```

---

## 5. API Documentation & Swagger Integration

Every service generated from `TemplateMS` has Swagger/OpenAPI support enabled out-of-the-box.

### Viewing Your Service's Swagger Directly:
When your microservice is running, you can access its local interactive Swagger UI at:
- **`http://localhost:<port>/swagger-ui/index.html`** (e.g., `http://localhost:8083/swagger-ui/index.html` for `JobMS`).

### Integrating Your Service with the Gateway Swagger Aggregator:
We have set up a centralized Swagger dashboard on the **API Gateway** (`http://localhost:9191/swagger-ui.html`). To add your microservice to this central dropdown:

1. **Add routing rules in API Gateway** `application.properties`:
   Add a route mapping matching your service's context path to its `/v3/api-docs` endpoint:
   ```properties
   # Route X: JobMS Swagger docs mapping
   spring.cloud.gateway.routes[X].id=job-service-docs
   spring.cloud.gateway.routes[X].uri=lb://JOB-SERVICE
   spring.cloud.gateway.routes[X].predicates[0]=Path=/api/v1/jobs/v3/api-docs
   spring.cloud.gateway.routes[X].filters[0]=RewritePath=/api/v1/jobs/v3/api-docs, /v3/api-docs
   ```
2. **Add to the drop-down list** in API Gateway `application.properties`:
   ```properties
   springdoc.swagger-ui.urls[X].name=Job Service
   springdoc.swagger-ui.urls[X].url=/api/v1/jobs/v3/api-docs
   ```

Now, anyone running the Gateway can select **Job Service** from the single central UI dropdown on `http://localhost:9191/swagger-ui.html` and test your service without leaving the gateway port!

---

## 6. Local Developer Testing Workflow

### Testing Your Microservice Alone (Fast Feedback Loop)
You can test your controller endpoints locally without running the Gateway or Eureka Server:
1. Start your microservice (e.g., from IDE or run `mvn spring-boot:run` in your folder).
2. Open Postman.
3. Send requests directly to your port (e.g., `http://localhost:8083/api/v1/jobs`).
4. In Postman, add custom headers manually to simulate the Gateway:
   - Key: `X-User-Email`, Value: `student@alumni.com`
   - Key: `X-User-Role`, Value: `STUDENT`

### Testing the Integrated Mesh
To test the whole system end-to-end:
1. Start `ServiceRegistry` (Eureka).
2. Start `UserService` and `ApiGateway`.
3. Start your microservice (e.g., `JobMS`).
4. Ensure all services show up on the Eureka Dashboard: `http://localhost:8761`.
5. Call register/login on `http://localhost:9191/api/v1/auth/login` to obtain a JWT token.
6. Make API requests through the API Gateway: `http://localhost:9191/api/v1/jobs` with the header: `Authorization: Bearer <your_jwt_token>`.
7. You can also view and test all endpoints using the centralized Swagger dashboard at: `http://localhost:9191/swagger-ui.html`.
