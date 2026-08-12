# BACKEND ARCHITECTURE & DISTRIBUTED MICROSERVICES SPECIFICATION
## System: Smart City Operating System (SCOS) for Indian District Administration
### Academic Subtitle: A Distributed Microservice Mesh, Asynchronous Event Pipelines, and Fault-Tolerant Workflow Orchestration Engines
**Institution:** Indian Institute of Technology Kanpur (IIT Kanpur)  
**Author:** M.Tech Thesis Research Sandbox  
**Role:** Chief Backend Architect  

---

## Executive Summary

At city scale, a Smart City Operating System must process high-velocity, real-time sensor streams while simultaneously managing legal public complaints, coordinating emergency operations, and dynamically allocating municipal resources. Handling these requirements within a single, tightly-coupled monolithic backend introduces critical vulnerabilities, including cascading service failures, database lockups, and unscalable ingestion bottlenecks.

The **Smart City Operating System (SCOS)** Backend implements a **fully distributed, event-driven microservices architecture**. This design decouples service responsibilities into distinct **Bounded Contexts**, routes traffic through a high-performance API Gateway, orchestrates asynchronous jobs using distributed task queues, and enforces data integrity through deterministic workflow engines and cryptographic audit ledgers.

This document details the backend architectural layers, defines service boundaries, explains workflow engines, outlines security protocols, and traces exactly how requests travel through the SCOS backend ecosystem.

---

## SCOS Backend System Topology

The following diagram illustrates the structural layout of the SCOS backend layers, depicting the ingestion path, internal microservice boundaries, event buses, and persistent storage layers:

```
                  [ PUBLIC / EXTERNAL INGRESS ]
                                │
                                ▼
         ┌──────────────────────────────────────────────┐
         │          KONG API GATEWAY (INGRESS)          │ <──> [ Keycloak Auth ]
         └──────────────────────┬───────────────────────┘
                                │ (mTLS / gRPC / REST)
                                ▼
         ┌──────────────────────────────────────────────┐
         │             ISTIO SERVICE MESH               │
         ├──────────────────────┬───────────────────────┤
         │  Node.js Services    │   Python Services     │
         │  - Citizen Service   │   - Cognitive Agent   │
         │  - Scheduler Service │   - Predictive Engine │
         │  - Sensor Ingestion  │   - Twin GIS Service  │
         └──────────┬───────────┴───────────┬───────────┘
                    │                       │
                    ▼                       ▼
         ┌──────────────────────────────────────────────┐
         │             APACHE KAFKA EVENT BUS           │
         └──────────────────────┬───────────────────────┘
                                │
         ┌──────────────────────┴───────────────────────┐
         │            ASYNCHRONOUS EXECUTORS            │
         │   - BullMQ (Node)     - Celery (Python)      │
         └──────────────────────┬───────────────────────┘
                                │
                                ▼
         ┌──────────────────────────────────────────────┐
         │               PERSISTENCE LAYER              │
         │  - PostgreSQL + PostGIS  - Neo4j Graph DB    │
         │  - Redis Cache Cluster   - MinIO Object Store│
         └──────────────────────────────────────────────┘
```

---

## 1. Microservices & Bounded Service Boundaries

To enforce high modularity and fault isolation, the SCOS backend is divided into decoupled microservices. Each service operates within a strict **Bounded Context**, maintains its own database schema, and exposes distinct REST, gRPC, and Kafka interfaces:

### A. SCOS-CITIZEN (Node.js/TypeScript)
*   **Domain Boundary:** Handles citizen registration, profile management, and the lifecycle of civil grievances.
*   **Data Store:** PostgreSQL (Citizen schema, profiles, and ticket transaction records).
*   **Key Operations:** Submitting tickets, fetching user status histories, and syncing records with national CPGRAMS databases.

### B. SCOS-COGNITIVE (Python/FastAPI)
*   **Domain Boundary:** Executes all generative AI, natural language translation, and multi-agent operations.
*   **Data Store:** Redis (active prompt histories) + Vector Embeddings Cache.
*   **Key Operations:** Translating Hinglish complaints, generating conversational diagnostic questions, and executing the WPACS multi-agent negotiation loop.

### C. SCOS-SCHEDULER (Node.js/TypeScript)
*   **Domain Boundary:** Manages field-crew shifts, tool inventories, and active dispatch route scheduling.
*   **Data Store:** PostgreSQL (Rosters, inventories, and route allocation logs).
*   **Key Operations:** Dispatching repair crews, auditing materials, and calculating optimal vehicle routes.

