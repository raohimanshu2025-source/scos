# MICROSERVICE ARCHITECTURE SPECIFICATION
## System: Smart City Operating System (SCOS) for Indian District Administration
### Academic Subtitle: A Containerized, Event-Driven Microservice Architecture for High-Throughput Cyber-Physical Urban Computing
**Institution:** Indian Institute of Technology Kanpur (IIT Kanpur)  
**Author:** M.Tech Thesis Research Sandbox  

---

## Executive Summary

To achieve horizontal scalability, high fault tolerance, and loose coupling across diverse municipal departments, the **Smart City Operating System (SCOS)** transitions from a monolithic application structure to a modern, containerized **Microservice Architecture**. 

Each microservice in the SCOS ecosystem is designed around the principle of **Single Responsibility**, owning its datastore, exposing type-safe APIs, and communicating asynchronously via a distributed event broker. This architectural design ensures that a service outage or heavy traffic load in one sector (e.g., environmental telemetry ingestion during a storm) does not degrade the responsiveness of critical citizen grievance workflows or emergency dispatch systems.

This document outlines the logical microservice groups, specifies the operational parameters of each service, details system infrastructure patterns, and provides a production-ready Kubernetes deployment topology.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SCOS DISTRIBUTED API GATEWAY                    │
├───────────────────────────────────┬────────────────────────────────────┤
│         Ingress / Rate Limiting   │   JWT Auth & Token Validation      │
└───────────────────────────────────┼────────────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        ISTIO SERVICE MESH (mTLS)                       │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   ┌───────────────────────────┐                ┌───────────────────┐   │
│   │ CITIZEN ENGAGEMENT SER.   │ ◄────────────► │ COGNITIVE ROUTING │   │
│   │ (DB: PostgreSQL)          │                │ (Stateless Engine)│   │
│   └─────────────▲─────────────┘                └─────────▲─────────┘   │
│                 │                                        │             │
│   ┌─────────────▼─────────────┐                ┌─────────▼─────────┐   │
│   │ DEVICE INGESTION GATEWAY  │ ◄────────────► │ RESOURCE SCHEDULER│   │
│   │ (DB: Redis Cache)         │                │ (DB: TimescaleDB) │   │
│   └───────────────────────────┘                └───────────────────┘   │
│                                                                        │
├────────────────────────────────────────────────────────────────────────┤
│                 APACHE KAFKA HIGH-THROUGHPUT EVENT BUS                 │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Domain Grouping of SCOS Microservices

The microservices are organized into five distinct operational domains:

1.  **Citizen & Interface Domain:** Manages human interactions, public portals, CPGRAMS feedback loops, and alert notifications.
2.  **Cognitive & Intelligence Domain:** Executes model inference, natural language translation, compliance auditing, and conflict resolution.
3.  **State & Core Orchestration Domain:** Executes state machines, schedules public resources, and manages dynamic spatial indexes.
4.  **Hardware & IoT Ingestion Domain:** Decouples physical sensor networks, parses telemetry, and controls street actuators.
5.  **Federated Departmental Connectors:** Integrates legacy systems and rosters for individual agencies (Water, Power, Health, Police).

---

## 2. Microservice Catalog (Tactical Specifications)

---

### 1. Citizen Engagement Service (SCOS-CITIZEN)

*   **Purpose:** Expose public-facing endpoints for registering grievances, tracking case statuses, and recording public satisfaction ratings.
*   **Responsibilities:**
    *   Ingest multi-modal citizen complaints containing Hinglish/Hindi text and photographic attachments.
    *   Manage citizen profile databases and authenticate accounts using state-level identity services (Aadhaar).
    *   Send real-time progress alerts and SMS notifications to registered citizens.
*   **API Interface:**
    *   `POST /api/v1/citizen/complaints`: Accepts new grievance submissions.
    *   `GET /api/v1/citizen/complaints/{id}`: Returns chronological status logs.
    *   `POST /api/v1/citizen/profiles/verify`: Initiates identity checks.
