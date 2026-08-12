# FUNCTIONAL REQUIREMENT SPECIFICATION (FRS)
## System: Smart City Operating System (SCOS / AI-SCOS) for Indian District Administration
### Academic Subtitle: A Multi-Agent Cognitive Platform, Real-Time GIS Mesh, and Automated Governance Framework
**Institution:** Indian Institute of Technology Kanpur (IIT Kanpur)  
**Author:** M.Tech Thesis Research Sandbox  
**Role:** Senior Lead Business Analyst & Systems Engineering Authority  

---

## Executive Summary

The **Smart City Operating System (AI-SCOS)** is designed as an integrated cognitive platform for district administration in India (specifically tailored for Indian urban and suburban realities such as Kanpur District). It orchestrates citizen grievances, department dispatches, AI multi-agent decision support, urban knowledge graphs, real-time spatial digital twin maps, and automated compliance ledgers.

This Functional Requirement Specification (FRS) provides a complete, module-by-module functional blueprint. Every requirement is explicitly characterized by its Purpose, Primary Actors, Functional Inputs, System Outputs, Business Rules, Technical Dependencies, Acceptance Criteria, and MoSCoW Priority ranking (**Must Have**, **Should Have**, **Could Have**, **Won't Have**).

---

## Requirement Priority Matrix Legend

*   **Must Have (M):** Critical core capability required for baseline system operation, academic thesis validation, and field pilot deployment.
*   **Should Have (S):** Important feature that adds significant operational value and efficiency, scheduled for immediate secondary sprint phases.
*   **Could Have (C):** Desirable enhancement or advanced capability that will be implemented if time and compute resources allow.
*   **Won't Have (W):** Explicitly out of scope for the current thesis research prototype scope (reserved for future enterprise phase upgrades).

---

## 1. Authentication & Identity Management Module

### Requirement ID: `FRS-AUTH-001`
*   **Module:** Authentication & Security
*   **Priority:** **Must Have**
*   **Purpose:** Secure, identity-verified single sign-on (SSO) and role-based access control (RBAC) across public citizens, municipal supervisors, field crews, district magistrates, and system administrators.

#### Attributes & Specifications
*   **Primary Actors:** Citizens, Department Operators, Field Crews, District Magistrate, System Administrator.
*   **Inputs:** 
    *   Citizen: Mobile phone number + OTP (Aadhaar mock verification).
    *   Official Staff: Keycloak credentials (Username/Password, MFA Token, Role Claims).
*   **Outputs:** 
    *   Cryptographically signed OIDC JSON Web Token (JWT) containing user ID, role scopes, assigned ward IDs, and token expiration (`exp`).
*   **Business Rules:**
    1. Passwords must enforce Keycloak security policies (min 12 chars, alphanumeric + special characters).
    2. JWT tokens expire after 2 hours for active sessions; refresh tokens expire after 24 hours.
    3. Failed login attempts exceeding 5 consecutive tries block the account for 15 minutes.
    4. Access scopes are bounded by role (e.g., `FIELD_CREW` can only update assigned work orders).
*   **Dependencies:** Keycloak IAM Service, Redis Session Cache, Twilio / SMS Gateway Mock.
*   **Acceptance Criteria:**
    *   *AC-1:* Citizen can authenticate seamlessly via 6-digit SMS OTP within 10 seconds.
    *   *AC-2:* Municipal staff are routed automatically to their designated role portal (`/dashboard`, `/ai-command`, `/department/:id`) upon successful JWT signature validation.
    *   *AC-3:* Unauthorized route navigation immediately redirects the user to `/login` with an RFC 7807 authorization error payload.

---

## 2. Citizen Grievance Portal Module

### Requirement ID: `FRS-CITIZEN-002`
*   **Module:** Citizen Portal
*   **Priority:** **Must Have**
*   **Purpose:** Provide an accessible, mobile-first, multi-lingual (Hinglish/Hindi/English) interface for citizens to register civil grievances, upload photo evidence, auto-tag location coordinates, and track ticket progress in real-time.

#### Attributes & Specifications
*   **Primary Actors:** Citizens, District Inhabitants.
*   **Inputs:** Complaint title, category selection (e.g., Water Leak, Pothole, Power Outage, Sanitation), Hinglish/Hindi free-text or voice input description, photo upload (JPEG/PNG), GPS coordinates (via HTML5 Geolocation).
*   **Outputs:** Unique tracking ID (`GRV-YYYYMMDD-XXXX`), instant SMS/Push confirmation, real-time ticket lifecycle timeline view.
*   **Business Rules:**
    1. Geolocation is mandatory; if browser geolocation is disabled, the user must manually select a pin on the ward map.
    2. Multi-lingual processing must translate Hinglish or Hindi phonetics to standardized English taxonomy for department routing.
    3. File uploads are capped at 10MB per image and automatically scanned for malicious payloads.
*   **Dependencies:** `SCOS-CITIZEN` microservice, Google Cloud Storage / MinIO, Gemini 2.5 Flash (Translation), PostGIS Geocoder.
*   **Acceptance Criteria:**
    *   *AC-1:* Citizen can submit a complete complaint in Hinglish within 3 mobile steps.
    *   *AC-2:* System generates a unique tracking code and displays a live visual progress stepper (`Submitted` -> `Triaged` -> `Crew Dispatched` -> `Resolved`).
    *   *AC-3:* Image upload automatically extracts EXIF metadata to cross-verify user-reported coordinates against photo capture locations.

---

## 3. Department Management Module

### Requirement ID: `FRS-DEPT-003`
*   **Module:** Department Management
*   **Priority:** **Must Have**
*   **Purpose:** Provide department supervisors (e.g., KESCO, Jal Sansthan, Traffic Police, Nagar Nigam) with dedicated portals to manage department rosters, inventory stocks, field crew allocations, and service-level agreement (SLA) metrics.

#### Attributes & Specifications
*   **Primary Actors:** Department Supervisors, Roster Coordinators, Field Crew Leads.
*   **Inputs:** Department ID, roster shift schedules, material inventory allocations (e.g., replacement valves, transformer units), worker availability status.
*   **Outputs:** Active department queue dashboard, crew availability metrics, material inventory deficit alerts, SLA compliance summaries.
*   **Business Rules:**
    1. Department supervisors can only view and mutate tickets assigned to their explicit department scope.
    2. Inventory deductions must occur automatically upon dispatch approval for maintenance work orders.
    3. Work order allocation must check crew shift availability and geographic proximity before assignment.
*   **Dependencies:** `SCOS-SCHEDULER` microservice, PostgreSQL (Department & Roster Schema).
*   **Acceptance Criteria:**
    *   *AC-1:* Supervisor can reassign an unallocated ticket to a nearby active field crew with one click.
    *   *AC-2:* Department SLA status board displays live red/amber/green indicators based on remaining ticket resolution windows.
    *   *AC-3:* Material inventory levels automatically decrease when a repair job is marked `IN_PROGRESS`.

---

## 4. Complaint & Grievance Lifecycle Management Module

### Requirement ID: `FRS-COMPLAINT-004`
*   **Module:** Complaint Management
*   **Priority:** **Must Have**
*   **Purpose:** Manage the stateful end-to-end lifecycle of citizen complaints, enabling automated categorization, deduplication, SLA tracking, inter-departmental transfers, and resolution verification.

#### Attributes & Specifications
*   **Primary Actors:** Citizen, Department Supervisor, Field Crew, Escalation Officer.
*   **Inputs:** Raw ticket payload, manual override commands, resolution photo proof, citizen satisfaction rating (1-5 stars).
*   **Outputs:** State transitions (`CREATED` -> `TRIAGED` -> `ASSIGNED` -> `IN_PROGRESS` -> `RESOLVED` -> `CLOSED`), automated duplicate ticket merge logs, escalation triggers.
*   **Business Rules:**
    1. Complaints submitted within a 50-meter radius for the same issue category within 2 hours are automatically flagged as potential duplicates.
    2. Resolution requires mandatory photo upload from the assigned field crew at the location coordinates.
    3. If a citizen rates a resolution as 1 or 2 stars, the ticket automatically re-opens and escalates to the Department Lead.
*   **Dependencies:** `SCOS-CITIZEN`, Temporal.io Workflow Engine, PostGIS Distance Matrix.
*   **Acceptance Criteria:**
    *   *AC-1:* Duplicate complaints are merged under a single parent ticket with attached secondary citizen IDs.
    *   *AC-2:* Field crew cannot mark a ticket `RESOLVED` without attaching a geotagged "after repair" photo.
    *   *AC-3:* Temporal workflow executes automatic state transition to `ESCALATED` if the SLA deadline is exceeded.

---

## 5. Workflow & Automated Escalation Engine Module

### Requirement ID: `FRS-WORKFLOW-005`
*   **Module:** Workflow Engine
*   **Priority:** **Must Have**
*   **Purpose:** Orchestrate deterministic SLA escalation timers, multi-department approval sequences, and cross-system event streams using Temporal.io.

#### Attributes & Specifications
*   **Primary Actors:** Temporal.io System Worker, City Commissioner, Escalation Supervisor.
*   **Inputs:** Ticket creation timestamp, Category SLA configuration (e.g., Water Burst = 4 hrs, Streetlight = 48 hrs), escalation hierarchy rules.
*   **Outputs:** Escalation notification events, automated re-assignment commands, penalty/compliance records.
*   **Business Rules:**
    1. SLA timers run continuously 24/7/365 unless paused under explicit "Emergency Freeze" administrative override.
    2. Escalation Level 1 (SLA 75% elapsed): Alert sent to Department Supervisor.
    3. Escalation Level 2 (SLA 100% elapsed): Ticket re-routed to City Commissioner oversight queue; department penalty logged.
*   **Dependencies:** Temporal.io Server, Apache Kafka (`scos.grievance.events`), Redis Cache.
*   **Acceptance Criteria:**
    *   *AC-1:* Workflow state persists across backend server restarts without resetting the elapsed SLA timer.
    *   *AC-2:* Automated escalation notifications trigger across SMS, WebSockets, and email within 5 seconds of SLA breach.
    *   *AC-3:* City Commissioner dashboard displays active list of Level 2 escalated grievances across all district departments.

---

## 6. AI Command Center & Multi-Agent Cognitive Module

### Requirement ID: `FRS-AICOMMAND-006`
*   **Module:** AI Command Center
*   **Priority:** **Must Have**
*   **Purpose:** Provide incident dispatchers and emergency commanders with real-time multi-agent AI recommendations, conflict negotiation logs (WPACS), automated triage summaries, and explainable decision subgraphs.

#### Attributes & Specifications
*   **Primary Actors:** Emergency Commander, Incident Dispatcher, AI System Agent.
*   **Inputs:** Streaming grievance text, IoT sensor anomalies, active city asset maps, historical incident outcomes.
*   **Outputs:** AI conflict resolution recommendations, multi-agent negotiation logs, confidence scores, natural language summary cards.
*   **Business Rules:**
    1. AI agents operate under a Human-in-the-Loop (HITL) model; no high-impact physical action (e.g., water main shutoff) executes without human confirmation.
    2. Multi-agent negotiation (e.g., KESCO vs. Jal Sansthan resource priority) must present a transparent step-by-step reasoning chain.
    3. Confidence scores below 70% must be flagged with visual amber warning indicators requiring manual review.
*   **Dependencies:** `SCOS-COGNITIVE` microservice, Gemini 2.5 Flash / Pro, LangGraph State Engine, Vector Embeddings DB.
*   **Acceptance Criteria:**
    *   *AC-1:* AI command center displays live multi-agent negotiation logs showing proposed trade-offs during conflicting department dispatches.
    *   *AC-2:* Dispatcher can approve an AI recommendation with a single click, instantly dispatching the recommended crew and updating inventory.
    *   *AC-3:* Every AI decision card features an "Explain Recommendation" expansion drawer displaying the underlying graph nodes and rules used.

---

## 7. Urban Knowledge Graph Module

### Requirement ID: `FRS-GRAPH-007`
*   **Module:** Knowledge Graph
*   **Priority:** **Must Have**
*   **Purpose:** Model and query complex structural, geographic, and organizational dependencies across district assets (e.g., tracing upstream water pipelines connected to a power substation).

#### Attributes & Specifications
*   **Primary Actors:** Urban Planners, System Engineers, AI Reasoning Agents.
*   **Inputs:** Node creation payloads (Substation, Pipeline, Ward, Hospital), Relationship edges (`FEEDS`, `INTERSECTS`, `DEPENDS_ON`), Cypher spatial/topological queries.
*   **Outputs:** Subgraph visualization views, impacted downstream dependency lists, cascade risk scores.
*   **Business Rules:**
    1. Topological queries must execute path traversals within < 500ms for up to 5 relationship hops.
    2. Deleting a physical node requires cascading dependency verification to prevent orphan entity records.
*   **Dependencies:** Neo4j Graph DB, `SCOS-TWIN` service, GraphQL / Cypher Query Engine.
*   **Acceptance Criteria:**
    *   *AC-1:* Selecting a burst water pipe node visually highlights all downstream hospitals and electrical substations at risk of flooding.
    *   *AC-2:* Knowledge graph exposes a REST/gRPC interface returning JSON-LD structured subgraphs for AI reasoning agents.

---

## 8. GIS & Digital Twin Map Viewport Module

### Requirement ID: `FRS-GIS-008`
*   **Module:** GIS & Digital Twin Dashboard
*   **Priority:** **Must Have**
*   **Purpose:** Render high-fidelity 2D/3D GPU-accelerated spatial views of district assets, vehicle GPS locations, AQI/noise H3 hexagonal heatmaps, and underground utility vectors.

#### Attributes & Specifications
*   **Primary Actors:** District Magistrate, Urban Surveyors, Dispatchers, Citizens.
*   **Inputs:** Vector tile layers (OpenMapTiles), GeoJSON asset boundaries, live GPS vehicle stream, Uber H3 hexagonal spatial grids.
*   **Outputs:** GPU-accelerated Maplibre GL JS + Deck.gl canvas viewports, interactive asset feature cards, historical flood replay controls.
*   **Business Rules:**
    1. Vector map viewports must sustain 60 FPS performance during zoom/pan/tilt operations handling up to 10,000 active vector elements.
    2. H3 hexagonal spatial aggregations automatically adjust resolution levels based on map zoom scale (Resolution 7 to 9).
*   **Dependencies:** Maplibre GL JS, Deck.gl, PostGIS, Redis Geospatial Cache.
*   **Acceptance Criteria:**
    *   *AC-1:* Live GPS positions of field vehicles update on the map smoothly without frame drops.
    *   *AC-2:* Toggling between 2D topography and 3D building/utility layer completes in under 1 second.
    *   *AC-3:* Spatial filter tools allow drawing a bounding polygon to filter complaints and assets within a custom zone.

---

## 9. Analytics & Business Intelligence Module

### Requirement ID: `FRS-ANALYTICS-009`
*   **Module:** Analytics
*   **Priority:** **Should Have**
*   **Purpose:** Aggregate historical grievance trends, department resolution velocities, budget allocations, and spatial hotspot distribution using interactive charts and regression models.

#### Attributes & Specifications
*   **Primary Actors:** District Magistrate, Department Heads, Policy Researchers.
*   **Inputs:** Historical grievance records, SCADA sensor telemetry logs, date range filters, ward selectors.
*   **Outputs:** Apache ECharts visual dashboards, trend line charts, inter-departmental performance matrix tables, correlation heatmaps.
*   **Business Rules:**
    1. Analytics queries must execute against read-replica databases to prevent performance degradation on primary transactional nodes.
    2. Data aggregation options support daily, weekly, monthly, and yearly granularities.
*   **Dependencies:** Apache ECharts, PostgreSQL Read Replicas, TimescaleDB Aggregation Functions.
*   **Acceptance Criteria:**
    *   *AC-1:* Interactive dashboard loads within 2 seconds for historical data ranges spanning up to 12 months.
    *   *AC-2:* Users can export raw chart datasets to CSV or JSON formats.

---

## 10. Notifications & Alert Broadcast Module

### Requirement ID: `FRS-NOTIF-010`
*   **Module:** Notifications
*   **Priority:** **Must Have**
*   **Purpose:** Deliver real-time, high-priority notifications across SMS, WebSockets, push notifications (FCM), and administrative banners during emergencies and status changes.

#### Attributes & Specifications
*   **Primary Actors:** All Registered System Users.
*   **Inputs:** Alert triggers (e.g., SLA breach, SCADA pipe rupture, emergency broadcast), recipient target list (ward-based or role-based).
*   **Outputs:** In-app WebSocket notification banners, SMS text messages, Mobile FCM push notifications.
*   **Business Rules:**
    1. Emergency alerts bypass user quiet-hour preferences and rate-limiting buckets.
    2. In-app WebSocket alerts auto-expire from hot toast queues after 10 seconds unless marked critical.
*   **Dependencies:** `SCOS-NOTIF`, Redis Pub/Sub, Firebase Cloud Messaging (FCM), Twilio SMS API.
*   **Acceptance Criteria:**
    *   *AC-1:* High-priority emergency broadcast reaches all active connected portal sessions in under 1 second via WebSockets.
    *   *AC-2:* Notification history drawer maintains a chronological unread/read log for the active user session.

---

## 11. Report Generation & Publishing Module

### Requirement ID: `FRS-REPORT-011`
*   **Module:** Reports
*   **Priority:** **Should Have**
*   **Purpose:** Compile and generate official PDF district operational summaries, daily briefings for the District Magistrate, and department SLA compliance reports.

#### Attributes & Specifications
*   **Primary Actors:** District Magistrate, Department Leads, Public Auditors.
*   **Inputs:** Report type selection, date range, template parameters, optional executive summary notes.
*   **Outputs:** Pixel-perfect downloadable PDF documents, automated email attachments.
*   **Business Rules:**
    1. PDF compilation executes asynchronously in background queues to prevent HTTP gateway timeouts.
    2. Generated PDF artifacts must feature official district branding headers and cryptographic verification hashes.
*   **Dependencies:** Puppeteer (Headless Chromium), BullMQ Queue, MinIO / GCS Storage.
*   **Acceptance Criteria:**
    *   *AC-1:* Requesting a 30-day district summary generates a downloadable PDF report within 15 seconds via an asynchronous job link.
    *   *AC-2:* PDF documents format cleanly across standard A4 pages with embedded charts and tables.

---

## 12. System Administration & Configuration Module

### Requirement ID: `FRS-ADMIN-012`
*   **Module:** Administration
*   **Priority:** **Must Have**
*   **Purpose:** Provide system administrators with tools to configure RBAC user roles, monitor microservice cluster health, adjust API rate-limits, and manage registered IoT sensors.

#### Attributes & Specifications
*   **Primary Actors:** System Administrators, IT Operations Teams.
*   **Inputs:** User role assignments, API rate-limit thresholds, sensor registration parameters, feature flag toggles.
*   **Outputs:** User permission matrices, system health status boards, active sensor inventory tables.
*   **Business Rules:**
    1. Only users assigned the `SYSTEM_ADMIN` role can access `/admin` routes.
    2. Configuration changes take effect dynamically without requiring service container restarts.
*   **Dependencies:** Keycloak Admin API, HashiCorp Vault, Kong Gateway Admin API, Prometheus.
*   **Acceptance Criteria:**
    *   *AC-1:* Admin can add or revoke role scopes for an official staff account with immediate effect.
    *   *AC-2:* Cluster health view displays real-time CPU, memory, and database connection metrics across all microservices.

---

## 13. Audit Logging & Compliance Ledger Module

### Requirement ID: `FRS-AUDIT-013`
*   **Module:** Audit Logs
*   **Priority:** **Must Have**
*   **Purpose:** Maintain a cryptographically verifiable, append-only ledger of all administrative overrides, manual dispatch changes, system logins, and data modifications for legal compliance and accountability.

#### Attributes & Specifications
*   **Primary Actors:** Security Auditors, Public Inspectors, System Administrators.
*   **Inputs:** System mutation events, actor ID, IP address, timestamp, pre-change/post-change state payloads.
*   **Outputs:** Cryptographically chained audit log list, tamper-verification status indicators, compliance export files.
*   **Business Rules:**
    1. Audit logs are strictly append-only; update (`UPDATE`) or delete (`DELETE`) operations are blocked at the database level.
    2. Each audit block includes the cryptographic hash of the preceding block (SHA-256 chaining) to guarantee immutability.
    3. Log retention is mandated for a minimum of 24 months.
*   **Dependencies:** PostgreSQL (`scos_audit_ledger`), OpenSearch, Cryptographic Chaining Utility.
*   **Acceptance Criteria:**
    *   *AC-1:* Every administrative override generates an audit entry capturing the actor ID, reason, and state delta within 100ms.
    *   *AC-2:* Running the audit verification check validates SHA-256 chain continuity and flags any modified or missing log blocks.

---

## 14. Thesis Research Out-Of-Scope Capabilities

### Requirement ID: `FRS-OUTOFSCOPE-014`
*   **Module:** System-Wide
*   **Priority:** **Won't Have (For Thesis Prototype)**
*   **Purpose:** Explicitly document enterprise capabilities deferred to post-thesis production deployments.

#### Deferred Features:
1.  **Direct UIDAI Live Hardware HSM Integration:** Mocked via standard OTP/XML verification sandbox.
2.  **Autonomous Drone Dispatch & Video Feed Integration:** Deferred to future physical smart city pilots.
3.  **Real-Time Municipal Revenue / Billing Payment Gateway:** Financial transaction processing is deferred; mock status triggers are utilized instead.

---
*This Functional Requirement Specification establishes the complete, authoritative operational blueprint for AI-SCOS, guiding all frontend, backend, AI, database, and system integration developments.*
