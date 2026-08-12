# AI-SCOS Phase 5B.4 — Research Architecture Traceability Documentation

**Project Title:** AI-enabled Smart City Operating System (AI-SCOS)  
**Research Focus:** Cross-Department Intelligence & Coordination Engine  
**Evaluation Scope:** M.Tech Thesis & Government Stakeholder Demonstration  

---

## 1. System Overview & Core Philosophy

The **Cross-Department Intelligence & Coordination Engine** transitions AI-SCOS from a departmental reporting portal into a unified, proactive **Urban Decision Support & Coordination Assistant**.

### Key Architectural Principle: Human-in-the-Loop Governance
The system strictly enforces a **Human-in-the-Loop policy**. AI recommendations are generated as structured proposals (containing affected departments, confidence scores, impact summaries, and recommended actions) and **MUST BE REVIEWED AND APPROVED** by an authorized district officer before any cross-department tasks are dispatched.

---

## 2. Architecture & Data Flow Pipeline

```
[ Urban Telemetry / Citizen Feed ]
               │
               ▼
   ┌──────────────────────┐
   │ SCOS Data Ingestion  │ (Precipitation, Water Level, Traffic, GIS)
   └──────────┬───────────┘
              │
              ▼
   ┌──────────────────────┐
   │ SCOS Impact Engine   │ ◄─── Spatial & Rule Engine (impactMappingRules.ts)
   └──────────┬───────────┘
              │
              ▼
   ┌──────────────────────┐
   │ Gemini AI Triage     │ ◄─── Multi-Agent Gemini Analysis (aiIncidentAnalysis.ts)
   └──────────┬───────────┘
              │
              ▼
   ┌──────────────────────┐
   │ Human Officer Panel  │ (Approve / Modify / Reject Controls)
   └──────────┬───────────┘
              │
              ▼
   ┌──────────────────────┐
   │ Task Dispatch Engine │ ───► Departmental Queues (Municipal, Traffic, Water, Health)
   └──────────┬───────────┘
              │
              ▼
   ┌──────────────────────┐
   │ SLA Escalation Timer │ ───► Level 1 / Level 2 Officer Notifications
   └──────────┬───────────┘
              │
              ▼
   ┌──────────────────────┐
   │ Governance Audit Log │ ───► Immutable Event Log (dbStore / incidentStore)
   └──────────────────────┘
```

---

## 3. Data Architecture

### Core Data Interfaces (`src/types/incident.ts`)

1. **`Incident`**: Defines the top-level urban event entity (e.g., `SCOS-INC-1024`), including location, latitude/longitude, category, severity (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`), priority (`P1`-`P4`), primary department, secondary affected departments, assigned tasks, and escalation level.
2. **`DepartmentTask`**: Represents actionable tasks assigned to specific departments (e.g., `MUNICIPAL`, `TRAFFIC`, `WATER`, `HEALTH`) with demo SLA countdowns (`demo_sla_minutes`), status (`PENDING`, `IN_PROGRESS`, `COMPLETED`, `ESCALATED`), field notes, and escalation metadata.
3. **`AIAssessment`**: Structured output from Gemini AI detailing impacted departments, recommended action matrix, confidence score (0.00–1.00), human review status (`PENDING_REVIEW`, `APPROVED`, `MODIFIED`, `REJECTED`), reviewer identity, and timestamp.
4. **`IncidentTimelineEvent`**: Sequential, timestamped audit events capturing every state transition from telemetry alert to incident resolution.

---

## 4. Integration & Backend API Architecture

All coordination operations are handled via RESTful Express routes mounted at `/api/incidents`:

- **`GET /api/incidents`**: Retrieves all active and historical incidents with live cross-department task matrices.
- **`POST /api/incidents`**: Ingests new telemetry/citizen reports and triggers synchronous AI/rule triage.
- **`POST /api/incidents/:id/ai-analyze`**: Triggers re-analysis via the Gemini AI engine.
- **`POST /api/incidents/:id/approve`**: Human approval endpoint. Transitions incident to `IN_PROGRESS`, dispatches department tasks, and logs approval audit event.
- **`POST /api/incidents/:id/modify`**: Allows authorized officers to adjust recommended actions or modify affected departments before dispatch.
- **`POST /api/incidents/:id/reject`**: Rejects an AI recommendation with logged officer justification.
- **`PATCH /api/incidents/:id/tasks/:taskId`**: Updates department task execution state (`IN_PROGRESS`, `COMPLETED`) and appends field notes.
- **`POST /api/incidents/:id/escalate`**: Simulates demo SLA expiry and increments incident escalation level (`Level 1` -> `Level 2`).
- **`POST /api/incidents/demo-scenario/trigger`**: Initializes or resets the benchmark **Heavy Rainfall at Parade Crossing** demonstration scenario.

---

## 5. Intelligence Layer: Gemini AI & Spatial Fallback Engine

1. **Gemini AI Integration (`src/services/aiIncidentAnalysis.ts`)**:
   - Uses `@google/genai` with `gemini-2.5-flash`.
   - Employs system instructions commanding structured JSON outputs containing `affected_departments`, `primary_department`, `recommended_actions`, `confidence`, `impact_summary`, and `explanation`.
2. **Deterministic Rule Fallback (`src/services/impactMappingRules.ts`)**:
   - Guarantees 100% operational uptime. If Gemini API is unreachable, offline, or rate-limited, the system seamlessly falls back to spatial classification rules based on category and severity.
   - Example: A `WATERLOGGING` incident with `CRITICAL` severity automatically maps to `MUNICIPAL`, `TRAFFIC`, `WATER`, and `HEALTH`.

---

## 6. Decision Architecture & Human Governance

- **Officer Control Panel**: Implemented in `IncidentCreateModal` and `IncidentDetailView`.
- **Audit Logging**: Every action (incident creation, AI triage, officer approval, task state change, SLA escalation) writes an immutable record to `dbStore.addAuditLog()` and the incident timeline.

---

## 7. Demonstration Benchmark Scenario: Heavy Rainfall at Parade Crossing

The system includes a pre-packaged 15-step demonstration scenario:
- **Location**: Parade Crossing, Mall Road, Ward Zone 4, Kanpur Nagar.
- **Telemetry**: 84mm/hr rainfall, 0.65m waterlogging depth.
- **Affected Departments**:
  1. **Kanpur Nagar Nigam (Municipal)**: Deploy 2 mobile 100 HP suction pumps.
  2. **Traffic Police**: Set up cones at Chunniganj to route traffic via GT Road.
  3. **Kanpur Jal Sansthan**: Open relief valve B-2 at Jajmau sewer outfall.
  4. **District Health Services**: Alert Ursula Horsman Hospital casualty ward.
- **Interactive Player**: Evaluators can trigger each phase step-by-step using `DemoScenarioPlayer` in `OperationsView`.

---

## 8. Summary of Research Contributions

| Layer | Research Implementation |
|---|---|
| **Data Layer** | Multi-sensor telemetry ingestion & standardized JSON state models |
| **Integration Layer** | RESTful cross-department task queues & state machine |
| **Intelligence Layer** | Gemini AI multi-agent triage with deterministic spatial fallback |
| **Decision Layer** | Strict Human-in-the-Loop governance & officer approval gate |
| **Coordination Layer** | Role-based task queues with automated Demo SLA escalation |
| **Outcome Layer** | Complete audit trail log & research scenario player |
