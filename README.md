# 🎓 Alumni Management System (AMS)

[![Microservices](https://img.shields.io/badge/Architecture-Microservices-blueviolet?style=for-the-badge)](https://microservices.io/)
[![Java](https://img.shields.io/badge/Java-17-orange?style=for-the-badge&logo=openjdk)](https://openjdk.org/)
[![C#](https://img.shields.io/badge/.NET-8.0-blue?style=for-the-badge&logo=dotnet)](https://dotnet.microsoft.com/)
[![Python](https://img.shields.io/badge/Python-FastAPI-green?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-Vite-blue?style=for-the-badge&logo=react)](https://react.dev/)

An enterprise-grade, secure, polyglot microservices platform designed to bridge the gap between students, alumni, and administrators. The system facilitates job discoveries, referral requests, career guidance, and direct peer-to-peer communication.

---

## 🏛️ System Architecture

AMS uses a database-per-service pattern and a polyglot backend optimized for specific workloads:
*   **Java (Spring Boot / Cloud):** Core enterprise business logic requiring strong transactional guarantees (Authentication, Profiles, Jobs, Applications, Referrals, Messages).
*   **C# (.NET 8 + Steeltoe):** High-throughput asynchronous Notification Subsystem.
*   **Python (FastAPI + LangChain):** AI microservice orchestrating a career advisor chatbot using RAG and an automated job description writer.
*   **React (Vite + Vanilla CSS):** Responsive Single-Page Application (SPA) client.

### Core System Block Diagram

```mermaid
graph TD
    Client[React Frontend - Vite] -->|Port 9191| Gateway[Spring Cloud API Gateway]
    Gateway -->|Verify Token & Fetch Route| Registry[Netflix Eureka Service Registry :8761]
    
    subgraph Microservices Cluster
        Gateway -->|Route /api/v1/auth| UserService[UserService :8081]
        Gateway -->|Route /api/v1/profiles| ProfileMS[ProfileMS :8082]
        Gateway -->|Route /api/v1/jobs| JobMS[JobMS :8083]
        Gateway -->|Route /api/v1/applications| ApplicationMS[ApplicationMS :8084]
        Gateway -->|Route /api/v1/referrals| ReferralMS[ReferralMS :8085]
        Gateway -->|Route /api/v1/messages| MessageMS[MessageMS :8086]
        Gateway -->|Route /api/v1/notifications| NotificationMS[.NET 8 / EF Core :8087]
        Gateway -->|Route /api/v1/ai| AIService[Python FastAPI AI :8000]
    end
    
    subgraph Inter-Service Comms
        ReferralMS -->|Feign Client| UserService
        ReferralMS -->|Feign Client| NotificationMS
        ApplicationMS -->|Feign Client| JobMS
        AIService -->|HTTP REST| JobMS
        AIService -->|HTTP REST| ProfileMS
    end

    subgraph Persistence Layer (Database-per-Service)
        UserService -->|MySQL| DB_User[(user_db)]
        ProfileMS -->|MySQL| DB_Profile[(profile_db)]
        JobMS -->|MySQL| DB_Job[(job_db)]
        ApplicationMS -->|MySQL| DB_App[(application_db)]
        ReferralMS -->|MySQL| DB_Ref[(referral_db)]
        MessageMS -->|MySQL| DB_Msg[(message_db)]
        NotificationMS -->|MySQL| DB_Notif[(notification_db)]
        AIService -->|Vector DB| ChromaDB[(Chroma VectorDB)]
    end
```

---

## 👥 The Development Team & Contributions

| Role / Scope | Team Member | Primary Deliverables & Accomplishments |
| :--- | :--- | :--- |
| **Lead Architect & Systems Architect** | **Rohit Raj Singh** | <ul><li>Configured root Maven parent POM & modular infrastructure.</li><li>Engineered API Gateway custom JWT authentication filter (`AuthenticationFilter.java`).</li><li>Designed database-per-service isolation schemas & container bridges.</li><li>Created the React/Vite front-end client with interceptors for token routing.</li><li>Orchestrated multi-container deployment via Docker Compose with healthchecks.</li></ul> |
| **Job & Application Catalog** | **Naveen Dandgula** | <ul><li>**JobMS (Port `8083`):** Manages job listings, details, and search capabilities.</li><li>**ApplicationMS (Port `8084`):** Manages job applications, applicant details, and statuses.</li><li>Implemented controller validations and mapped entity-to-DTO schemas.</li></ul> |
| **User Profile & Communication** | **Tejeswar Reddy** | <ul><li>**ProfileMS (Port `8082`):** Manages student & alumni profiles with strict 1-to-1 user mapping.</li><li>**MessageMS (Port `8086`):** Manages peer-to-peer message exchanges and chat history.</li><li>Enforced user-ownership checks on sensitive CRUD endpoints.</li></ul> |
| **Referral & Alert Orchestrator** | **Pratiksha** | <ul><li>**ReferralMS (Port `8085`):** Orchestrates referral requests via Spring Cloud OpenFeign.</li><li>**NotificationMS (Port `8087`):** High-throughput alerts using C# ASP.NET Core & EF Core.</li><li>Configured Steeltoe integration for notification server auto-discovery.</li></ul> |

---

## 🛠️ Technology Stack & Mapping

### Service Catalog

| Service Name | Technology / Framework | Default Port | Description |
| :--- | :--- | :--- | :--- |
| **ServiceRegistry** | Spring Cloud Eureka Server | `8761` | Microservice registry and discovery directory |
| **ApiGateway** | Spring Cloud Gateway | `9191` | Gateway router, CORS handler, and JWT validation edge |
| **UserService** | Spring Boot, Spring Security, BCrypt | `8081` | Registration, credential validation, OTP email dispatch, and JWT issuance |
| **ProfileMS** | Spring Boot, Spring Data JPA, MySQL | `8082` | Student and alumni profiles with document upload links |
| **JobMS** | Spring Boot, Spring Data JPA, MySQL | `8083` | Career job postings catalog and query logic |
| **ApplicationMS** | Spring Boot, Spring Data JPA, MySQL | `8084` | Job applications and submission tracking |
| **ReferralMS** | Spring Boot, OpenFeign, MySQL | `8085` | Referral requests connecting students and alumni |
| **MessageMS** | Spring Boot, Spring Data JPA, MySQL | `8086` | Chat messages database and reading receipt flags |
| **NotificationMS** | ASP.NET Core Web API, EF Core, MySQL | `8087` | System alert triggers and dispatching client notifications |
| **AiService** | FastAPI, LangChain, ChromaDB | `8000` | AI career bot (RAG) and automated job details generation |

---

## 🛡️ Security Flow (Edge Authentication)

AMS implements a **stateless, edge-security model** to ensure low latency and high scalability:
1. **Authentication:** The client sends credentials to the `/api/v1/auth/login` endpoint on `UserService`. It returns a cryptographically signed JWT token.
2. **Gateway Verification:** The `ApiGateway` intercepts incoming requests, validates the JWT signature, and prevents unauthorized requests.
3. **Identity Propagation:** Upon validation, the gateway injects the user metadata into custom headers:
   * `X-User-Id`: Authenticated User ID
   * `X-User-Email`: Registered email address
   * `X-User-Role`: Assigned role (`STUDENT`, `ALUMNI`, `ADMIN`)
4. **Downstream Simplicity:** Functional services (e.g., `JobMS`, `ProfileMS`) read these headers for local access verification, without needing Spring Security or token decryption overhead.

---

## ⚡ Getting Started (Local Development)

### Prerequisites
* Java 17 JDK
* .NET 8.0 SDK
* Python 3.10+
* Node.js & npm
* MySQL Server (or Docker)

### Step 1: Package Java Services
Run from the workspace root directory:
```bash
mvn clean package -DskipTests
```

### Step 2: Spin Up Containers
Launch the databases and core services with Docker Compose:
```bash
docker-compose up --build
```
This starts the MySQL database, Eureka Service Registry, API Gateway, and UserService.

### Step 3: Run Client Application
Navigate to the client directory and start the Vite dev server:
```bash
cd alumni-system-client
npm install
npm run dev
```

---

## ☁️ Deployment

For details on deploying the application to AWS (utilizing Free Tier EC2, swap space creation, and docker setup), refer to [docker_and_deployment_guide.md](file:///e:/alumni-management-system/docker_and_deployment_guide.md).
