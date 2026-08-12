# CHAPTER 3: IEEE-STYLE SOFTWARE REQUIREMENT SPECIFICATION (IEEE Std 830-1998)
## System: Smart City Operating System (AI-SCOS) for Indian District Administration
### M.Tech Thesis Chapter 3 | Department of Computer Science & Engineering, IIT Kanpur
**Candidate:** M.Tech Research Scholar  
**Thesis Supervisor:** Department Faculty Advisory Committee  
**Institution:** Indian Institute of Technology Kanpur (IIT Kanpur)  

---

## 3.1 Introduction

### 3.1.1 Purpose
This document specifies the formal software requirements for the **Smart City Operating System (AI-SCOS)**, serving as Chapter 3 of the M.Tech thesis presented to the Department of Computer Science and Engineering at the Indian Institute of Technology Kanpur (IIT Kanpur). This Software Requirement Specification (SRS) follows the **IEEE Std 830-1998** standard for recommended practice for software requirements specifications. It establishes the complete, unambiguous, verifiable, and architectural baseline for the system's development, deployment, and academic validation in Indian municipal district administrations (with primary validation tailored for Kanpur District).

### 3.1.2 Scope
AI-SCOS is an integrated, event-driven, microservices-based cognitive software platform designed to manage municipal infrastructure, citizen grievances, multi-agent artificial intelligence decision support, real-time 3D spatial digital twin visualizers, urban knowledge graphs, and automated governance compliance ledgers. 

The software encompasses:
1. **Public-Facing Ingress:** Mobile-first, multi-lingual citizen portals supporting Hinglish/Hindi text and voice intake, photo uploading, geotagging, and real-time status tracking.
2. **Administrative Command & Control:** Role-based operations portals for supervisors, emergency response teams, field crews, and the District Magistrate.
3. **Cognitive Multi-Agent Orchestration:** Natural language translation, automated triage, dependency reasoning, and conflict resolution using LLM-backed stateful Directed Acyclic Graphs (DAGs).
4. **Spatial & Topological Infrastructure:** GPU-accelerated 2D/3D Geographic Information System (GIS) visualization, PostGIS spatial queries, and Neo4j Labeled Property Graph (LPG) urban network representations.
5. **Event-Driven Microservices & Workflow Engines:** High-throughput Kafka pipelines, Temporal.io deterministic SLA escalation workflows, and cryptographically chained append-only audit ledgers.

### 3.1.3 Definitions, Acronyms, and Abbreviations
*   **AI-SCOS:** Artificial Intelligence Smart City Operating System.
*   **API:** Application Programming Interface.
*   **CPGRAMS:** Centralised Public Grievance Redress and Monitoring System (Government of India).
*   **DAG:** Directed Acyclic Graph.
*   **FCM:** Firebase Cloud Messaging.
*   **GIS:** Geographic Information System.
*   **gRPC:** gRPC Remote Procedure Call.
*   **H3:** Spatial index hexagonal hierarchical spatial index system created by Uber.
*   **HITL:** Human-In-The-Loop.
*   **IAM:** Identity and Access Management.
*   **IEEE:** Institute of Electrical and Electronics Engineers.
*   **JWT:** JSON Web Token.
*   **LPG:** Labeled Property Graph.
*   **mTLS:** Mutual Transport Layer Security.
*   **OIDC:** OpenID Connect.
*   **PITR:** Point-In-Time Recovery.
*   **RBAC:** Role-Based Access Control.
*   **REST:** Representational State Transfer.
*   **SCADA:** Supervisory Control and Data Acquisition.
*   **SLA:** Service Level Agreement.
*   **URI:** Uniform Resource Identifier.
*   **WAL:** Write-Ahead Logging.
*   **ZTSAC:** Zero-Trust Shared Audit Chain.