*   **Database Ownership:** PostgreSQL instance storing citizen credentials, profiles, registered grievances, and satisfaction histories.
*   **Events Published:** `GrievanceSubmittedEvent`, `FeedbackRegisteredEvent`.
*   **Events Consumed:** `GrievanceStatusChangedEvent`, `AdvisoryBroadcastTriggered`.
*   **Scaling Strategy:** Scaled horizontally using Kubernetes Horizontal Pod Autoscaling (HPA) targeting $80\%$ CPU utilization. Max replicas set to 12.
*   **Failure Handling:** Drops to offline-mode caching. If the core DB is unavailable, incoming submissions are buffered in local memory caches and written once connectivity is restored.
*   **Monitoring Requirements:** Tracks API request latencies, HTTP 5xx error percentages, database connection pool saturation, and Aadhaar OAuth gateway response times.

---

### 2. Cognitive Routing Service (SCOS-COGNITIVE)

*   **Purpose:** Act as the translation, categorization, and logical reasoning engine, mapping unstructured events to corresponding municipal departments.
*   **Responsibilities:**
    *   Parse multi-lingual Hinglish text using the **Gemini API** to extract categories and coordinates.
    *   Verify administrative compliance against municipal codes using Retrieval-Augmented Generation (RAG).
    *   Identify duplicate complaints by analyzing spatial and textual semantic similarities.
*   **API Interface:**
    *   `POST /api/v1/cognitive/triage`: Accepts raw text and extracts category, severity, and routing metadata.
    *   `POST /api/v1/cognitive/deduplicate`: Compares new complaints against active tickets.
*   **Database Ownership:** Stateless service utilizing a vector search database (e.g., Milvus or pgvector) to store legislative documents and active complaint text embeddings.
*   **Events Published:** `TriageCompletedEvent`, `DuplicateDetectedEvent`.
*   **Events Consumed:** `GrievanceSubmittedEvent`.
*   **Scaling Strategy:** Highly elastic scaling. Demands CPU-optimized node pools to handle vector calculations. Scaled dynamically based on incoming queue depth.
*   **Failure Handling:** Standardizes to a fallback heuristic router if the LLM API endpoints timeout. The transaction is flagged for subsequent manual verification.
*   **Monitoring Requirements:** Monitors model API response latencies, token consumption rates, model hallucination/confidence curves, and vector index query speeds.

---

### 3. Resource & Task Scheduler Service (SCOS-SCHEDULER)

*   **Purpose:** Algorithmically optimize and assign municipal maintenance teams, emergency crews, and public fleet assets.
*   **Responsibilities:**
    *   Match open work orders with the closest available personnel and equipment.
    *   Incorporate travel-time factors and traffic delays into dispatch schedules.
    *   Enforce agency SLA limits, escalating alerts when warning thresholds are crossed.
*   **API Interface:**
    *   `POST /api/v1/scheduler/dispatches`: Generates optimal itineraries for a set of tasks.
    *   `GET /api/v1/scheduler/personnel/status`: Retrieves availability statuses for field teams.
*   **Database Ownership:** PostgreSQL database storing engineer profiles, shifts, vehicle capacities, warehouse inventories, and historic dispatch durations.
*   **Events Published:** `WorkOrderDispatchedEvent`, `SLAElapsedAlertEvent`.
*   **Events Consumed:** `TriageCompletedEvent`, `PersonnelStatusModifiedEvent`, `VehicleGPSMovedEvent`.
*   **Scaling Strategy:** Compute-intensive scheduling loops are isolated to background threads. Replicated up to 4 pods under heavy dispatch spikes.
*   **Failure Handling:** Utilizes a simple first-in, first-out (FIFO) local scheduler if the optimization solver times out or fails to resolve constraints.
*   **Monitoring Requirements:** Tracks constraint-solver execution durations, task completion times, SLA deviation percentages, and route calculation overheads.

---

### 4. Device & Sensor Abstraction Gateway (SCOS-DSAL)

*   **Purpose:** Standardize telemetry streams and manage down-link actuation commands across diverse urban hardware nodes.
*   **Responsibilities:**
    *   Expose endpoints for IoT telemetry protocols (MQTT, HTTP, LoRaWAN, CoAP).
    *   Translate proprietary byte arrays into standardized, schema-validated JSON event packets.
    *   Monitor hardware heartbeat signals to track device health across the district.
*   **API Interface:**
    *   `POST /api/v1/dsal/actuators/{id}/command`: Sends down-link actuation signals.
    *   `GET /api/v1/dsal/devices/status`: Audits active physical hardware health.
