# MODULE DEPENDENCY GRAPH & IMPLEMENTATION SEQUENCE
## System: Smart City Operating System (AI-SCOS) for Indian District Administration
### Academic Subtitle: Topological Dependency Mapping, Contract-Driven Architecture, and Zero-Rework Implementation Sequence
**Institution:** Indian Institute of Technology Kanpur (IIT Kanpur)  
**Author:** Lead Systems Architect & Software Engineering Directorate  

---

## 1. Executive Summary & Design Philosophy

Engineering a large multi-service system like the **Smart City Operating System (AI-SCOS)** without a strict, topographically ordered module implementation sequence leads to severe integration rework, circular dependencies, unstable test mocks, and breaking contract changes.

In AI-SCOS, higher-level cognitive and analytical components—such as the **AI Multi-Agent Command Engine**, **Temporal.io Workflow Escalations**, **3D GIS Digital Twin Viewports**, and **Executive Analytics Dashboards**—are downstream consumers of foundational domain data models, identity scopes, and transactional event streams. 

Attempting to build the AI command layer before establishing identity claims (`JWT`), departmental boundaries (`WardID`), or ticket state schemas (`GrievanceDTO`) forces developers to build throwaway mock adapters that must be rewritten when lower-level data structures stabilize.

This document defines the **Topological Module Dependency Graph** for AI-SCOS and provides a **12-stage logical implementation sequence** designed to completely eliminate architectural rework.

---

## 2. Complete Architectural Module Dependency Graph

The diagram below illustrates the strict directional dependency topology across all 12 core AI-SCOS system modules:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   STAGE 1: CORE PERSISTENCE & SCHEMAS                  │
│      (PostgreSQL/PostGIS, Drizzle Models, Types, Shared Contracts)      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   STAGE 2: AUTHENTICATION & IAM                        │
│            (Keycloak OIDC, JWT Issuance, RBAC Claims Engine)           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   STAGE 3: USER & PROFILE MANAGEMENT                   │
│        (Citizen Profiles, Official Staff Rosters, Field Crews)         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                STAGE 4: DEPARTMENT & INVENTORY SYSTEM                  │
│       (Jal Sansthan, KESCO, Nagar Nigam, Traffic Boundaries)           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               STAGE 5: COMPLAINT & GRIEVANCE ENGINE                    │
│      (Ingress API, Deduplication, Photo Proofs, State Transitions)     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 STAGE 6: URBAN KNOWLEDGE GRAPH & GIS                   │
│      (PostGIS Geometries, Neo4j Topology, Maplibre/Deck.gl Layers)     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 STAGE 7: WORKFLOW & ESCALATION ENGINE                  │
│     (Temporal.io Deterministic SLA Timers, Auto-Reassignment Rules)    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               STAGE 8: AI MULTI-AGENT COMMAND CENTER                   │
│   (Gemini 2.5 Hinglish NLP, LangGraph Negotiation, HITL Dispatch)      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                STAGE 9: NOTIFICATION & BROADCAST MESH                  │
│       (Redis Pub/Sub, WebSockets Port 3000, FCM Mobile Push)          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│              STAGE 10: ANALYTICS & BUSINESS INTELLIGENCE               │
│       (Apache ECharts, TimescaleDB Aggregations, Heatmap Matrices)     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               STAGE 11: REPORT GENERATION & PUBLISHING                 │
│         (Puppeteer Headless PDF Compiler, Async Queue Jobs)            │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│             STAGE 12: SYSTEM ADMIN & CRYPTOGRAPHIC AUDIT               │
│      (Cluster Metrics, Keycloak Admin, SHA-256 Audit Ledger)           │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Detailed Module-by-Module Rationale & "Why X Before Y"

The following section explains the architectural necessity for building each module in sequence.

---

### Stage 1: Core Persistence & Shared Schemas
*   **Dependencies:** None (Foundation Level).
*   **Why It Must Be Built First:** 
    Before writing authentication controllers or REST endpoints, the shared TypeScript DTO interfaces, Zod validation schemas, and Drizzle database models (`scos_users`, `scos_departments`, `scos_grievances`) must be defined. All microservices import these shared type contracts from `/shared/contracts`.
*   **Rework Prevented:** Prevents mismatched JSON key names (`snake_case` vs `camelCase`), conflicting database column types, and duplicate type definitions across microservices.