### 3.1.4 References
1. IEEE Recommended Practice for Software Requirements Specifications, IEEE Std 830-1998, 1998.
2. Field Guide to Building Resilient Distributed Systems, IIT Kanpur CSE Academic Press, 2024.
3. Open Geospatial Consortium (OGC) Standards for Vector Tile Implementations, OGC-15-001r6, 2022.
4. RFC 7807: Problem Details for HTTP APIs, Internet Engineering Task Force (IETF), 2016.
5. National e-Governance Division (NeGD) Guidelines for Smart City Data Exchange (BSCX), Ministry of Housing and Urban Affairs (MoHUA), Government of India, 2023.

---

## 3.2 Overall Description

### 3.2.1 Product Perspective
AI-SCOS functions as an enterprise smart city operating system that interfaces with physical infrastructure (SCADA water valves, IoT environmental sensors), municipal administrative structures (KESCO, Jal Sansthan, Nagar Nigam), national public portals (CPGRAMS), and end-user citizens.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        AI-SCOS ENVIRONMENT MESH                        │
├────────────────────────────────────────────────────────────────────────┤
│  [ SCADA / IoT ]  ──► (MQTT/mTLS) ──┐                                  │
│  [ Citizen App ]  ──► (REST/HTTPS) ─┼─► [ KONG GATEWAY ] ──► [ MICROSERVICES ]
│  [ Admin Web ]    ──► (WSS/OIDC)   ──┘                                  │
└────────────────────────────────────────────────────────────────────────┘
```

The system is deployed within a containerized Kubernetes cluster environment, operating behind a Kong API Gateway with Istio service mesh enforcing mTLS inter-service security.

### 3.2.2 Product Functions
The high-level functions of AI-SCOS include:
*   **Multi-Lingual Ingress:** Processing Hinglish, Hindi, and English complaints via natural language translation and semantic normalization.
*   **Stateful Grievance Workflows:** Execution of deterministic SLA timers, automated ticket deduplication, and escalation loops.
*   **Spatial Digital Twin:** Rendering district asset layers, field vehicle GPS tracks, and environmental heatmaps in real-time.
*   **Topological Reasoning:** Tracing physical dependencies across municipal utilities using a Neo4j knowledge graph.
*   **Multi-Agent Negotiation:** Resolving inter-departmental resource conflicts through structured AI negotiation logs.
*   **Cryptographic Compliance:** Recording all administrative modifications to an immutable append-only ledger.

### 3.2.3 User Classes and Characteristics
1.  **Citizen / Public User:** Non-technical end users. Requires simple, high-contrast interfaces with minimal form complexity, voice/text intake, and clear visual indicators.
2.  **Field Crew Operator:** On-site technical staff using mobile devices in sunlight conditions. Requires touch-friendly buttons ($>44\text{px}$), offline capability, and quick photo proof upload.
3.  **Department Supervisor:** Municipal mid-level administrators (e.g., Jal Sansthan division lead). Requires dense queue management tables, crew dispatch tools, and SLA tracking indicators.
4.  **District Magistrate / Emergency Commander:** Senior administrative authority. Requires macro-level GIS dashboards, AI decision summaries, and administrative override controls.
5.  **System Administrator / Auditor:** Technical system maintainers. Requires RBAC configuration controls, cluster monitoring, and cryptographic audit verifiers.

### 3.2.4 Operating Environment
*   **Server Substrate:** Linux Cloud Run / Kubernetes Cluster (Port 3000 ingress proxy bound).
*   **Database Systems:** PostgreSQL 16 + PostGIS, TimescaleDB, Neo4j 5, OpenSearch 2.11, Redis Cluster 7.2, MinIO / GCS.
*   **Client Browsers:** Modern Web Browsers supporting WebGL, ES2022, and WebSockets (Chrome 110+, Firefox 115+, Safari 16+).
*   **Mobile Clients:** Android 10+ / iOS 15+ progressive web environments with camera and HTML5 geolocation permissions.

### 3.2.5 Design and Implementation Constraints
1.  **Ingress Port Binding:** Infrastructure constraints mandate that all external HTTP, WebSocket, and API traffic route through **Port 3000** exclusively.
2.  **Key Isolation:** Secret API keys (Gemini API, database credentials) must remain strictly server-side and never be exposed to the browser client.
3.  **Frame & iFrame Rendering:** The UI must render cleanly within an iFrame sandbox preview while supporting popup-based OIDC login flows.
4.  **Offline Resiliency:** Field worker operations must support local storage buffering when cellular data connection drops.

### 3.2.6 Assumptions and Dependencies
*   **Assumptions:** District administrative boundary geometries (Kanpur Ward Shapefiles) are pre-loaded into PostGIS. SCADA sensor hardware exposes standard MQTT/HTTP endpoints.
*   **Dependencies:** Keycloak IAM for authentication, Google Gemini 2.5 API for AI translation and reasoning, Maplibre GL for map tile rendering, Temporal.io for workflow orchestration.

---

## 3.3 External Interface Requirements

### 3.3.1 User Interfaces
*   **Design Token Alignment:** All user interface components adhere to the **Civic Slate Design System (CSDS)** as specified in `/docs/DESIGN_SYSTEM.md`.
*   **Typography & Styling:** Inter (Sans), Space Grotesk (Display), and JetBrains Mono (Data/Coordinates) paired with Tailwind CSS utility classes.
*   **Responsiveness:** Fluid grid scaling from $320\text{px}$ mobile screens to $3840\text{px}$ multi-monitor command dashboards.

### 3.3.2 Hardware Interfaces
*   **SCADA Valve Actuators:** Interface via VerneMQ MQTT brokers using JSON-encoded telemetry packets.
*   **Mobile GPS Receivers:** Interface via standard HTML5 Geolocation API (`navigator.geolocation`) on client devices.

### 3.3.3 Software Interfaces
*   **Keycloak IAM:** OpenID Connect (OIDC) endpoints for user authentication and JWT validation.
*   **Gemini 2.5 Flash / Pro API:** Google GenAI TypeScript SDK for natural language translation, semantic parsing, and multi-agent reasoning.
*   **MinIO / GCS Object Store:** AWS S3-compatible REST API for photo proof uploads and generated PDF report storage.

### 3.3.4 Communications Interfaces
*   **REST/JSON APIs:** HTTPS endpoints conforming to `/docs/API_HANDBOOK.md` standards and RFC 7807 error formats.
*   **WebSockets (`wss://`):** Persistent real-time feeds on Port 3000 for telemetry streams and emergency alerts.
*   **Kafka Messaging:** Internal gRPC/Kafka protocol for high-throughput event streaming between microservices.