*   **Database Ownership:** High-throughput Redis Cluster caching active device configurations, hardware registry listings, and last-known sensor metrics.
*   **Events Published:** `TelemetryReceivedEvent`, `DeviceOfflineAlarmEvent`.
*   **Events Consumed:** `ActuationRequestedEvent`.
*   **Scaling Strategy:** Highly scaled, network-optimized pod configurations. Uses partition-based clustering to handle high-frequency sensor streams (e.g., water meters, streetlights).
*   **Failure Handling:** Implements an edge-buffering instruction. Offloaded edge gateways are directed to store readings locally during gateway connection drops.
*   **Monitoring Requirements:** Tracks packets-per-second, network bandwidth consumption, protocol translation latencies, and device heartbeat timeouts.

---

### 5. Zero-Trust Security & Identity Service (SCOS-ZTSAC)

*   **Purpose:** Enforce role-based access control (RBAC), authenticate external connections, and maintain an immutable chronological audit trail.
*   **Responsibilities:**
    *   Issue, validate, and revoke JWT authentication tokens for human operators and IoT nodes.
    *   Enforce spatial-temporal access restrictions on administrative actions.
    *   Write a tamper-evident, cryptographic log of all system state changes.
*   **API Interface:**
    *   `POST /api/v1/auth/token`: Authenticates credentials and issues secure tokens.
    *   `POST /api/v1/auth/verify`: Validates token signatures and evaluates RBAC permissions.
    *   `GET /api/v1/audit/logs`: Retrieves cryptographically verified administrative history records.
*   **Database Ownership:** CockroachDB (distributed, globally consistent SQL database) storing user permissions, security roles, cryptographic keys, and append-only audit entries.
*   **Events Published:** `SecurityViolationFlaggedEvent`, `UserLoggedInEvent`.
*   **Events Consumed:** Every transactional event published to the Kafka bus (to compute and verify audit hashes).
*   **Scaling Strategy:** Replicated globally across distinct node groups to guarantee sub-millisecond authentication validations.
*   **Failure Handling:** Zero-tolerance fail-closed policy. If the security validator is unreachable, all downstream API calls are blocked to prevent unauthorized data access.
*   **Monitoring Requirements:** Monitors authentication latency, count of failed authorization attempts, audit-trail hash verification logs, and key rotation successes.

---

### 6. Spatial Digital Twin & GIS Service (SCOS-TWIN)

*   **Purpose:** Maintain a real-time digital representation of the district's GIS layers, boundaries, and active assets.
*   **Responsibilities:**
    *   Process high-velocity GPS coordinates from municipal vehicles.
    *   Index stationary assets and geographic shapes using the **Uber H3 Hexagonal Grid** system.
    *   Resolve geographic query requests (e.g., calculating spatial overlaps between water leaks and hospitals).
*   **API Interface:**
    *   `POST /api/v1/twin/layers`: Registers static spatial vector shapes (pipelines, roads, grids).
    *   `GET /api/v1/twin/query/nearest`: Finds active vehicles within a hexagonal bounding box.
*   **Database Ownership:** PostgreSQL with **PostGIS** extension, paired with a high-performance in-memory geospatial index cache.
*   **Events Published:** `AssetEnteredZoneEvent`, `GeofenceViolatedEvent`.
*   **Events Consumed:** `VehicleGPSMovedEvent`, `GrievanceSubmittedEvent`.
*   **Scaling Strategy:** Heavy memory consumption. Deployed on high-RAM node classes. Replicated using read-replicas to handle concurrent dashboard requests.
*   **Failure Handling:** Returns the last cached snapshot of spatial layouts. R-Tree calculations are restarted asynchronously during service crashes.
*   **Monitoring Requirements:** Monitors PostGIS spatial query execution times, vehicle update processing rates, memory consumption, and active spatial cache hits.

---

### 7. Department Connectors (SCOS-WATER, SCOS-POWER, SCOS-HEALTH)

*   **Purpose:** Translate core SCOS instructions into proprietary tickets or API calls matching legacy systems of specific agencies.
*   **Responsibilities:**
    *   Sync personnel rosters, shift charts, and tools inventory tables from department systems to the SCOS database.
    *   Create, track, and close work orders in legacy ticketing databases (ERP/CMMS).
*   **API Interface:**
    *   `POST /api/v1/connectors/{agency}/tickets`: Creates an agency-specific work ticket.
    *   `GET /api/v1/connectors/{agency}/rosters`: Fetches on-duty engineer listings.
