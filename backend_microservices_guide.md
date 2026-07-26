# Alumni Management System - Backend Microservices Documentation

## 1. Services & Port Mapping

| Service Name | Technology | Default Port | Description |
| :--- | :--- | :--- | :--- |
| **ServiceRegistry** | Spring Cloud Eureka Server | `8761` | Service discovery and registry |
| **ApiGateway** | Spring Cloud Gateway | `8080` | Entry point, routing, and JWT authentication filter |
| **UserService** | Spring Boot, Spring Security | `8081` | User registration, authentication, and JWT token issuance |
| **ProfileMS** | Spring Boot, Spring Data JPA | `8082` | Profile CRUD, 1-to-1 user-profile constraint, ownership enforcement |
| **MessageMS** | Spring Boot, Spring Data JPA | `8083` | Student-Alumni messaging, conversation threads, read receipts |

---

## 2. Architecture & Security Flow

```
[ Frontend / Client ]
         │
         ▼
  [ ApiGateway :8080 ] ───(JWT Validation Filter)
         │
 ┌───────┼───────────────────┬───────────────────┐
 │       │                   │                   │
 ▼       ▼                   ▼                   ▼
[UserService]         [ProfileMS]         [MessageMS]       [ServiceRegistry]
  (:8081)               (:8082)             (:8083)             (:8761)
```

1. **Authentication:** Client sends credentials to `POST /api/auth/login` on `UserService`. Returns JWT signed with secret key containing `userId` and `roles`.
2. **Gateway Routing:** Requests to `/api/profiles/**` or `/api/messages/**` pass through `ApiGateway`.
3. **Identity Propagation:** `ApiGateway` validates the JWT token and forwards verified `X-User-Id` / `X-User-Roles` headers to downstream microservices.
4. **Ownership Authorization:**
   - **ProfileMS:** Enforces that users can only modify their own profile unless they possess `ROLE_ADMIN`. Ensures 1 User -> 1 Profile mapping.
   - **MessageMS:** Binds message sender identity to the authenticated user ID and verifies receiver existence before creating messages.

---

## 3. Key API Endpoints

### ProfileMS (`/api/profiles`)
- `POST /api/profiles` - Create profile for authenticated user
- `GET /api/profiles/me` - Fetch profile of logged-in user
- `GET /api/profiles/{id}` - Fetch profile by ID
- `PUT /api/profiles/{id}` - Update profile (Owner or Admin)
- `DELETE /api/profiles/{id}` - Delete profile (Admin only)

### MessageMS (`/api/messages`)
- `POST /api/messages` - Send a message to another user
- `GET /api/messages/conversations` - Fetch all conversation threads for logged-in user
- `GET /api/messages/conversations/{otherUserId}` - Fetch chat history with a specific user
- `PATCH /api/messages/{messageId}/read` - Mark a message as read

---

## 4. Verification & Integration Readiness Status

- [x] **Service Registration:** All microservices successfully register with `ServiceRegistry`.
- [x] **JWT Token Filter:** `ApiGateway` correctly blocks unauthorized requests (HTTP 401/403).
- [x] **ProfileMS Integrity:** One user -> one profile constraint verified; JWT ownership checked.
- [x] **MessageMS Functionality:** Sender binding, conversation fetching, and read receipt updates verified.
- [x] **Frontend Ready:** Service ports, request headers, and response DTO schemas aligned for frontend integration.