---

## 3.4 System Features & Functional Requirements

```
                                  AI-SCOS FUNCTIONAL MODULES
  ┌─────────────────┬─────────────────┬──────────────────┬─────────────────┬──────────────────┐
  │ 3.4.1 Auth      │ 3.4.2 Citizen   │ 3.4.3 Department │ 3.4.4 Grievance │ 3.4.5 Workflow   │
  ├─────────────────┼─────────────────┼──────────────────┼─────────────────┼──────────────────┤
  │ 3.4.6 AI Center │ 3.4.7 Knowledge │ 3.4.8 GIS Twin   │ 3.4.9 Analytics │ 3.4.10 Audit Log │
  └─────────────────┴─────────────────┴──────────────────┴─────────────────┴──────────────────┘
```

### 3.4.1 Authentication & Security (`SR-AUTH`)
*   `SR-AUTH-01`: The system **shall** validate user credentials against Keycloak OIDC and issue cryptographically signed JWT tokens containing role scopes and assigned ward IDs.
*   `SR-AUTH-02`: The system **shall** enforce Role-Based Access Control (RBAC) across all REST, gRPC, and WebSocket endpoints.
*   `SR-AUTH-03`: The system **shall** lock accounts for 15 minutes following 5 consecutive failed authentication attempts.

### 3.4.2 Citizen Grievance Portal (`SR-CITIZEN`)
*   `SR-CITIZEN-01`: The system **shall** allow citizens to register grievances in English, Hindi, or Hinglish text and voice inputs.
*   `SR-CITIZEN-02`: The system **shall** automatically extract browser GPS coordinates or allow manual pin placement on a map canvas.
*   `SR-CITIZEN-03`: The system **shall** assign a unique tracking identifier (`GRV-YYYYMMDD-XXXX`) and display a live resolution stepper.

