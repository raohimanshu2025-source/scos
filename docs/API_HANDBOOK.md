# SCOS API DEVELOPMENT HANDBOOK & GOVERNANCE SPECIFICATION
## System: Smart City Operating System (SCOS) for Indian District Administration
### Academic Subtitle: A Formal Reference Manual for Multi-Protocol Interface Design, Idempotence Controls, and Zero-Trust Governance
**Institution:** Indian Institute of Technology Kanpur (IIT Kanpur)  
**Author:** M.Tech Thesis Research Sandbox  
**Role:** Chief API Architect & Lead Systems Integration Engineer  

---

## Executive Summary

At city scale, a Smart City Operating System (SCOS) serves as a digital operating system connecting thousands of physical actuators, environmental sensors, citizens, emergency response crews, and municipal administrators. If the API layer is designed without strict, system-wide standards, integration becomes impossible. Cascading interface breakages, resource exhausting queries, security gaps, and non-deterministic error tracking will paralyze the administration.

This **SCOS API Development Handbook** establishes the absolute, mandatory engineering standards for all past, present, and future APIs built within the SCOS ecosystem. All developers—including municipal internal teams, academic student groups, and third-party SaaS vendors—**must** adhere strictly to the protocols, schemas, patterns, and design decisions detailed in this reference manual.

---

## The Unified SCOS API Gateway & Protocol Topology