---

### Stage 2: Authentication & Identity Management (Keycloak IAM)
*   **Prerequisites:** Stage 1 (Shared Contracts & Persistence).
*   **Why It Must Be Built Before User Management:** 
    User profiles, department roles, and field crew assignments rely on the security identity context (`sub`, `roles`, `ward_id`) contained within cryptographically verified JWT tokens issued by Keycloak.
*   **Rework Prevented:** Eliminates the need to write temporary unauthenticated routes or fake authentication headers that would later need to be purged during security hardening.

---

### Stage 3: User & Profile Management
*   **Prerequisites:** Stage 2 (Authentication & IAM).
*   **Why It Must Be Built Before Department Management:** 
    Departments are composed of official personnel (Supervisors, Field Crews, Dispatchers). Department rosters cannot be configured or assigned without existing user entity references.
*   **Rework Prevented:** Prevents foreign key constraint failures and orphan user reference issues in department shift databases.

---

### Stage 4: Department & Inventory Management
*   **Prerequisites:** Stage 3 (User & Profile Management).
*   **Why It Must Be Built Before Complaint Engine:** 
    Every incoming citizen grievance must be categorized and routed to a specific department boundary (e.g., Jal Sansthan for water leaks, KESCO for transformer faults). If departments do not exist, complaints cannot be triaged or allocated.
*   **Rework Prevented:** Prevents creating hardcoded department string literals in complaint ticket handlers that would require refactoring once dynamic department structures are added.

---

### Stage 5: Complaint & Grievance Engine
*   **Prerequisites:** Stage 4 (Department Management).
*   **Why It Must Be Built Before Knowledge Graph & GIS Engine:** 
    The complaint engine is the primary transactional engine of AI-SCOS. The GIS digital twin map and Knowledge Graph require actual complaint records (geospatial coordinates, timestamps, severity ratings) to populate map vector layers and node relationship networks.
*   **Rework Prevented:** Prevents GIS developers from building static dummy GeoJSON mocks that do not match the real complaint state transition API payloads.

---

### Stage 6: Urban Knowledge Graph & GIS Engine (PostGIS + Neo4j)
*   **Prerequisites:** Stage 5 (Complaint & Grievance Engine).
*   **Why It Must Be Built Before Workflow Engine:** 
    Spatial proximity checks (detecting complaints within a $50\text{m}$ radius) and topological dependency analysis (identifying downstream power substations linked to a broken water pipe) require PostGIS spatial indices and Neo4j graph traversal endpoints.
*   **Rework Prevented:** Prevents workflow engineers from writing primitive, flat SLA timers that fail to account for spatial duplicates or structural cascade risks.

---

### Stage 7: Workflow & SLA Escalation Engine (Temporal.io)
*   **Prerequisites:** Stage 6 (Knowledge Graph & GIS Engine).
*   **Why It Must Be Built Before AI Command Center:** 
    Temporal.io orchestrates stateful workflow executions, SLA expiration timers, and escalation triggers. The AI Command Center monitors these workflow state signals to generate AI-assisted recommendations.
*   **Rework Prevented:** Ensures the AI agent receives deterministic, real-time workflow state events from Temporal rather than polling raw database tables.

---

### Stage 8: AI Multi-Agent Command Center (LangGraph + Gemini 2.5)
*   **Prerequisites:** Stage 7 (Workflow Engine) & Stage 6 (Knowledge Graph).
*   **Why It Must Be Built Before Notification Mesh:** 
    The AI engine processes natural language Hinglish complaints, queries the Neo4j knowledge graph for dependency analysis, and negotiates multi-department trade-offs via LangGraph. The resulting dispatch recommendations generate notification events for administrators and field crews.
*   **Rework Prevented:** Guarantees that AI dispatch algorithms interact with fully stabilized domain workflows, graph traversals, and ticket states.

---

### Stage 9: Notification & Broadcast Mesh (Redis Pub/Sub + WebSockets)
*   **Prerequisites:** Stage 8 (AI Command Center) & Stage 7 (Workflow Engine).
*   **Why It Must Be Built Before Analytics & Reporting:** 
    Notifications deliver real-time events triggered by state mutations, SLA breaches, and AI dispatch approvals across WebSockets (Port 3000) and SMS channels. Analytics and audit engines monitor these event streams.