### 3.4.3 Department Management (`SR-DEPT`)
*   `SR-DEPT-01`: The system **shall** restrict department supervisors to viewing and managing tickets assigned within their specific organizational boundary.
*   `SR-DEPT-02`: The system **shall** maintain real-time material inventory stocks and automatically deduct materials when work orders are executed.
*   `SR-DEPT-03`: The system **shall** display live SLA compliance metrics for all active department work queues.

### 3.4.4 Grievance Lifecycle & Deduplication (`SR-COMPLAINT`)
*   `SR-COMPLAINT-01`: The system **shall** flag complaints within a 50-meter radius submitted within 2 hours as potential duplicates.
*   `SR-COMPLAINT-02`: The system **shall** require field crew members to upload geotagged photo proof before marking a ticket as `RESOLVED`.
*   `SR-COMPLAINT-03`: The system **shall** automatically reopen and escalate tickets receiving a citizen satisfaction rating of 1 or 2 stars.

### 3.4.5 Workflow & Escalation Engine (`SR-WORKFLOW`)
*   `SR-WORKFLOW-01`: The system **shall** execute SLA escalation workflows using Temporal.io to maintain state durability across server restarts.
*   `SR-WORKFLOW-02`: The system **shall** trigger Level 1 escalation notifications to supervisors when 75% of an SLA window elapses.
*   `SR-WORKFLOW-03`: The system **shall** trigger Level 2 escalations to the City Commissioner queue when 100% of an SLA window is breached.

### 3.4.6 AI Command Center & Multi-Agent Cognitive Engine (`SR-AICOMMAND`)
*   `SR-AICOMMAND-01`: The system **shall** translate Hinglish/Hindi text inputs into standardized municipal category codes using Gemini 2.5 models.
*   `SR-AICOMMAND-02`: The system **shall** model multi-agent resource negotiations using LangGraph stateful Directed Acyclic Graphs.
*   `SR-AICOMMAND-03`: The system **shall** require explicit Human-in-the-Loop (HITL) confirmation from a dispatcher before executing high-impact physical actuation commands.

### 3.4.7 Urban Knowledge Graph (`SR-GRAPH`)
*   `SR-GRAPH-01`: The system **shall** represent physical municipal assets and relationships using a Neo4j Labeled Property Graph (LPG).
*   `SR-GRAPH-02`: The system **shall** execute multi-hop path traversal queries to identify downstream dependencies (e.g., hospitals at risk from a burst water main).

### 3.4.8 GIS & Digital Twin Map Viewport (`SR-GIS`)
*   `SR-GIS-01`: The system **shall** render vector maps, vehicle GPS tracks, and Uber H3 hexagonal heatmaps using Maplibre GL JS and Deck.gl.
*   `SR-GIS-02`: The system **shall** sustain 60 FPS rendering performance during zoom and pan operations for up to 10,000 vector elements.

### 3.4.9 Analytics & Reports (`SR-ANALYTICS`)
*   `SR-ANALYTICS-01`: The system **shall** render interactive time-series trends and department performance matrices using Apache ECharts.
*   `SR-ANALYTICS-02`: The system **shall** generate downloadable A4-formatted PDF summary reports asynchronously using Puppeteer.

### 3.4.10 Cryptographic Audit Ledger (`SR-AUDIT`)
*   `SR-AUDIT-01`: The system **shall** record all administrative overrides and ticket state changes in an append-only database table (`scos_audit_ledger`).
*   `SR-AUDIT-02`: The system **shall** chain audit blocks using SHA-256 cryptographic hashes to guarantee immutability and detect log tampering.

---

## 3.5 Non-Functional Requirements

### 3.5.1 Performance Requirements
*   `NFR-PERF-01` **API Response Time:** $95\%$ of non-analytical REST API requests **shall** complete within $200\text{ms}$.
*   `NFR-PERF-02` **GIS Rendering:** Spatial canvas updates **shall** render at $\ge 50\text{ FPS}$ on desktop clients and $\ge 30\text{ FPS}$ on mobile devices.
*   `NFR-PERF-03` **Telemetry Ingestion:** The ingestion pipeline **shall** process up to $5,000\text{ sensor events/sec}$ over Apache Kafka with latency $<100\text{ms}$.

