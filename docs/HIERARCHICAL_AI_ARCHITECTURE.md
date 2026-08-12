# HIERARCHICAL COGNITIVE MULTI-AGENT ARCHITECTURE SPECIFICATION
## System: Smart City Operating System (SCOS) for Indian District Administration
### Academic Subtitle: A Hierarchical Multi-Agent AI Substrate with Delegated Decision Authorities, Bitemporal Memory Paging, and Dual-Track Human Override Protocols
**Institution:** Indian Institute of Technology Kanpur (IIT Kanpur)  
**Author:** M.Tech Thesis Research Sandbox  

---

## Executive Summary

City-scale cyber-physical-social systems (CPSS) demand an artificial intelligence substrate that is simultaneously highly flexible, legally compliant, extremely resilient, and fast. Traditional single-LLM chat systems fail under these requirements due to high latency, context window saturation, lack of deterministic execution paths, and vulnerability to prompt injection.

To solve this, the **Smart City Operating System (SCOS)** implements a **Hierarchical Multi-Agent AI Architecture**. This architecture organizes cognitive intelligence into a structured hierarchy where specialized, low-level agents manage data quality, local predictions, and department-specific tasks. Higher-level agents coordinate overall strategies, enforce legal compliance, and manage system-wide states.

This document details the design specifications of these ten core agents, establishes their communication and negotiation protocols, and provides a formal comparative analysis explaining why this hierarchical design is superior to a monolithic chatbot approach.

---

## SCOS Cognitive Hierarchy Map

The following schematic maps the structural lines of authority, communication channels, and event routing paths across the hierarchical SCOS multi-agent ecosystem:

```
==========================================================================================
                              Level 3: STRATEGIC & SUPERVISORY
==========================================================================================
                                ┌─────────────────────────┐
                                │ EXECUTIVE AI AGENT      │
                                │ (SCOS-EXEC)             │
                                └─────▲─────────────┬─────┘
                                      │             │
                    ┌─────────────────┴──────┐      ├────────────────────────┐
                    │ POLICY AGENT           │      │ PLANNING AGENT         │
                    │ (SCOS-POLICY)          │      │ (SCOS-PLAN)            │
                    └─────────────────▲──────┘      └────────────────────────┘
                                      │
==========================================================================================
                              Level 2: OPERATIONAL & COORDINATION
==========================================================================================
                                ┌─────┴───────────────────┐
                                │ EMERGENCY COORDINATOR   │
                                │ (SCOS-EMERGENCY)        │
                                └─────▲─────────────┬─────┘
                                      │             │
                    ┌─────────────────┴──────┐      ├────────────────────────┐
                    │ CITIZEN ASSISTANT      │      │ REPORT GENERATOR       │
                    │ (SCOS-ASSISTANT)       │      │ (SCOS-REPORT)          │
                    └─────────────────▲──────┘      └────────────────────────┘
                                      │
==========================================================================================
                              Level 1: TACTICAL & INGESTION
==========================================================================================
     ┌──────────────────────────┬─────┴─────────────────────┬────────────────────────┐
     │ DEPARTMENT AGENTS        │ PREDICTION AGENTS         │ KNOWLEDGE GRAPH AGENT  │
     │ (SCOS-DEPT)              │ (SCOS-PREDICT)            │ (SCOS-KG)              │
     └──────────────────────────┼───────────────────────────┼────────────────────────┘
                                │ DATA QUALITY AGENT        │
                                │ (SCOS-QUALITY)            │
                                └───────────────────────────┘
```

---

## 1. Agent-by-Agent Technical Specifications

---

### 1. Executive AI Agent (SCOS-EXEC)
*   **Goals:** Act as the supreme administrative brain of SCOS. Coordinate turning priorities, allocate long-term district budgets, evaluate cross-departmental operations, and handle high-level policy stalemates.
*   **Memory:** 
    *   *Episodic:* High-level summary state logs of the district over the past 30 days.
    *   *Semantic:* Vectorized District Master Plan, national urban development frameworks, and annual budget allocation rules.