### D. SCOS-TWIN (Python/FastAPI)
*   **Domain Boundary:** Coordinates the 3D Geographic Information System (GIS) and district spatial calculations.
*   **Data Store:** PostgreSQL with PostGIS extension + Neo4j (structural topology graphs).
*   **Key Operations:** Spatial-temporal geofencing, H3 hexagonal coordinate mapping, and 3D utility collision verifications.

### E. SCOS-INGESTION (Node.js/TypeScript)
*   **Domain Boundary:** Ingests high-frequency IoT data from smart district sensors.
*   **Data Store:** TimescaleDB (time-series telemetry logs).
*   **Key Operations:** Parsing MQTT packets, running Kalman filtering, and publishing sensor updates to the event bus.

---

## 2. Business Logic, State Machines, & Workflow Engine

SCOS segregates its business executions into two distinct models:

### Deterministic Workflow Engine (Temporal.io)
For operations requiring absolute predictability, transaction tracking, and complex retry loops (such as the **Grievance Lifecycle** and **Escalation Protocols**), SCOS uses **Temporal.io**.
*   **The Workflow Pattern:** A grievance workflow is defined as an immutable, stateful code execution. If a department fails to resolve an assigned leak ticket within its SLA (e.g., 24 hours), the Temporal workflow automatically triggers an escalation event, routing the ticket to the City Commissioner.
*   **Fault Tolerance:** Workflows are persisted to disk. If a backend service crashes mid-execution, Temporal re-hydrates the workflow's state on an adjacent node, resuming from the exact step of failure without data loss.

### Non-Deterministic Cognitive Orchestrator (LangGraph)
For multi-agent negotiations, spatial conflict resolutions, and semantic routing, SCOS uses **LangGraph**.
*   **The Design:** LangGraph models agent operations as stateful Directed Acyclic Graphs (DAGs). Each node represents an agent action, and transitions are governed by conditional routers that evaluate the outcomes of model queries against physical city constraints.

---

## 3. Ingress, Security, & IAM (API Gateway & Auth)

---

### SCOS Kong API Gateway
All external requests enter the system through a secure **Kong API Gateway** cluster, which acts as the single entry point for SCOS:
*   **Reverse Proxying:** Maps public REST paths (e.g., `/api/v1/citizen/*`) to internal, private container endpoints within the service mesh.
*   **Security Policies:** Enforces SSL/TLS termination, Cross-Origin Resource Sharing (CORS) rules, and protects internal services from direct public access.

---

### Keycloak Identity & Access Management (IAM)
Authentication is standardized across all portals using **Keycloak**:
*   **Token Generation:** Authenticates users and generates cryptographically signed **JSON Web Tokens (JWT)**.
*   **Role-Based Access Control (RBAC):** Claims are embedded directly inside the JWT payload, defining user access scopes:
    $$\text{Scopes} = \{\text{CITIZEN}, \text{SUPERVISOR}, \text{DISTRICT\_MAGISTRATE}, \text{FIELD\_CREW}\}$$
*   **Service-to-Service Security:** Inside the Kubernetes cluster, the **Istio Service Mesh** enforces mutual TLS (mTLS). Services must verify cryptographic identities before executing inter-service requests.

---

## 4. Ingestion, Event Processing, & Task Queues

High-frequency sensor packets and administrative state changes are processed using a decoupled, asynchronous queue architecture:

```
[ High-Frequency Sensors ] ──► [ MQTT Broker ] ──► [ Kafka Ingestion Pipeline ]
                                                         │
                                                         ▼ (Publish)
                                               [ Apache Kafka Topics ]
                                                         │
                                                         ▼ (Subscribe)
                                               [ Microservice Consumers ]
```

---

### Apache Kafka Event Bus
Kafka serves as SCOS's durable, append-only event stream, using partitioned, localized topics to handle high throughput:
*   `scos.telemetry.water`: Ingests continuous SCADA flow rate, pressure, and leakage telemetry.
*   `scos.grievance.events`: Broadcasts status transitions of active citizen complaints (e.g., `GRIEVANCE_CREATED`, `CREW_DISPATCHED`).
*   `scos.emergency.alerts`: High-priority channel broadcasting critical incident warnings.

---

