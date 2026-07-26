# JobMS - Alumni Connection Job Service

JobMS handles the job listings, careers board, search functionality, and job details database for the Alumni Management System.

## Designated Configurations
*   **Port:** `8083`
*   **Service Name:** `job-service` (Registered with Eureka)
*   **Database:** Shares database `alumni_db` (or uses individual schema matching `alumni_db`).

---

## Tasks to Complete in this Service

### 1. Database Entity Definition
Create the JPA entity class `com.alumniconnect.job.entity.Job` with the following attributes:
*   `id` (Long, Primary Key, Auto-incremented)
*   `title` (String, not null)
*   `company` (String, not null)
*   `salary` (String)
*   `location` (String)
*   `description` (String, length = 1000)
*   `postedByEmail` (String) - Stores the email of the alumni/admin who posted the job.

### 2. DTO and Mapper Setup
*   Create DTO `com.alumniconnect.job.dto.JobDto` to securely transfer job details between service and client.
*   Utilize the pre-configured `ModelMapper` bean to convert between `Job` entity and `JobDto`.

### 3. Repository Layer
Create the JpaRepository interface `com.alumniconnect.job.repository.JobRepository`:
*   `public interface JobRepository extends JpaRepository<Job, Long> {}`

### 4. Service Layer
Create `com.alumniconnect.job.service.JobService` interface and its implementation:
*   `JobDto createJob(JobDto jobDto, String userEmail)`
*   `List<JobDto> getAllJobs()`
*   `JobDto getJobById(Long id)`
*   `JobDto updateJob(Long id, JobDto jobDto, String userEmail, String userRole)`
*   `void deleteJob(Long id, String userEmail, String userRole)`

### 5. Controller Endpoints and Security Rules
In `com.alumniconnect.job.controller.JobController`:
*   `POST /api/v1/jobs`
    *   **Description:** Post a new job opportunity.
    *   **Access:** Only roles `ALUMNI` or `ADMIN`.
    *   **Action:** Extract `X-User-Email` and `X-User-Role` headers. Validate user role. Save job.
*   `GET /api/v1/jobs`
    *   **Description:** Fetch all job opportunities.
    *   **Access:** Any authenticated user (`STUDENT`, `ALUMNI`, `ADMIN`).
*   `GET /api/v1/jobs/{id}`
    *   **Description:** Fetch single job details.
    *   **Access:** Any authenticated user.
*   `PUT /api/v1/jobs/{id}`
    *   **Description:** Edit job posting details.
    *   **Access:** Only `ADMIN` or the creator of the job (`postedByEmail` matches `X-User-Email`).
*   `DELETE /api/v1/jobs/{id}`
    *   **Description:** Remove a job posting.
    *   **Access:** Only `ADMIN` or the creator of the job (`postedByEmail` matches `X-User-Email`).

### 6. Centralized API Gateway Setup
In the API Gateway (`ApiGateway` application properties):
*   Add a route mapping Swagger documentation of Job Service to the aggregated Swagger UI.
*   Add the Swagger endpoint: `/api/v1/jobs/v3/api-docs` to the gateway's dropdown configuration list.