*   **Planning Capability:** High-level strategic planning. Uses Hierarchical Task Network (HTN) planning to break year-long urban goals (e.g., "Reduce waterlogging by 40% in Kalyanpur") into monthly department projects.
*   **Reasoning:** Conceptual and policy-oriented. Uses tree-of-thought (ToT) reasoning to balance competing priorities (e.g., budget allocation for power grid repairs vs. water pipe expansions).
*   **Decision Authority:** **Strategic Approval & Escalation.** It cannot trigger physical actuators directly. It approves major operational campaigns and escalates high-risk conflicts to the District Magistrate.
*   **Tool Access:** 
    *   `queryDistrictStateSummary()`: Compiles high-level KPIs.
    *   `allocateOperationalBudget(deptId, amount)`: Adjusts temporary operational funding caps.
    *   `raiseSupervisoryEscalation(issueSummary)`: Pushes a critical ticket to the Magistrate.
*   **Communication Protocol:** High-level gRPC streams using structured JSON envelopes for administrative requests.
*   **Failure Handling:** Fail-safe state preservation. If SCOS-EXEC experiences a crash, it stores active context to a persistent PostgreSQL database and defaults to a read-only state, preserving the previous configuration.

---

### 2. Department Agents (SCOS-DEPT)
*   **Goals:** Manage specific municipal divisions (Water, Electricity, Health, Traffic, Police). Maximize service delivery and resolve tickets within SLA limits.
*   **Memory:** 
    *   *Episodic:* Active shift schedules, tool inventories, and assigned tickets (sliding 7-day window).
    *   *Semantic:* Departmental manuals, maintenance guidelines, and local asset maps.
*   **Planning Capability:** Tactical task scheduling. Uses Markov Decision Processes (MDP) to optimize dispatch routes and crew allocations.
*   **Reasoning:** Operational and rule-based. Uses chain-of-thought (CoT) reasoning to diagnose asset failures (e.g., identifying a blocked water pipe by analyzing pressure drops).
*   **Decision Authority:** **Autonomous Tactical Control.** Authorized to deploy crews, schedule routine repairs, and adjust local configurations (within pre-approved budgets).
*   **Tool Access:** 
    *   `dispatchMaintenanceCrew(crewId, ticketId)`: Assigns a team to a site.
    *   `queryInventoryWarehouse(itemId)`: Audits available tools and materials.
    *   `updateTicketState(ticketId, state)`: Updates the core SCOS event log.
*   **Communication Protocol:** Publish-Subscribe pattern via Kafka topics (`scos-dept-actions`).
*   **Failure Handling:** Localized isolation. If a department agent fails, its active tickets are shifted to a fallback queue for manual assignment.

---

### 3. Prediction Agents (SCOS-PREDICT)
*   **Goals:** Forecast future urban states, identify physical hazards, and predict system load curves.
*   **Memory:** 
    *   *Episodic:* Last 48 hours of sensor telemetry and weather inputs.
    *   *Semantic:* Trained neural models, historical weather logs, and seasonal demand trends.
*   **Planning Capability:** Predictive analytics. Does not plan tasks, but projects future state paths (e.g., forecasting water level rises at the Ganges Barrage).
*   **Reasoning:** Statistical and spatial-temporal. Uses deep neural models to analyze sensor inputs and calculate hazard probabilities.
*   **Decision Authority:** **Advisory Only.** No actuation authority. Generates predictive vectors to trigger action states in other agents.
*   **Tool Access:** 
    *   `executeHydrologicalModel(upstreamHeights)`: Computes flood maps.
    *   `calculateLoadCurve(temperatureTrend)`: Forecasts peak power usage.
*   **Communication Protocol:** Continuous asynchronous gRPC streaming of prediction vectors.
*   **Failure Handling:** Fallback to historical averages. If predictive models fail, the agent falls back to static historical baselines.

---

### 4. Planning Agent (SCOS-PLAN)
*   **Goals:** Monitor Master Plan compliance, review building permit requests, and detect structural encroachments.
*   **Memory:** 
    *   *Episodic:* Pending building permit queues and active survey reports.
    *   *Semantic:* District Building Bylaws, National Building Code of India, and historical satellite imagery.