### Asynchronous Distributed Task Queues
For long-running, CPU-intensive tasks that would otherwise block the API gateway (such as PDF compilation, spatial polygon processing, and image optimization), SCOS deploys distributed queues:
*   **BullMQ (TypeScript/Redis):** Manages asynchronous jobs within our Node.js services (e.g., scheduling SMS alert broadcasts).
*   **Celery (Python/Redis):** Coordinates long-running Python processes (e.g., training prediction models or performing geospatial polygon calculations).

---

## 5. Scheduler, Distributed Jobs, & Cron Engine

SCOS deploys a distributed cron engine to coordinate system-wide maintenance and periodic reporting routines:

*   **Architecture:** We use **ShedLock** paired with standard Cron expressions to guarantee that periodic jobs (such as generating daily SLA reports or cleaning old caches) are executed exactly once across the distributed cluster.
*   **Sample Jobs:**
    *   *Daily Operational Synthesis:* Runs at `00:01 IST` to aggregate department response times and compile daily PDF briefs.
    *   *Sensor Heartbeat Check:* Runs every `30 seconds` to detect offline streetlights or water meters, automatically generating maintenance tickets for disconnected nodes.

---

## 6. File Storage, Document Generation, & Caching

---

### MinIO / Google Cloud Storage
All unstructured media (such as crew-uploaded repair photographs, PDF reports, and spatial raster map tiles) are written to an S3-compatible object store:
*   *Local Sandbox:* Deployed using a highly-available **MinIO** cluster.
*   *Production Cloud:* Synced with **Google Cloud Storage (GCS)**, leveraging automatic lifecycle rules to transition old files to cheap archive classes.

---

### Dynamic Document Generation
Daily operational briefs and citizen receipt PDFs are compiled on demand:
*   An asynchronous task is dispatched to the background queue.
*   A headless **Puppeteer (Chromium)** worker renders a standard Tailwind-styled React page in the background, converting the rendered viewport into a pixel-perfect PDF file in milliseconds and uploading the artifact to GCS.

---

### Distributed Cache Layer
SCOS deploys a **Redis Cluster** to reduce database read pressure and accelerate response times:
*   **API Response Caching:** Common REST responses (such as public ward coordinates and municipal service directories) are cached with an expiration window ($TTL = 3600\text{ seconds}$).
*   **Transient Coordinates:** Real-time field vehicle GPS coordinates are written to Redis Geospatial indices, bypassings transactional database writes entirely.

---

## 7. Logging, Observability, & Configuration

---

### HashiCorp Vault Configuration Engine
Environmental configurations and secrets (such as database credentials, Firebase API keys, and Keycloak certificates) are managed through **HashiCorp Vault**. Secrets are dynamically injected into microservice containers at runtime, ensuring no credentials are ever written to the Git repository.

---

### OpenTelemetry, Grafana Loki, & Prometheus
Observability is integrated natively into the system mesh:
*   **Traces (OpenTelemetry + Jaeger):** Every incoming request is assigned a unique `trace_id` header at the Kong API Gateway. This trace is propagated across all internal gRPC and database hops, allowing developers to visually diagnose latency bottlenecks.
*   **Logs (Grafana Loki):** Container logs are streamed as structured JSON payloads, allowing developers to query and filter events across different pods instantly.
*   **Metrics (Prometheus + Grafana):** System health metrics (CPU usage, database connection pools, memory curves) are scraped dynamically, powering dashboard warning displays.

---

## 8. Global Error Handling & Secure Audit System

---

### RFC 7807 Error Standard
All SCOS backends implement a unified error format. When an error occurs, the API returns a structured JSON payload detailing the problem:

```json
{
  "type": "https://errors.scos.gov.in/database-lock",
  "title": "Database Transaction Timeout",
  "status": 503,
  "detail": "The SCOS-SCHEDULER database is currently under heavy write pressure. Transaction aborted.",
  "instance": "/api/v1/scheduler/dispatch",
  "errorCode": "SCOS_ERR_DB_TIMEOUT",
  "timestamp": "2026-07-15T06:57:00Z"
}
```

---

### Zero-Trust Shared Audit Chain (ZTSAC)
Every administrative action (such as manual overrides, budget updates, or alert triggers) is written to a **Zero-Trust Shared Audit Ledger**:
*   **The Mechanism:** Each audit block contains a timestamp, user ID, action payload, and the cryptographic hash of the *preceding* audit block.
*   **Immutability:** This cryptographic chaining ensures that any attempt to alter or delete historic system logs is instantly detected, protecting the system against internal administrative tampering or external breaches.