The following diagram illustrates how incoming consumer requests are validated, authorized, and routed across diverse protocols (REST, gRPC, WebSockets) through the SCOS Kong API Gateway:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        API CONSUMER CLIENTS                            │
│     (Citizen Mobile Apps, Admin Portals, IoT Devices, SCADA Nodes)     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ (TLS 1.3 / mTLS)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      SCOS KONG API GATEWAY LAYER                       │
├────────────────────────────────────────────────────────────────────────┤
│ - Token Verification (OIDC)      - Tiered Rate Limiting (Redis)        │
│ - Idempotency Lock Filters       - TLS Termination & CORS Audits       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ (Internal Routing Mesh)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     INTERNAL WORKSPACE WORKLOADS                       │
├─────────────────────────┬──────────────────────────┬───────────────────┤
│ REST/JSON Endpoints     │ High-Performance gRPC    │ WebSockets (WSS)  │
│ (FastAPI & Node.js)     │ (Internal Hops)          │ (Real-Time Feeds) │
└─────────────────────────┴──────────────────────────┴───────────────────┘
```

---

## 1. RESTful API Design Standards

SCOS REST interfaces are strictly resource-oriented and adhere to a unified request-response lifecycle.

### A. Resource Modeling and URI Design
*   **Resource Naming:** URIs **must** use plural nouns only. Verbs are strictly forbidden.
    *   *Correct:* `POST /api/v1/citizen/grievances`
    *   *Incorrect:* `POST /api/v1/citizen/createGrievance`
*   **Case Conventions:**
    *   Path Segments: Lowercase spinal-case (e.g., `/api/v1/field-crews`).
    *   Query Parameters: camelCase (e.g., `?startingAfter=uuid-1234`).
    *   JSON Payloads: snake_case (e.g., `{"department_id": "kesco"}`).
*   **Hierarchy Modeling:**
    ```
    /api/v1/departments                      <-- Retrieve list of departments
    /api/v1/departments/{id}                 <-- Retrieve specific department
    /api/v1/departments/{id}/crews           <-- Retrieve crews of specific department
    /api/v1/departments/{id}/crews/{crew_id} <-- Retrieve specific crew member
    ```

---

### B. HTTP Verb Mapping Rules
All APIs must leverage standard HTTP verbs to convey mutations predictably:

| Verb | Safe | Idempotent | Target URI | Purpose | Successful Status Code |
| :--- | :---: | :---: | :--- | :--- | :--- |
| **`GET`** | Yes | Yes | `/v1/grievances` | Retrieve resources. No state changes allowed. | `200 OK` |
| **`POST`** | No | No | `/v1/grievances` | Create a new resource. | `201 Created` |
| **`PUT`** | No | Yes | `/v1/grievances/{id}`| Completely replace an existing resource. | `200 OK` |
| **`PATCH`**| No | No | `/v1/grievances/{id}`| Partially mutate properties of a resource. | `200 OK` |
| **`DELETE`**| No | Yes | `/v1/grievances/{id}`| Remove or logically archive a resource. | `204 No Content` |

---

### C. Standard Response Wrappers
To keep client-side parsers clean and consistent, all successful collection APIs (returning arrays) must wrap their payloads using a standardized metadata envelope:

```json
{
  "object": "list",
  "data": [
    {
      "id": "grv_8930814f16fffff",
      "title": "Water pipeline burst",
      "status": "OPEN",
      "created_at": "2026-07-15T07:01:00Z"
    }
  ],
  "has_more": true,
  "total_records": 1240,
  "links": {
    "next": "/api/v1/citizen/grievances?limit=1&startingAfter=grv_8930814f16fffff"
  }
}
```

---

## 2. GraphQL Usage Policy

GraphQL is **not** permitted as a universal replacement for REST. It is restricted to a single specific use-case: **complex dashboard data hydration**.

### A. Authorized GraphQL Constraints
*   **Read-Only Operations:** SCOS prohibits mutations via GraphQL. All data insertions, updates, and deletions **must** go through REST endpoints.
*   **Gateway Safeguards:**
    *   **Maximum Depth:** Queries are restricted to a depth of **4 levels** to prevent infinite recursion attacks.
    *   **Complexity Scoring:** Every field is assigned a cost weight. Any query exceeding a total cost value of $100$ is rejected by the gateway.

---

## 3. Query Parameter Standardization

To prevent database performance degradation during large queries, SCOS enforces strict guidelines for collection parameters:

---

### A. Pagination Standards
SCOS supports two distinct pagination patterns:

1.  **Cursor-Based Pagination (Mandatory for high-frequency, growing lists):**
    *   Prevents record-skipping anomalies when new data is added during pagination scans.
    *   *Parameters:* `limit` (max 100, default 20), `startingAfter` (cursor token/ID).
    *   *Usage:* `/api/v1/citizen/grievances?limit=15&startingAfter=grv_8930814f16fffff`
2.  **Offset-Based Pagination (Allowed for static directories only):**
    *   *Parameters:* `limit` (max 50), `offset` (integer).
    *   *Usage:* `/api/v1/departments?limit=10&offset=20`

---

### B. Advanced Filtering Rules
Filtering queries must utilize a structured bracket syntax to support advanced operators:
*   *Equality:* `filter[status]=OPEN`
*   *In-List Queries:* `filter[ward_id][in]=ward_01,ward_02`
*   *Range Queries:* `filter[created_at][gte]=2026-07-01T00:00:00Z&filter[created_at][lte]=2026-07-15T00:00:00Z`

---

### C. Sorting Standards
Sorting rules are specified using a single, highly readable query string, leveraging prefixes to control direction:
*   *Syntax:* `?sort={property}` (ascending) or `?sort=-{property}` (descending).
*   *Composite Example:* `/api/v1/citizen/grievances?sort=-created_at,status`

---

## 4. API Versioning Strategy

SCOS enforces a strict **URL Path Versioning** policy to protect integrations from breaking during system updates.

*   **Syntax Format:** `/api/v{major_version_integer}/{subdomain}/{resource}`
    *   *Correct:* `/api/v1/citizen/grievances`
    *   *Incorrect:* `/api/v1.2/citizen/grievances` or `/api/citizen/v1/grievances`
*   **Deprecation Policy:**
    *   When an API signature breaks (requiring a minor or major update), a new major path version (e.g., `/api/v2/...`) is introduced.
    *   The deprecated endpoint continues to serve traffic for exactly **180 days** while returning warning headers:
        ```http
        Deprecation: true
        Sunset: Sat, 10 Jan 2027 23:59:59 GMT
        Link: <https://api.scos.gov.in/docs/v2>; rel="successor-version"
        ```

---

## 5. Security & Authentication Layer

All API requests are validated through a zero-trust multi-layer authentication framework:

```
[ Incoming Request ] ──► [ JWT Bearer Auth ] ──► [ RBAC Claims Audit ] ──► [ Process Request ]
                                │
                                ├── Invalid Token ──► [ HTTP 401 Unauthorized ]
                                └── Insufficient Scope ──► [ HTTP 403 Forbidden ]
