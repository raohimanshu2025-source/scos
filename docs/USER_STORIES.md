# USER STORIES SPECIFICATION & STAKEHOLDER REQUIREMENTS MATRIX
## System: Smart City Operating System (AI-SCOS) for Indian District Administration
### Academic Subtitle: Role-Centric Functional Intent Specifications, Acceptance Criteria, Edge-Case Hardening, and Cognitive AI Augmentation
**Institution:** Indian Institute of Technology Kanpur (IIT Kanpur)  
**Author:** Product Management & Human-Centered Systems Directorate  

---

## Executive Summary

The **Smart City Operating System (AI-SCOS)** interfaces with a diverse group of stakeholders across the Indian municipal ecosystem. From a citizen in a remote ward reporting a sewage overflow in Hinglish, to the District Magistrate monitoring district-wide SLA compliance, down to an AI Governance Officer auditing multi-agent decision chains—the platform must provide tailored, role-specific interaction models.

This document establishes the complete **User Stories Specification** for AI-SCOS. User stories are organized across **10 distinct stakeholder personas**. Each story follows the standard Agile template (*As a... I want... So that...*) and explicitly details:
*   **Acceptance Criteria** (Verifiable outcomes)
*   **MoSCoW Priority** (Must Have, Should Have, Could Have, Won't Have)
*   **System Dependencies** (Upstream microservices and databases)
*   **Edge Cases & Failure Modes** (Robustness specifications)
*   **Expected AI Assistance** (Generative and cognitive capabilities)

---

## Stakeholder Persona Matrix

```
┌────────────────────────────────────────────────────────────────────────┐
│                      AI-SCOS STAKEHOLDER PERSONAS                      │
├────────────────────────────────────────────────────────────────────────┤
│ 1. Citizen               │ Public User submitting grievances & tracking│
│ 2. District Magistrate   │ Senior District Executive & Emergency Lead │
│ 3. Municipal Commissioner│ Municipal Administration & Resource Head    │
│ 4. Health Officer        │ Public Health, Hospital & Sanitation Lead   │
│ 5. Police Officer        │ Traffic & Emergency Transit Controller      │
│ 6. Water Dept (Jal S.)   │ Water Mains, Valve & Pipeline Operator      │
│ 7. Power Dept (KESCO)    │ Electrical Grid, Substation & Transformer Lead│
│ 8. System Administrator  │ Infrastructure, IAM & Cluster Operator      │
│ 9. AI Governance Officer │ AI Safety, Ethics & Audit Ledger Inspector  │
│ 10. GIS Analyst          │ Spatial Data, Deck.gl Layers & H3 Analyst   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Citizen User Stories

### User Story `US-CIT-01`: Multi-Lingual Hinglish Voice/Text Grievance Submission
*   **As a** Citizen residing in Kanpur District,
*   **I want to** register a complaint using spoken or typed Hinglish/Hindi text along with a photo and auto-detected location,
*   **So that** I can report municipal issues (e.g., water leaks, power outages, overflowing garbage) quickly without needing to know technical department jargon or English terms.

#### Specifications & Guardrails
*   **Acceptance Criteria:**
    1. System accepts free-text input mixing Hindi and English (e.g., *"Rawatpur station ke paas paani ki pipe burst ho gayi hai"*).
    2. Voice recorder component allows recording up to 60 seconds of audio and transcribes it into text with $>90\%$ accuracy.
    3. Browser HTML5 geolocation auto-detects latitude/longitude and resolves it to a ward name.
    4. System returns a unique tracking code (`GRV-YYYYMMDD-XXXX`) within 3 seconds of submission.
*   **Priority:** **Must Have**
*   **Dependencies:** `SCOS-CITIZEN` microservice, Gemini 2.5 Flash NLP Engine, PostGIS Geocoder, MinIO S3.
*   **Edge Cases:**
    *   *GPS Permission Denied:* System presents an interactive map picker requiring the user to tap their location pin manually.
    *   *No Network Connection:* App buffers the payload locally in IndexedDB and automatically retries submission when cellular connection is restored.
*   **Expected AI Assistance:** Gemini 2.5 Flash auto-translates Hinglish text into standardized English municipal taxonomy (`Jal Sansthan -> Water Pipe Rupture`) and auto-suggests urgency levels.

---

### User Story `US-CIT-02`: Real-Time Ticket Lifecycle Tracking & Reopening
*   **As a** Citizen who submitted a grievance,
*   **I want to** view a visual 4-stage stepper tracking my ticket's progress and rate the resolution quality,
*   **So that** I know exactly when field crews are dispatched and can request a reopen if the repair was unsatisfactory.

#### Specifications & Guardrails
*   **Acceptance Criteria:**
    1. Timeline stepper displays 4 states: `Submitted`, `Triaged`, `Crew Dispatched`, and `Resolved`.
    2. Upon marking `Resolved`, the system displays a 1-5 star rating component and a photo proof thumbnail uploaded by the field crew.
    3. Rating 1 or 2 stars activates a "Reopen Grievance" button requiring a brief comment.
*   **Priority:** **Must Have**
*   **Dependencies:** WebSockets Gateway (Port 3000), `SCOS-SCHEDULER`, Temporal.io Workflow Engine.
*   **Edge Cases:**
    *   *Fake Resolution:* If the field crew uploads a blurred photo, the citizen can mark 1-star, which immediately escalates the ticket to the Department Supervisor.
*   **Expected AI Assistance:** AI automatically analyzes citizen feedback on re-opened tickets to detect recurring field crew quality issues.

---

## 2. District Magistrate User Stories

### User Story `US-DM-01`: Macro District Governance & SLA Compliance Heatmap
*   **As the** District Magistrate of Kanpur,
*   **I want to** view a unified executive dashboard showing district health scores, ward-level SLA compliance heatmaps, and active emergency alerts,
*   **So that** I can hold department heads accountable during daily administrative briefings.

#### Specifications & Guardrails
*   **Acceptance Criteria:**
    1. Executive dashboard loads within 2 seconds displaying district-wide SLA resolution percentages for the past 24 hours, 7 days, and 30 days.
    2. Interactive Maplibre GL map highlights wards in Red (SLA breach $>15\%$), Amber (SLA breach $5-15\%$), and Green (SLA breach $<5\%$).
    3. Top 3 worst-performing departments are highlighted in a red callout panel with active ticket count breakdowns.
*   **Priority:** **Must Have**
*   **Dependencies:** `SCOS-ANALYTICS`, TimescaleDB Continuous Aggregations, Apache ECharts, Maplibre GL.
*   **Edge Cases:**
    *   *Data Outage:* If a department's server connection drops, the map displays a grey "Data Stale" diagonal hatch overlay for that ward rather than showing false zeroes.
*   **Expected AI Assistance:** Generates a 3-bullet natural language executive briefing summarizing major inter-departmental bottlenecks over the last 24 hours.

---

### User Story `US-DM-02`: Executive Directive Override & Emergency Freeze Trigger
*   **As the** District Magistrate,
*   **I want to** issue an administrative SLA freeze or priority override during major natural disasters (e.g., severe urban flooding),
*   **So that** municipal departments can redirect all field crews to life-safety emergency operations without incurring SLA penalty breaches.

#### Specifications & Guardrails
*   **Acceptance Criteria:**
    1. "Emergency Freeze" modal requires entering a mandatory administrative justification and selecting affected wards or departments.
    2. Activating the freeze pauses all active Temporal.io SLA countdown timers across selected scope instantly.
    3. Action generates an immutable SHA-256 audit entry in `scos_audit_ledger` capturing the DM's ID, timestamp, and justification.
*   **Priority:** **Must Have**
*   **Dependencies:** Temporal.io Workflow Engine, `scos-audit`, Keycloak RBAC (`DISTRICT_MAGISTRATE` role required).
*   **Edge Cases:**
    *   *Unauthorized Use:* Non-DM roles attempting to access the override route receive HTTP 403 Forbidden errors and trigger a security alert.
*   **Expected AI Assistance:** AI calculates estimated post-disaster backlog recovery times based on historical workforce throughput.

---

## 3. Municipal Commissioner User Stories

### User Story `US-MC-01`: Inter-Departmental Resource Allocation & Budget Review
*   **As the** Municipal Commissioner,
*   **I want to** analyze resource consumption, material inventory deficits, and contractor repair costs across all municipal divisions,
*   **So that** I can reallocate field equipment and budget to high-demand wards.

#### Specifications & Guardrails
*   **Acceptance Criteria:**
    1. Dashboard displays material consumption tables (e.g., replacement pipes, asphalt tons, transformer oil) updated in real-time.
    2. Visual bar charts compare resolution costs per ticket across Nagar Nigam, Jal Sansthan, and KESCO.
    3. One-click export generates a downloadable CSV or A4 PDF report summarizing department expenditure.
*   **Priority:** **Should Have**
*   **Dependencies:** `SCOS-DEPT`, `SCOS-REPORTS`, Puppeteer PDF Engine, TimescaleDB.
*   **Edge Cases:**
    *   *Inventory Depletion:* When inventory stocks drop below $10\%$ safety threshold, the system displays a prominent warning badge and auto-drafts a procurement request.
*   **Expected AI Assistance:** AI predicts upcoming material shortages based on forecasted seasonal weather patterns (e.g., monsoon pipe burst surges).

---

## 4. Health Officer User Stories

### User Story `US-HLT-01`: Public Health Anomaly & Water Contamination Clustering
*   **As a** District Health Officer,
*   **I want to** monitor spatial overlaps between reported sewage leaks and waterborne illness case clusters from district hospitals,
*   **So that** I can trigger immediate water chlorination and prevent cholera or dysentery outbreaks.

#### Specifications & Guardrails
*   **Acceptance Criteria:**
    1. GIS layer overlays Jal Sansthan sewage leak complaints against hospital admission case locations.
    2. Uber H3 spatial index flags hexagonal cells where sewage leak complaints co-occur within $200\text{m}$ of reported gastroenteritis cases.
    3. System issues an automated high-priority alert to the Jal Sansthan supervisor when a health risk cluster is detected.
*   **Priority:** **Must Have**
*   **Dependencies:** PostGIS Spatial Radius Queries, Uber H3 Hexagonal Grid, `SCOS-TWIN`, `SCOS-NOTIF`.
*   **Edge Cases:**
    *   *False Alarms:* Isolated cases without matching sewage infrastructure leaks are flagged as low-risk environmental anomalies.
*   **Expected AI Assistance:** AI spatial correlation model calculates a "Public Health Contamination Risk Index" score (0-100) for every ward.

---

## 5. Police / Traffic Officer User Stories

### User Story `US-TRF-01`: Automated Emergency Transit Corridor & Road Excavation Alert
*   **As a** Traffic Police Inspector,
*   **I want to** receive immediate notifications when municipal departments schedule road excavations or when water main bursts flood major intersections,
*   **So that** I can deploy traffic constables for diversions and maintain green corridors for emergency vehicles.

#### Specifications & Guardrails
*   **Acceptance Criteria:**
    1. System pushes an instant WebSocket banner when a road-blocking work order is approved for Jal Sansthan or KESCO.
    2. Map view highlights blocked road segments in red and displays recommended traffic diversion routes.
    3. Traffic Inspector can approve or request a time adjustment for non-emergency road cuts directly from the mobile app.
*   **Priority:** **Must Have**
*   **Dependencies:** WebSockets Gateway (Port 3000), `SCOS-TWIN`, PostGIS Routing Engine.
*   **Edge Cases:**
    *   *Unapproved Excavation:* If SCADA sensors or citizen photos detect an unapproved road cut, system flags it as an "Illegal Excavation" for police intervention.
*   **Expected AI Assistance:** AI suggests optimal traffic detour routes based on live congestion models and road width geometries.

---

## 6. Water Department (Jal Sansthan) User Stories

### User Story `US-WAT-01`: SCADA Telemetry Monitoring & Emergency Valve Control
*   **As a** Jal Sansthan Division Engineer,
*   **I want to** monitor live pipeline water pressure from SCADA sensors and receive instant rupture warnings with automated isolation valve recommendations,
*   **So that** I can shut off water flow to prevent major urban flooding and road erosion.

#### Specifications & Guardrails
*   **Acceptance Criteria:**
    1. Live line chart updates pipeline pressure values every 5 seconds over WebSockets.
    2. Sudden pressure drops $>30\%$ within 10 seconds trigger a prominent red "Pipeline Rupture Alert".
    3. System highlights the exact SCADA isolation valves that must be closed to isolate the burst pipe segment.
    4. Actuating a valve requires single-click human confirmation in the UI.
*   **Priority:** **Must Have**
*   **Dependencies:** TimescaleDB Hypertable, WebSockets (Port 3000), Neo4j Knowledge Graph (`FEEDS` relationship).
*   **Edge Cases:**
    *   *Sensor Failure:* If a single pressure sensor stops transmitting, the system checks adjacent downstream sensors before declaring a rupture.
*   **Expected AI Assistance:** AI traces the upstream/downstream network on Neo4j to identify all hospitals and residential colonies that will lose water supply during the valve isolation.

---

## 7. Electricity Department (KESCO) User Stories

### User Story `US-POW-01`: Transformer Feeder Trip & Inter-Utility Outage Coordination
*   **As a** KESCO Substation Operator,
*   **I want to** correlate high-voltage feeder trips with citizen power outage complaints and coordinate tree-trimming/excavation work orders with Nagar Nigam,
*   **So that** power can be restored safely without endangering municipal road repair crews.

#### Specifications & Guardrails
*   **Acceptance Criteria:**
    1. Outage dashboard automatically groups individual citizen complaints under their corresponding electrical transformer ID.
    2. Creating a transformer repair work order automatically checks if Jal Sansthan or Nagar Nigam crews are operating in the same physical zone.
    3. System provides an inter-departmental chat/notes thread linked directly to the work order ticket.
*   **Priority:** **Must Have**
*   **Dependencies:** Neo4j Electrical Topology Graph, `SCOS-DEPT`, Temporal.io Workflows.
*   **Edge Cases:**
    *   *Hazardous Overlap:* If a water leak is reported directly beneath an active 11kV transformer, system flags a "High-Risk Electrical Hazard" alert blocking crew dispatch until power is isolated.
*   **Expected AI Assistance:** AI multi-agent cognitive engine negotiates the safe order of operations between KESCO and Jal Sansthan field teams.

---

## 8. System Administrator User Stories

### User Story `US-ADM-01`: Container Microservice Health & Rate-Limit Governance
*   **As a** System Administrator,
*   **I want to** monitor microservice container CPU/memory usage, active WebSocket connections, and adjust API rate-limits dynamically,
*   **So that** I can maintain $99.9\%$ system uptime and protect backend services from traffic spikes.

#### Specifications & Guardrails
*   **Acceptance Criteria:**
    1. Cluster monitoring view displays live status cards for all 12 microservices with CPU, Memory, and HTTP request throughput metrics.
    2. Admin can adjust Kong API Gateway rate-limit sliders (e.g., max requests/sec per IP) with immediate hot-reloading effect.
    3. Any microservice instance crashing automatically triggers an alert badge and container restart log event.
*   **Priority:** **Must Have**
*   **Dependencies:** Kong API Gateway Admin API, Prometheus Metrics, Keycloak RBAC (`SYSTEM_ADMIN`).
*   **Edge Cases:**
    *   *DDoS Attack:* When incoming traffic exceeds $10\times$ normal baseline, API gateway automatically enforces CAPTCHA challenges on citizen ingress routes.
*   **Expected AI Assistance:** AI anomaly detection predicts container memory leaks 30 minutes before out-of-memory crashes occur.

---

## 9. AI Governance Officer User Stories

### User Story `US-AIG-01`: Multi-Agent Decision Inspection & SHA-256 Audit Chain Verification
*   **As an** AI Governance & Ethics Officer,
*   **I want to** inspect the step-by-step reasoning logs of AI multi-agent negotiations and verify the cryptographic integrity of the append-only audit ledger,
*   **So that** I can ensure AI dispatch recommendations are unbiased, transparent, legally compliant, and tamper-proof.

#### Specifications & Guardrails
*   **Acceptance Criteria:**
    1. AI Audit Console lists all automated categorization, translation, and multi-agent negotiation events with timestamps and confidence scores.
    2. Clicking a negotiation event opens the LangGraph state trace showing candidate proposals, priority weights, and final agreement text.
    3. "Verify Audit Ledger Integrity" button executes a SHA-256 block chain verification scan across `scos_audit_ledger` rows and displays a "Chain Verified - No Tampering Detected" status banner.
*   **Priority:** **Must Have**
*   **Dependencies:** `scos-audit`, SHA-256 Cryptographic Chaining Utility, LangGraph Trace Store.
*   **Edge Cases:**
    *   *Database Tampering:* If a database administrator manually alters a historical row in PostgreSQL, the SHA-256 verification scan flags the exact tampered Row ID in bright red.
*   **Expected AI Assistance:** AI safety monitor automatically flags agent negotiation steps that exhibit unusual bias or deviate from standard municipal operational codes.

---

## 10. GIS Analyst User Stories

### User Story `US-GIS-01`: Spatial Layer Management & Custom H3 Hexagonal Grid Analytics
*   **As a** Municipal GIS Analyst,
*   **I want to** upload custom shapefiles, configure vector tile styling, and generate custom Uber H3 hexagonal spatial density layers,
*   **So that** urban planners can analyze multi-year infrastructure degradation trends across district wards.

#### Specifications & Guardrails
*   **Acceptance Criteria:**
    1. GIS portal supports drag-and-drop shapefile / GeoJSON uploads and converts them into PostGIS spatial layers.
    2. Layer styling panel allows configuring fill colors, border widths, opacity, and zoom visibility ranges.
    3. H3 grid tool allows selecting resolution levels (Resolution 6 to 10) and exporting aggregated cell counts to GeoJSON.
*   **Priority:** **Must Have**
*   **Dependencies:** PostGIS Spatial Engine, Maplibre GL, Deck.gl H3HexagonLayer, `SCOS-TWIN`.
*   **Edge Cases:**
    *   *Invalid Geometry:* Uploading self-intersecting polygons or corrupted shapefiles triggers a geometry validation error modal with automatic repair suggestions (`ST_MakeValid`).
*   **Expected AI Assistance:** AI automatically identifies spatial anomaly clusters (e.g., unexpected concentration of road surface depressions near industrial corridors).

---

## Stakeholder User Story Summary & Traceability Matrix

| Story ID | Persona | Core Feature / Capability | Priority | Primary Microservice |
| :--- | :--- | :--- | :---: | :--- |
| `US-CIT-01` | Citizen | Hinglish Voice/Text Grievance Ingress | **Must Have** | `scos-citizen` |
| `US-CIT-02` | Citizen | Live Ticket Stepper & Reopen Workflow | **Must Have** | `scos-scheduler` |
| `US-DM-01` | District Magistrate | Executive SLA Dashboard & Heatmap | **Must Have** | `scos-analytics` |
| `US-DM-02` | District Magistrate | Emergency SLA Freeze Override | **Must Have** | `scos-audit` |
| `US-MC-01` | Municipal Commissioner| Department Inventory & Cost Review | **Should Have**| `scos-dept` |
| `US-HLT-01` | Health Officer | Sewage Leak & Illness Cluster Spatial Overlay| **Must Have** | `scos-twin` |
| `US-TRF-01` | Traffic Police | Road Excavation & Diversion Alert | **Must Have** | `scos-ingestion` |
| `US-WAT-01` | Water Dept (Jal S.) | SCADA Pipeline Telemetry & Valve Isolation | **Must Have** | `scos-twin` |
| `US-POW-01` | Power Dept (KESCO) | Transformer Outage & Multi-Utility Thread | **Must Have** | `scos-dept` |
| `US-ADM-01` | System Administrator | Cluster Monitoring & Gateway Rate-Limits | **Must Have** | `scos-admin` |
| `US-AIG-01` | AI Governance Officer | AI Negotiation Inspector & SHA-256 Ledger | **Must Have** | `scos-audit` |
| `US-GIS-01` | GIS Analyst | Shapefile Uploads & H3 Spatial Grid Analytics | **Must Have** | `scos-twin` |

---
*This User Stories Specification establishes the complete, role-centric operational requirements, acceptance criteria, edge-case guardrails, and cognitive AI enhancements across all SCOS stakeholder personas.*