*   **Database Ownership:** Local transactional staging schemas; read-only connectors to external legacy databases (Oracle DB, MSSQL).
*   **Events Published:** `PersonnelStatusModifiedEvent`, `TicketCompletedEvent`.
*   **Events Consumed:** `WorkOrderDispatchedEvent`.
*   **Scaling Strategy:** Low throughput requirements. Scaled minimal replicas (typically 2 pods per connector) to maintain a small memory footprint.
*   **Failure Handling:** Uses a persistent outbox queue pattern. If a legacy department API is down, SCOS retries sending the work order using exponential backoff logic.
*   **Monitoring Requirements:** Monitors legacy database connection states, sync processing durations, external API error rates, and outbox queue size.

---

## 3. Systems Infrastructure & Platform Engineering

SCOS leverages a modern, cloud-native platform stack to coordinate, secure, and monitor its microservice topology:

### Service Discovery & Mesh (Istio)
*   **Mechanism:** Direct service-to-service communication is managed using **Istio Service Mesh** with Envoy sidecar proxies deployed alongside each pod.
*   **Responsibility:** Handles service lookup, routes traffic dynamically, and enforces mutual TLS (mTLS) cryptography for all network hops within the Kubernetes cluster.

### API Gateway (Kong / Envoy)
*   **Mechanism:** Extends a distributed **Kong API Gateway** at the ingress boundary.
*   **Responsibility:** Standardizes SSL termination, strips incoming headers, verifies client JWT tokens, and executes strict IP-rate limiting to defend against DDoS attacks.

### Distributed Configuration Management (HashiCorp Vault & Consul)
*   **Mechanism:** Application secrets (such as the Gemini API key, database credentials, and legacy systems access profiles) are stored in **HashiCorp Vault**.
*   **Responsibility:** Dynamic configuration flags are managed inside **Consul**, enabling real-time adjustments without requiring pod restarts.

### Observability & Distributed Tracing (OpenTelemetry)
*   **Mechanism:** Standardizes logging, metrics, and trace telemetry across all microservices using **OpenTelemetry SDKs**.
*   **Responsibility:**
    *   *Distributed Tracing:* Passes `traceparent` headers through every Kafka event and API call, mapping complete execution paths (from a citizen complaint click to a dispatcher's route optimization) on a **Jaeger** waterfall UI.
    *   *Metrics Ingestion:* Prometheus scrapes system metrics, displaying real-time system performance on a centralized Grafana dashboard.

### Resilience Patterns (Circuit Breaking)
*   **Mechanism:** Implements resilience strategies inside Envoy proxies:
    *   *Circuit Breakers:* Trips connection lines if a service (e.g., the KESCO connector) fails more than 5 times in a 10-second window, returning a graceful fallback response to avoid cascading crashes.
    *   *Bulkheads:* Sets strict thread-pool limits for background processing tasks, ensuring that a surge in analytics workloads does not exhaust resources needed for core system operations.

---

## 4. Kubernetes Production Deployment Topology

The following YAML blueprint specifies the logical layout of the SCOS microservices deployed across a high-availability, multi-zone Kubernetes cluster:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: scos-cognitive-deployment
  namespace: scos-core
  labels:
    app: scos-cognitive
spec:
  replicas: 4
  selector:
    matchLabels:
      app: scos-cognitive
  template:
    metadata:
      labels:
        app: scos-cognitive
    spec:
      containers:
      - name: cognitive-service
        image: gcr.io/kanpur-smart-city/scos-cognitive:v2.1.0
        ports:
        - containerPort: 50051 # gRPC port
        resources:
          limits:
            cpu: "2000m"
            memory: "2Gi"
          requests:
            cpu: "500m"
            memory: "512Mi"
        envFrom:
        - configMapRef:
            name: scos-common-config
        env:
        - name: GEMINI_API_KEY
          valueFrom:
            secretKeyRef:
              name: scos-secrets
              key: gemini-api-key
        livenessProbe:
          grpc:
            port: 50051
          initialDelaySeconds: 10
        readinessProbe:
          grpc:
            port: 50051
          initialDelaySeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: scos-cognitive-service
  namespace: scos-core
spec:
  type: ClusterIP
  ports:
  - port: 50051
    targetPort: 50051
    protocol: TCP
    name: grpc
  selector:
    app: scos-cognitive
```

---
*This microservice architecture specification establishes a scalable, resilient, and enterprise-grade blueprint for hosting and coordinating the Smart City Operating System.*