```

### A. Authorization Protocols (OIDC)
*   **Bearer Tokens:** Public and administrative endpoints require an `Authorization: Bearer <JWT>` header, verified against Keycloak.
*   **Token Verification Constraints:** Internal microservices **must** verify the token's cryptographic signature, expiration dates (`exp`), and matching issuer (`iss`) parameters before execution.

### B. Role-Based Access Control (RBAC)
Every JWT exposes specific role claims. Microservice controllers must map incoming operations directly against these roles:
*   `CITIZEN`: Restricted to editing or viewing their *own* profile and grievances.
*   `FIELD_CREW`: Access restricted to fetching allocated work orders and uploading completion media.
*   `SUPERVISOR`: Allowed to edit all tickets and assign crews within their designated department boundary.
*   `DISTRICT_MAGISTRATE`: Global read-only access to city KPIs and administrative bypass overrides.

---

## 6. Request Validation & Error Handling

To maintain high data quality, all inputs are validated before execution, and errors return machine-readable responses conforming strictly to **RFC 7807 (Problem Details for HTTP APIs)**:

---

### A. Input Schema Validation (Zod Schema Blueprint)
APIs **must** validate incoming payloads against a schema validator before executing downstream controllers.

```typescript
// Standard Schema Definition for a New Grievance
import { z } from 'zod';

export const CreateGrievanceDTO = z.object({
  title: z.string().min(10).max(100),
  description: z.string().min(20).max(1000),
  ward_id: z.string().regex(/^ward_[a-z0-9]+$/),
  latitude: z.number().min(25.0).max(27.0), // Geographically bounded for Kanpur
  longitude: z.number().min(79.0).max(81.0),
  media_url: z.string().url().optional(),
});
```

---

### B. Standardized RFC 7807 Error Responses
When a request fails validation or triggers a system error, the API returns a structured JSON payload detailing the problem:

```json
{
  "type": "https://errors.scos.gov.in/invalid-payload",
  "title": "Unprocessable Entity",
  "status": 422,
  "detail": "The payload failed validation checks. Please correct the specified fields.",
  "instance": "/api/v1/citizen/grievances",
  "errorCode": "SCOS_ERR_VALIDATION_FAILED",
  "timestamp": "2026-07-15T07:01:00Z",
  "invalid_params": [
    {
      "name": "latitude",
      "reason": "Value is outside Kanpur district geographic boundaries."
    }
  ]
}
```

---

## 7. Rate Limiting & Idempotency Controls

---

### A. Tiered Rate Limiting Policies
The Kong API Gateway enforces standard rate-limit buckets managed via Redis:
*   **Public/Citizen Ingress:** Restricted to $60\text{ requests per minute}$ per IP address.
*   **IoT Telemetry Streams:** Limited dynamically based on device profiles (e.g., $1\text{ request per second}$ per water meter).
*   **Emergency Dispatch Triggers:** Overrides standard restrictions, bypasses rate filters, and uses dedicated network channels.

---

### B. Mutative Idempotency Locks
To prevent duplicate state mutations during network retries, all mutative POST and PATCH APIs **must** enforce **Idempotency Key Verification**:
1.  Clients submit a unique UUID token via the `Idempotency-Key` header.
2.  The gateway checks Redis for an active lock on that key:
    *   *Case A (Active Lock found):* Returns `409 Conflict`, indicating the transaction is already being processed.
    *   *Case B (Completed Cache found):* Instantly returns the cached response, skipping backend recalculations.
    *   *Case C (New Key):* Acquries a lock in Redis with a 24-hour expiration window and executes the request.

---

## 8. WebSockets & Real-Time Streaming APIs

SCOS uses WebSockets (`wss://`) to stream real-time sensor updates and dispatch coordinates to active client interfaces.

### A. Connection Handshake Policy
*   **Security:** WebSocket connections **must** authenticate during the initial HTTP upgrade handshake by verifying an OIDC token passed in the `Sec-WebSocket-Protocol` header.
*   **Port Binding:** WebSockets bind to port `3000` under reverse proxy routing configurations.

### B. Frame Format Specification
All WebSocket communication frames must utilize a structured JSON format to coordinate events predictably:

```json
{
  "event": "scos.telemetry.water",
  "payload": {
    "device_id": "scada_flow_meter_10",
    "flow_rate_lps": 42.15,
    "pressure_psi": 28.4,
    "timestamp": "2026-07-15T07:01:00Z"
  }
}
```

---
*This API development handbook establishes the formal interface designs, validation rules, security controls, and rate-limiting protocols required to develop and integrate APIs safely and seamlessly across the Smart City Operating System.*