### 3.5.2 Scalability & Capacity
*   `NFR-SCAL-01` **Horizontal Pod Auto-scaling:** Microservices **shall** auto-scale horizontally when CPU utilization exceeds $70\%$ or memory utilization exceeds $80\%$.
*   `NFR-SCAL-02` **Database Partitioning:** TimescaleDB hypertables **shall** automatically partition sensor data into daily time chunks and device hash shards.

### 3.5.3 Security & Cryptographic Integrity
*   `NFR-SEC-01` **Encryption in Transit:** All external and internal inter-service network traffic **shall** be encrypted using TLS v1.3 / mTLS.
*   `NFR-SEC-02` **Encryption at Rest:** Database volumes and object storage buckets **shall** enforce AES-256 encryption.
*   `NFR-SEC-03` **Parameterization:** All database queries **shall** use parameterized queries or type-safe ORM query builders to eliminate SQL injection risks.

### 3.5.4 Availability & Reliability
*   `NFR-AVAIL-01` **Uptime Target:** System infrastructure **shall** achieve $99.9\%$ operational availability ($<8.76\text{ hours}$ unplanned downtime annually).
*   `NFR-AVAIL-02` **Disaster Recovery:** Database Write-Ahead Logs (WAL) **shall** support Point-In-Time Recovery (PITR) to restore state within a 15-minute window.

### 3.5.5 Usability & Human Factors
*   `NFR-USE-01` **Task Efficiency:** First-time citizen users **shall** be able to submit a complete complaint in $\le 3$ steps without prior training.
*   `NFR-USE-02` **Visual Clarity:** Interfaces **shall** use high-contrast color combinations passing WCAG 2.1 AA requirements (minimum contrast ratio 4.5:1).

### 3.5.6 Accessibility
*   `NFR-ACCESS-01` **Screen Readers:** All UI controls **shall** include descriptive `aria-label` attributes and unique element `id` selectors.
*   `NFR-ACCESS-02` **Touch Targets:** Interactive buttons on mobile screens **shall** maintain a minimum touch target size of $44\times 44\text{ pixels}$.

### 3.5.7 Interoperability
*   `NFR-INTEROP-01` **Open Standards:** System interfaces **shall** conform to Open Geospatial Consortium (OGC) standards and RFC 7807 problem details specifications.

---

## 3.6 Verification & Traceability Matrix

The following matrix maps system requirements to their respective verification methods:

| Requirement ID | Module / Description | Verification Method | Pass Criteria |
| :--- | :--- | :--- | :--- |
| `SR-AUTH-01` | JWT Keycloak OIDC Authentication | Automated Test (Vitest) | Valid JWT issued with role claims upon valid login. |
| `SR-CITIZEN-01` | Hinglish/Hindi Natural Language Ingress | Integration Test (Gemini) | Correct English category returned for Hinglish query. |
| `SR-COMPLAINT-01` | 50m / 2hr Automated Deduplication | Unit Test (PostGIS) | Second complaint marked as duplicate candidate. |
| `SR-WORKFLOW-01` | Temporal.io SLA Escalation State | System Test | Escalation event triggered upon SLA timer expiry. |
| `SR-GIS-01` | 60 FPS GPU Map Rendering | Performance Test | Canvas benchmark maintains $\ge 50\text{ FPS}$ during pan. |
| `SR-AUDIT-02` | SHA-256 Ledger Chain Verification | Cryptographic Audit Test | Any alteration to past logs causes chain check failure. |
| `NFR-PERF-01` | Sub-200ms REST Response Latency | Load Test (k6) | $95^{\text{th}}$ percentile response latency $<200\text{ms}$. |

---
*This Software Requirement Specification document fulfills the requirement for Chapter 3 of the M.Tech thesis at IIT Kanpur, establishing the formal baseline for system implementation, testing, and academic verification.*
