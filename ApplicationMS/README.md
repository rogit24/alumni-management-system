# ApplicationMS - Alumni Connection Application Service

ApplicationMS handles the job application postings, tracking status of applications submitted by students, and checking status changes.

## Designated Configurations
*   **Port:** `8084`
*   **Service Name:** `application-service` (Registered with Eureka)
*   **Database:** Shares database `alumni_db` (or uses individual schema matching `alumni_db`).

---

## Tasks to Complete in this Service

### 1. Database Entity Definition
Create the JPA entity class `com.alumniconnect.application.entity.Application` with the following attributes:
*   `id` (Long, Primary Key, Auto-incremented)
*   `jobId` (Long, not null) - Reference to the job posting in JobMS.
*   `studentEmail` (String, not null) - Email of the student who applied.
*   `status` (String) - Can be `PENDING`, `REVIEWED`, `ACCEPTED`, `REJECTED`.
*   `appliedDate` (String) - Date of submission.

### 2. DTO and Mapper Setup
*   Create DTO `com.alumniconnect.application.dto.ApplicationDto` to securely transfer application details.
*   Utilize the pre-configured `ModelMapper` bean to convert between `Application` entity and `ApplicationDto`.

### 3. OpenFeign Integration (Inter-service Call)
Create the Feign client `com.alumniconnect.application.client.JobServiceClient` to call `JobMS` to validate that the job exists:
*   Add interface:
    ```java
    package com.alumniconnect.application.client;

    import org.springframework.cloud.openfeign.FeignClient;
    import org.springframework.web.bind.annotation.GetMapping;
    import org.springframework.web.bind.annotation.PathVariable;

    @FeignClient(name = "JOB-SERVICE")
    public interface JobServiceClient {
        @GetMapping("/api/v1/jobs/{id}")
        Object getJobById(@PathVariable("id") Long id);
    }
    ```

### 4. Repository Layer
Create the JpaRepository interface `com.alumniconnect.application.repository.ApplicationRepository`:
*   `public interface ApplicationRepository extends JpaRepository<Application, Long> {}`

### 5. Service Layer
Create `com.alumniconnect.application.service.ApplicationService` interface and its implementation:
*   `ApplicationDto submitApplication(ApplicationDto dto, String studentEmail)` (Must call `JobServiceClient.getJobById(dto.getJobId())` to validate the job exists before saving).
*   `List<ApplicationDto> getApplicationsForStudent(String studentEmail)`
*   `List<ApplicationDto> getApplicationsForJob(Long jobId)`
*   `ApplicationDto updateApplicationStatus(Long id, String status, String userRole)` (Only ALUMNI/ADMIN can change application status).

### 6. Controller Endpoints and Security Rules
In `com.alumniconnect.application.controller.ApplicationController`:
*   `POST /api/v1/applications`
    *   **Description:** Apply for a job.
    *   **Access:** Only `STUDENT` role can apply.
    *   **Action:** Call `submitApplication` passing DTO and `X-User-Email` header.
*   `GET /api/v1/applications/my-applications`
    *   **Description:** Get logged in student's applications.
    *   **Access:** Only `STUDENT` role.
*   `GET /api/v1/applications/job/{jobId}`
    *   **Description:** Get all applications submitted for a specific job.
    *   **Access:** Only `ALUMNI` (who posted the job) or `ADMIN`.
*   `PATCH /api/v1/applications/{id}/status`
    *   **Description:** Update status of application (e.g. ACCEPTED/REJECTED).
    *   **Access:** Only `ALUMNI` or `ADMIN`.