*   **Rework Prevented:** Eliminates polling mechanisms on administrative dashboards in favor of a unified WebSocket event stream.

---

### Stage 10: Analytics & Business Intelligence (Apache ECharts + TimescaleDB)
*   **Prerequisites:** Stage 9 (Notification Mesh) & Stage 5 (Complaint Engine).
*   **Why It Must Be Built Before Report Generation:** 
    Analytics dashboards aggregate historical trends, resolution velocities, and heatmaps from transactional databases and event logs. The PDF report generation engine uses these computed charts to build executive briefings.
*   **Rework Prevented:** Prevents duplicate SQL aggregation queries by providing clean, pre-calculated analytical view APIs for the report generator.

---

### Stage 11: Report Generation & Publishing (Puppeteer Headless)
*   **Prerequisites:** Stage 10 (Analytics) & Stage 4 (Department Management).
*   **Why It Must Be Built Before Final System Admin Audit:** 
    The report generator compiles PDF documents containing analytics charts, SLA metrics, and department summary logs into MinIO/GCS storage buckets.
*   **Rework Prevented:** Ensures PDF templates receive validated, pre-rendered chart images and formatted analytics tables.

---

### Stage 12: System Administration & Cryptographic Audit Ledger
*   **Prerequisites:** Stage 1 through Stage 11 (All Functional Modules).
*   **Why It Must Be Built Last:** 
    The Cryptographic Audit Ledger captures state changes and administrative overrides across *all* system modules in an append-only table (`scos_audit_ledger`) chained via SHA-256 hashes. It requires all upstream modules to be fully implemented to capture their mutation events.
*   **Rework Prevented:** Prevents missing audit hooks or broken SHA-256 hash chains caused by late modifications to upstream ticket payload structures.

---

## 4. Implementation Order Execution Matrix

The following matrix provides the implementation roadmap for engineering teams across all 12 stages:

| Stage | Module Name | Core Artifacts Produced | Target Completion Window | Rework Risk If Out Of Order |
| :---: | :--- | :--- | :---: | :---: |
| **01** | **Shared Persistence & Contracts** | Drizzle Schemas, Zod DTOs, TypeScript Types | Sprint 1 (Days 1–3) | **CRITICAL (High Rework)** |
| **02** | **Keycloak Authentication** | JWT OIDC Issuance, RBAC Claims Middleware | Sprint 1 (Days 4–5) | **HIGH** |
| **03** | **User & Profile Management** | User Repositories, Profile REST Endpoints | Sprint 2 (Days 1–2) | **HIGH** |
| **04** | **Department & Inventory** | Department Boundaries, Stock Deductors | Sprint 2 (Days 3–5) | **HIGH** |
| **05** | **Complaint & Grievance Engine** | Ingress API, Deduplication, Photo Proofs | Sprint 3 (Days 1–5) | **MEDIUM** |
| **06** | **Knowledge Graph & GIS Engine** | PostGIS Vector Tile Layers, Neo4j Graph | Sprint 4 (Days 1–5) | **MEDIUM** |
| **07** | **Workflow & SLA Engine** | Temporal.io Workflows, Escalation Timers | Sprint 5 (Days 1–5) | **MEDIUM** |
| **08** | **AI Multi-Agent Command Center** | LangGraph Agents, Gemini 2.5 Translation | Sprint 6 (Days 1–5) | **LOW** |
| **09** | **Notification & Broadcast Mesh** | WebSocket Gateway (Port 3000), Redis PubSub| Sprint 7 (Days 1–3) | **LOW** |
| **10** | **Analytics & BI Engine** | ECharts Views, TimescaleDB Aggregations | Sprint 7 (Days 4–5) | **LOW** |
| **11** | **Report Generation** | Puppeteer PDF Compiler, Async Queues | Sprint 8 (Days 1–3) | **LOW** |
| **12** | **Admin & SHA-256 Audit Ledger** | Cryptographic Ledger, Cluster Monitors | Sprint 8 (Days 4–5) | **NONE (Complete)** |

---
*This Module Dependency Graph and Implementation Sequence manual establishes the topological build order and contract-driven guidelines required to construct AI-SCOS cleanly and efficiently without architectural rework.*