*   **Planning Capability:** Spatial constraints validation. Uses geometric constraint solvers to check building designs against zoning rules.
*   **Reasoning:** Spatial-temporal and geometric. Compares satellite imagery to identify unapproved expansions.
*   **Decision Authority:** **Inspection Scheduling.** Authorised to schedule physical site verifications and flag properties for tax holds.
*   **Tool Access:** 
    *   `compareSatelliteRaster(img1, img2)`: Detects footprint changes.
    *   `auditPermitCompliance(permitId)`: Verifies setback distances and height limits.
*   **Communication Protocol:** Request-Response REST API endpoints over secure private channels.
*   **Failure Handling:** Hold and review. If SCOS-PLAN fails, pending building permits are placed on a temporary hold to prevent automatic approvals.

---

### 5. Policy Agent (SCOS-POLICY)
*   **Goals:** Audit all SCOS actions to ensure compliance with municipal laws, data-privacy standards, and administrative guidelines.
*   **Memory:** 
    *   *Episodic:* Active system action log (sliding 24-hour window).
    *   *Semantic:* UP Municipal Corporation Act, Personal Data Protection (PDP) Act, and security rules.
*   **Planning Capability:** Static policy auditing. Does not plan tasks, but reviews planned action sequences to identify legal risks.
*   **Reasoning:** Deductive, legal reasoning. Uses formal logic to check action parameters against administrative constraints.
*   **Decision Authority:** **Hard-Veto Power.** Authorised to block any SCOS action that violates legal guidelines or data-privacy rules.
*   **Tool Access:** 
    *   `verifyActionLegality(actionPayload)`: Validates action safety.
    *   `redactPersonalIdentifiableInformation(text)`: Scrubs citizen IDs.
*   **Communication Protocol:** Synchronous interceptor pattern. Every command envelope must be approved by SCOS-POLICY before execution.
*   **Failure Handling:** Fail-closed configuration. If SCOS-POLICY crashes, all outgoing actuation commands are suspended until the service recovers.

---

### 6. Emergency Coordinator (SCOS-EMERGENCY)
*   **Goals:** Protect public safety during crises (storms, industrial fires, major accidents, power failures).
*   **Memory:** 
    *   *Episodic:* Active emergency logs, rescue team locations, and hospital bed counts.
    *   *Semantic:* National Disaster Management Authority (NDMA) protocols and evacuation route maps.
*   **Planning Capability:** High-velocity contingency planning. Uses reactive planning models to adjust evacuation routes and prioritize rescue assets.
*   **Reasoning:** High-priority, safety-first reasoning. Focuses on minimizing threat levels and casualty delays.
*   **Decision Authority:** **High-Impact Actuation.** Authorised to override standard traffic signals, isolate high-voltage power lines, and declare public emergencies.
*   **Tool Access:** 
    *   `tripSubstationCircuit(substationId)`: Trips high-voltage lines.
    *   `overrideTrafficCorridor(corridorId, duration)`: Commands green light phases.
    *   `triggerSirenArray(wardId, pattern)`: Activates local auditory alarms.
*   **Communication Protocol:** High-priority gRPC channels with zero-queue latency configurations.
*   **Failure Handling:** Decentralized operator handoff. If SCOS-EMERGENCY fails, the system immediately sounds alarms in the command center and switches controls to manual operator boards.

---

### 7. Report Generator (SCOS-REPORT)
*   **Goals:** Synthesize complex city operations, service-level compliance (SLAs), and budget metrics into clear daily reports for leadership.
*   **Memory:** 
    *   *Episodic:* Daily transactional logs and system event streams.
    *   *Semantic:* Executive reporting templates and performance indices.
*   **Planning Capability:** Document synthesis. Evaluates data streams to format operational reports.
*   **Reasoning:** Inductive and analytical. Groups raw events into high-level summaries.
*   **Decision Authority:** **Autonomous Compilation.** Authorized to compile, format, and deliver operational reports to supervisors.
*   **Tool Access:** 
    *   `aggregateSLAPerformance(deptId)`: Computes response times.
    *   `generateAnalyticalSummaries(startDate, endDate)`: Synthesizes logs.
*   **Communication Protocol:** Standard batch processing schedules; publishes output files directly to SCOS storage.
*   **Failure Handling:** Auto-retry with backoff. If generation fails, the system schedules a rebuild on adjacent computing nodes.

---