---

## 9. Comprehensive Request Lifecycle Journey

To illustrate how these components coordinate, we trace the exact step-by-step lifecycles of two common system events:

---

### Flow A: A Citizen Submits a Water Leak Grievance

```
[ Citizen App ] ──(REST)──► [ Kong Gateway ] ──(mTLS)──► [ SCOS-CITIZEN ]
                                                                │
  ┌─────────────────────────────────────────────────────────────┘
  ▼
[ Kafka Event Bus ] ──(Publish)──► [ Topic: scos.grievance.events ]
                                                │
  ┌─────────────────────────────────────────────┘
  ▼
[ SCOS-COGNITIVE ] ──► [ Gemini AI RAG Audit ] ──► [ LangGraph Routing ]
                                                                │
  ┌─────────────────────────────────────────────────────────────┘
  ▼
[ Temporal Workflow ] ──► [ SCOS-SCHEDULER Dispatch ] ──► [ Crew Notified ]
```

1.  **Ingress:** A citizen uploads a photograph of a water leak along with a Hinglish description through the mobile application. The request is received by the **Kong API Gateway**.
2.  **Authentication:** Kong validates the client's JWT against Keycloak, verifies the `CITIZEN` role scope, and routes the payload to the `SCOS-CITIZEN` microservice over mTLS.
3.  **Sanitization & Creation:** `SCOS-CITIZEN` sanitizes the inputs, writes the photograph to Google Cloud Storage, creates a ticket record in PostgreSQL, and publishes a `GRIEVANCE_CREATED` event to the `scos.grievance.events` Kafka topic.
4.  **Cognitive Triage:** The `SCOS-COGNITIVE` service consumes the event. It calls Gemini 2.5 Flash to translate the Hinglish text, queries the **Urban Knowledge Graph** (Neo4j) to map the leak's coordinates to the nearest water pipeline, and writes the semantic relationship.
5.  **Workflow Initialization:** The cognitive service initializes a **Temporal Workflow** to track the ticket's SLA. 
6.  **Dispatch Execution:** The workflow calls `SCOS-SCHEDULER` to find the nearest available repair team, reserves the required replacement valves in the inventory database, and sends a push notification (FCM) to the selected crew's mobile device, completing the dispatch loop.

---

### Flow B: A SCADA Pressure Sensor Detects a Physical Pipe Rupture

```
[ SCADA Sensor ] ──(MQTT)──► [ VerneMQ Broker ] ──► [ SCOS-INGESTION ]
                                                            │
  ┌─────────────────────────────────────────────────────────┘
  ▼
[ Kafka Event Bus ] ──(Publish)──► [ Topic: scos.telemetry.water ]
                                                │
  ┌─────────────────────────────────────────────┘
  ▼
[ SCOS-TWIN ] ──► [ PostGIS Radius Query ] ──► [ SCOS-EMERGENCY Block ]
                                                        │
  ┌─────────────────────────────────────────────────────┘
  ▼
[ Actuator Action ] ──► [ Water Line Shut Off ] ──► [ Alarm Sounded ]
```

1.  **Ingress:** A SCADA water meter pressure reading drops rapidly below normal thresholds. The physical device publishes an MQTT packet to the local **VerneMQ Broker** using mTLS verification.
2.  **Telemetry Processing:** `SCOS-INGESTION` consumes the packet, processes the raw value through a Kalman filter to smooth noise, and publishes the validated reading to the `scos.telemetry.water` Kafka topic.
3.  **Spatial Correlation:** The `SCOS-TWIN` service consumes the telemetry. Observing the rapid pressure drop, it runs a 3D PostGIS geofence query to identify intersecting electrical conduits or building structures within a 50-meter radius.
4.  **Emergency Override:** Finding a critical risk of electrical short-circuiting, `SCOS-TWIN` issues a high-priority command to the `SCOS-EMERGENCY` coordinator.
5.  **Actuator Execution:** The emergency service overrides the local water valve control grid (shutting off the water supply) and routes traffic around the affected coordinates, while logging the automatic override to the ZTSAC audit database.

---
*This backend architecture and distributed microservices specification establishes the technical standards, service boundaries, and event-driven data workflows required to deploy, scale, and maintain the Smart City Operating System safely and reliably.*