### 8. Citizen Assistant (SCOS-ASSISTANT)
*   **Goals:** Manage citizen communication, translate and summarize multi-lingual complaints, route grievances, and provide updates.
*   **Memory:** 
    *   *Episodic:* Active conversation history with complaining citizens.
    *   *Semantic:* Dialect structures (Hinglish/Hindi), municipal service directories, and communication rules.
*   **Planning Capability:** Conversational dialogue management. Formulates friendly, step-by-step diagnostic questions.
*   **Reasoning:** Linguistic and empathetic. Translates conversational text and maps complaints to structured categories.
*   **Decision Authority:** **Grievance Triage.** Authorized to register complaints, assign tracking IDs, and deliver progress notifications.
*   **Tool Access:** 
    *   `translateColloquialText(text)`: Translates Hindi/Hinglish to English.
    *   `registerCitizenComplaint(payload)`: Inserts a new ticket to the event bus.
    *   `sendCitizenSMS(citizenId, text)`: Delivers real-time status updates.
*   **Communication Protocol:** REST APIs paired with secure web socket connections.
*   **Failure Handling:** Defaults to simple standard text templates. If conversational models crash, the assistant switches to basic form inputs.

---

### 9. Data Quality Agent (SCOS-QUALITY)
*   **Goals:** Clean, validate, and verify incoming sensor telemetries, filtering environmental noise and detecting spoofed inputs.
*   **Memory:** 
    *   *Episodic:* Last 10 minutes of sensor readings per hardware node.
    *   *Semantic:* Sensor calibration tolerances, valid physical limits, and adjacent sibling node indices.
*   **Planning Capability:** Data cleaning loops. Cleans and structures data streams before they reach the memory cache.
*   **Reasoning:** Spatial consensus reasoning. Validates single sensor anomalies against neighboring nodes.
*   **Decision Authority:** **Input Filtering.** Authorized to reject invalid payloads and flag compromised sensors.
*   **Tool Access:** 
    *   `executeKalmanFilter(sensorId, rawValue)`: Smooths erratic readings.
    *   `verifySpatialConsensus(sensorId, value)`: Checks readings against adjacent nodes.
*   **Communication Protocol:** Inline gRPC interceptor inside the **Device Ingestion Gateway**.
*   **Failure Handling:** Bypass with warnings. If the quality agent crashes, raw data is written to the database with a `LOW_CONFIDENCE` metadata flag.

---

### 10. Knowledge Graph Agent (SCOS-KG)
*   **Goals:** Maintain and optimize the Urban Knowledge Graph, linking physical infrastructure, rules, events, and personnel.
*   **Memory:** 
    *   *Episodic:* Active query caches and recent relation additions.
    *   *Semantic:* SCOS Master Ontology and Graph Schema patterns.
*   **Planning Capability:** Graph query compilation. Optimizes multi-hop search queries.
*   **Reasoning:** Ontological and relational reasoning. Infers deep relations (e.g., identifying contamination paths by tracing pipe structures).
*   **Decision Authority:** **Schema Optimization.** Authorized to register new relationships, update weights, and cache query results.
*   **Tool Access:** 
    *   `executeCypherQuery(query)`: Searches the active graph.
    *   `insertSemanticRelationship(sourceId, targetId, relation)`: Updates connections.
*   **Communication Protocol:** High-performance binary database protocols (Bolt/gRPC).
*   **Failure Handling:** Fallback to relational stores. If the graph engine goes offline, SCOS routes basic queries to standard relational databases.

---

## 2. Coordination, Negotiation & Conflict Resolution

SCOS coordinates its multi-agent hierarchy using a **Bidirectional Contract Net Protocol (BCNP)** and resolves contradictions using the **WPACS Arbitration Framework**.

### The BCNP Negotiation Loop
1.  **Task Announcement:** When a complex issue (e.g., a major water leak) is detected, the **Executive Agent (SCOS-EXEC)** broadcasts a task proposal describing the coordinates and requirements.
2.  **Bidding Phase:** Subordinate Department Agents (e.g., Jal Sansthan, KMC Sewage, KESCO) analyze their active rosters and tools, submitting a "bid" containing estimated response times and resource costs.
3.  **Awarding:** SCOS-EXEC evaluates the bids, awarding the primary task to the most efficient division while scheduling secondary support roles (e.g., directing traffic police to divert traffic around the repair coordinates).

```
[SCOS-EXEC] ────► Broadcasts Task (Water Leak, Sector 4) ────► [Department Agents]
                                                                     │
[SCOS-EXEC] ◄──── Evaluates Resource Bids (Cost, Time) ◄──────────────┘
     │
     ▼
Assigns Primary Task (Jal Sansthan) & Schedules Support (Traffic Police)
```

### The WPACS Conflict Arbitration Framework
When separate agents suggest conflicting actions, the **Coordinator Agent** executes **WPACS** (Weighted Priority Arbitration and Constraint Satisfaction):
1.  **Contradiction Identified:** The system flags overlapping commands that cannot be executed simultaneously (e.g., de-energizing a sector grid while running smart traffic signals in the same zone).
2.  **Priority Evaluation:** SCOS checks priority weights defined in the administrative class registry:
    $$\text{Public Safety (SCOS-EMERGENCY)} = 0.98 \quad > \quad \text{Traffic Optimization (SCOS-DEPT-TRAFFIC)} = 0.72$$
3.  **Constraint Solving:** The lower-priority command is paused or adjusted.
4.  **Alternative Execution:** SCOS-EMERGENCY de-energizes the grid, while the Traffic Agent routes traffic *around* the de-energized zone, maintaining safety.

---

## 3. Human-in-the-Loop & Manual Overrides

To ensure safety and democratic accountability, SCOS enforces two human override tracks managed by the District Magistrate and department supervisors:

### Track 1: Tactical Intervention (Department Supervisor)
*   **Mechanism:** Department supervisors monitor active dispatches on their dashboards.
*   **Override Action:** Supervisors can click `OVERRIDE_TASK` at any time. This halts the agent's active plan, pauses the ticket, and allows the supervisor to manually assign crews and edit tasks.
*   **Log Record:** SCOS logs the supervisor ID, timestamp, and justification, writing the transaction to the Zero-Trust Audit Ledger (ZTSAC).

### Track 2: Strategic Lockout (District Magistrate)
*   **Mechanism:** In critical crises, the District Magistrate can declare a `STRATEGIC_LOCKOUT` on the Command Dashboard.
*   **Override Action:** This freezes the AI Orchestration layer, suspending all automatic actuation capabilities and routing all dispatches through manual verification panels.
*   **System State:** The system functions as a high-fidelity visualization board, displaying sensor feeds and maps while awaiting human approval for all actions.

---

## 4. Architectural Advantages Over Monolithic LLM Designs

Relying on a single, monolithic LLM or conversational chatbot to direct city operations introduces critical vulnerabilities. SCOS's hierarchical multi-agent architecture is superior across five major dimensions:

| Architectural Aspect | Monolithic LLM Chatbot Approach | Hierarchical Multi-Agent Approach (SCOS) |
| :--- | :--- | :--- |
| **Response Latency** | **High & Variable:** Context window saturation under raw city telemetry leads to long inference delays ($>5\text{ seconds}$). | **Low & Deterministic:** Low-level agents process streams in parallel within milliseconds; complex reasoning is localized. |
| **Tool Execution Safety** | **Unpredictable:** Monolithic models are prone to selecting incorrect parameters or executing wrong tools, which is high-risk. | **Strictly Bounded:** Each agent has access to a minimal, specialized set of tools, preventing parameter errors. |
| **Catastrophic Forgetting** | **Vulnerable:** Continuous sensor updates saturate the prompt, causing the model to forget older issues or rules. | **Bitemporal Memory Paging:** Separated memory pages and bitemporal databases preserve states indefinitely. |
| **Security & Injection Risks** | **High:** A single prompt-injection attack through a citizen complaint can compromise the entire database and all actuators. | **Compartmentalized Sandboxing:** Strict RBAC limits access. A prompt injection in the Citizen Assistant cannot breach the KESCO grid. |
| **Explainability** | **Generative Hallucinations:** The model explains decisions using text, which is prone to hallucination and hard to verify. | **Structural Graph Verifications:** The Coordinator builds **Explanation Subgraphs** from physical ontologies, providing clear audits. |

---
*This hierarchical multi-agent AI architecture specification establishes the cognitive foundation of the Smart City Operating System, ensuring that urban intelligence remains secure, explainable, legally compliant, and accountable.*
