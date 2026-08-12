# DOMAIN-DRIVEN DESIGN (DDD) BOUNDED CONTEXTS & DOMAIN MODELS
## System: Smart City Operating System (SCOS) for Indian District Administration
### Academic Subtitle: Tactical Domain Models, Ubiquitous Language, Aggregate Roots, and Context Mapping for Federated Urban Middleware
**Institution:** Indian Institute of Technology Kanpur (IIT Kanpur)  
**Author:** M.Tech Thesis Research Sandbox  

---

## Executive Summary

To translate the high-level architecture of the **Smart City Operating System (SCOS)** into a concrete, implementable software design, we apply the principles of **Domain-Driven Design (DDD)**. 

Traditional municipal IT architectures fail because they use a single, shared, monolithic database schema to model concepts that have entirely different meanings to different departments. For example, a "Road" is a transport corridor to the Traffic Police, a structural paving asset to the Kanpur Municipal Corporation (KMC), a path for water lines to the Jal Sansthan, and a vector of commercial properties to the Revenue department. Attempting to force these diverse definitions into a single, unified database schema leads to severe system complexity and database lockups.

By breaking SCOS into distinct **Bounded Contexts**, we establish clear, decoupled boundaries where each department's language, models, and rules remain isolated. This document details the strategic domain boundaries, tactical domain models, and the comprehensive SCOS Context Map.

---

## The SCOS Bounded Context Map

The following ASCII Context Map illustrates the relationship and integration patterns (e.g., Customer-Supplier, Shared Kernel, Conformist, Open Host Service/Published Language) between the SCOS bounded contexts:

```
                  ┌─────────────────────────────────────────────────────────┐
                  │              CITIZEN ENGAGEMENT CONTEXT                 │
                  └─────────┬─────────────────────────────────────▲─────────┘
                            │ [Upstream / Customer]               │ [Downstream / Supplier]
                            ▼                                     │
┌─────────────────────────────────────────────────────────────────┴─────────┐
│                       SCOS KERNEL EVENT BUS (Shared Kernel)               │
└─────────────────────────────────┬─────────────────────────────────▲───────┘
                            ▲     │                                 │
     [Customer / Downstream]│     │ [Upstream / Supplier]           │ [Downstream / Customer]
                            │     ▼                                 │
┌───────────────────────────┴─────────────────────────────┐         │
│                 COGNITIVE AI ORCHESTRATION CONTEXT       ├─────────┘
│                 (OHS/PL: Open Host / Published Lang)    │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼ [Upstream / Supplier]
┌───────────────────────────────────────────────────────────────────────────┐
│               FEDERATED DISTRICT DEPARTMENTS SERVICE CORE                 │
├───────────────────────────┬─────────────────────────────┬─────────────────┤
│ 1. Jal Sansthan (Water)   │ 2. KESCO (Electricity)      │ 3. Police Core  │
├───────────────────────────┼─────────────────────────────┼─────────────────┤
│ 4. CMO (Health Core)      │ 5. KDA (Urban Planning)     │ 6. KMC (Admin)  │
├───────────────────────────┼─────────────────────────────┼─────────────────┤
│ 7. Revenue & Property     │ 8. Disaster Management      │ 9. Agriculture  │
└───────────────────────────┴─────────────────────────────┴─────────────────┘
```

---

## 1. Domain-by-Domain Tactical Specifications

---

### Bounded Context 1: Citizen Engagement Context

*   **Responsibilities:** 
    *   Ingest, manage, and track citizen complaints and feedback workflows.
    *   Expose localized mobile and web portals supporting multi-lingual entry.
    *   Maintain citizen profiles and verification states (Aadhaar validation).
*   **Aggregate Roots:** 
    *   `Grievance`: Tracks the lifecycle of a single citizen-submitted complaint.
*   **Entities:** 
    *   `CitizenProfile`: Contains credentials, verification levels, and notification preferences.
    *   `FeedbackLoop`: Captures post-resolution feedback ratings and textual reviews.
*   **Value Objects:** 
    *   `GrievanceId` (UUID)
    *   `GeographicPoint` (Latitude, Longitude, Altitude)
    *   `Attachment` (Photo URL, MIME type, cryptographic hash)
    *   `GrievanceCategory` (Enum: SEWER_OVERFLOW, ROAD_CAVE_IN, WATER_LINE_LEAK, etc.)
    *   `WorkflowStatus` (Enum: RECEIVED, TRIAGED, IN_PROGRESS, ESCALATED, RESOLVED)
*   **Domain Events:** 
    *   `GrievanceSubmittedEvent`: Emitted when a citizen registers a new complaint.
    *   `GrievanceStatusUpdatedEvent`: Emitted when a caseworker or system action changes the ticket state.
    *   `FeedbackRegisteredEvent`: Emitted when a citizen rates the resolution quality.
*   **Repositories:** 
    *   `GrievanceRepository`: Handles persistence, range queries, and spatial-bound fetches of active tickets.
    *   `CitizenProfileRepository`: Manages user credentials and verification states.
*   **Services:** 
    *   `GrievanceTriageService`: Coordinates with the AI Context to classify raw, unstructured citizen inputs.
    *   `CitizenVerificationService`: Validates user identities against federated state registries.
*   **APIs (Inbound/Outbound):**
    *   `POST /api/v1/grievances`: Accepts new multi-modal grievance payloads.
    *   `GET /api/v1/grievances/{id}/track`: Exposes chronological, tamper-evident case progress trails.
*   **External Dependencies:** 
    *   Federated Identity Registry (Aadhaar OAuth Gateway).
    *   External SMS/WhatsApp Delivery Gateways.

---

### Bounded Context 2: Cognitive AI Orchestration Context

*   **Responsibilities:** 
    *   Execute multi-lingual translation, classification, and metadata extraction.
    *   Perform Retrieval-Augmented Generation (RAG) to verify legal compliance.
    *   Arbitrate logical conflicts between departmental recommendations (WPACS).
*   **Aggregate Roots:** 
    *   `CognitiveReasoningSession`: Tracks the state of active AI inference runs and context logs.
*   **Entities:** 
    *   `AgentProfile`: Configuration, system prompts, temperature, and tool allocations for specialized sub-agents.
    *   `ConflictStandoff`: Models contradictory action recommendations requiring arbitration.
*   **Value Objects:** 
    *   `SessionId` (UUID)
    *   `ClassificationVector`: Mapping probabilities across 15 municipal departments.
    *   `LegalReference`: Legislative document section and paragraph identifier (e.g., *UP Municipal Corporation Act §124*).
    *   `PriorityWeight` (Float value between 0.00 and 1.00)
*   **Domain Events:** 
    *   `TriageCompletedEvent`: Emitted when raw complaint text is successfully structured and categorized.
    *   `ConflictDetectedEvent`: Emitted when two agents submit contradictory recommendations.
    *   `ArbitrationResolvedEvent`: Emitted when the Coordinator Agent settles a conflict with an audited decision.
*   **Repositories:** 
    *   `ReasoningSessionRepository`: Persists AI execution trails and token resource audits.
    *   `AgentProfileRepository`: Stores configuration states for active AI agents.
*   **Services:** 
    *   `GeminiInferenceService`: Interacts with the **Google GenAI SDK** using optimal prompts and parameters.
    *   `WPACSAntagonistSolver`: Executes weighted priority arbitration algorithms to resolve contradictory dispatches.
*   **APIs (Inbound/Outbound):**
    *   `POST /api/v1/cognitive/triage`: Accepts unstructured text; returns classified, prioritized department dispatches.
    *   `POST /api/v1/cognitive/arbitrate`: Takes conflicting commands; outputs resolved operational actions.
*   **External Dependencies:** 
    *   Google Gemini API Gateway (`@google/genai` TypeScript SDK).

---

### Bounded Context 3: Jal Sansthan (Water & Sanitation) Context

*   **Responsibilities:** 
    *   Monitor clean water distribution, sewer networks, and Wastewater Treatment Plants.
    *   Coordinate sewer-desilting crews, fleet operations, and maintenance dispatches.
*   **Aggregate Roots:** 
    *   `WaterSupplyZone`: Represents a geographic sector's water infrastructure and pressure metrics.
    *   `SewerSewerageGrid`: Represents sewer lines, main junctions, and wastewater flow indicators.
*   **Entities:** 
    *   `WaterPumpStation`: Models physical water pumps, valves, and flow meters.
    *   `SanitationVehicle`: Models desilting and vacuum trucks equipped with GPS tracking.
*   **Value Objects:** 
    *   `ZoneId` (String code, e.g., "JS-ZN-KALYANPUR")
    *   `WaterMetric`: Turbidity (NTU), pH, chemical contaminant levels (mg/L), and pressure (PSI).
    *   `FleetCoordinates` ($x, y, t, \text{heading}$)
*   **Domain Events:** 
    *   `WaterContaminationAlarmTriggered`: Emitted when water sensors exceed turbidity or toxic limits.
    *   `SewerOverflowDetected`: Emitted when line sensors report a complete flow blockage.
    *   `VehicleDispatchedEvent`: Emitted when a maintenance truck is deployed to a site.
*   **Repositories:** 
    *   `WaterSupplyZoneRepository`: Manages spatial representations of water zones and sensor states.
    *   `FleetRepository`: Tracks real-time positions and statuses of desilting vehicles.
*   **Services:** 
    *   `HydraulicLoadBalancer`: Algorithmically adjusts reservoir outputs during supply bottlenecks.
    *   `WastewaterIsolationService`: Coordinates valve shutdowns during industrial chemical ingress.
*   **APIs (Inbound/Outbound):**
    *   `POST /api/v1/water/valves/{id}/state`: Commands remote valve status changes.
    *   `GET /api/v1/water/sensors/turbidity`: Streams live water quality indices to the SCOS Kernel.
*   **External Dependencies:** 
    *   Proprietary PLC/SCADA industrial gateways.

---

### Bounded Context 4: KESCO (Electricity Distribution) Context

*   **Responsibilities:** 
    *   Monitor 33KV and 11KV substations, distribution transformers, and line safety.
    *   Coordinate line de-energizations (trips) during structural storm damages.
*   **Aggregate Roots:** 
    *   `FeederGridCircuit`: Models the structural layout and load parameters of high-voltage transmission lines.
*   **Entities:** 
    *   `SubstationTransformer`: Models transformers, checking oil temperatures, tilt parameters, and voltages.
    *   `RepairCrew`: Models high-voltage field technicians on shift.
*   **Value Objects:** 
    *   `CircuitId` (String code, e.g., "KESCO-FD-KALYANPUR-1")
    *   `PowerMetric`: Voltage (KV), Current (Amps), Power Factor, and Harmonic Distortion.
*   **Domain Events:** 
    *   `CircuitBreakerTrippedEvent`: Emitted when a feeder circuit goes offline.
    *   `TransformerFaultDetectedEvent`: Emitted when tilt or temperature sensors report anomalous metrics.
    *   `LineRestorationInitiatedEvent`: Emitted when crews begin repairs on a downed line.
*   **Repositories:** 
    *   `CircuitRepository`: Tracks active circuit states and spatial corridors.
    *   `TransformerRepository`: Stores telemetry records and maintenance histories.
*   **Services:** 
    *   `GridSafetyInterlockingService`: Dynamically handles de-energization tasks during high-wind alerts.
    *   `SubstationLoadOptimizer`: Re-routes grid lines during local power shortages.
*   **APIs (Inbound/Outbound):**
    *   `POST /api/v1/kesco/breaker/{id}/trip`: Commands remote breaker tripping.
    *   `GET /api/v1/kesco/transformer/{id}/metrics`: Delivers live telemetry to the SCOS Memory cache.
*   **External Dependencies:** 
    *   KESCO Substation SCADA Control Center APIs.

---

### Bounded Context 5: Police & Traffic Core Context

*   **Responsibilities:** 
    *   Manage accident records, incident tracking, and smart street signal phases.
    *   Coordinate emergency traffic corridors (green lanes) for ambulances.
*   **Aggregate Roots:** 
    *   `TrafficSignalCorridor`: Represents a synchronized chain of smart signal lights along an arterial road.
*   **Entities:** 
    *   `IncidentReport`: Models traffic accidents, road blockages, and active protest zones.
    *   `TrafficSignalController`: Models individual signal hardware and phase configurations.
*   **Value Objects:** 
    *   `CorridorId` (String code, e.g., "GT-ROAD-CORRIDOR")
    *   `PhaseDuration`: Green-light, red-light, and yellow-light cycles in seconds.
    *   `CongestionIndex`: Categorized traffic speed metrics (Enum: CLEAR, MODERATE, CRITICAL).
*   **Domain Events:** 
    *   `TrafficAccidentLoggedEvent`: Emitted when an accident is registered on an arterial route.
    *   `SignalPhaseModifiedEvent`: Emitted when signal timings are changed by SCOS algorithms or manual overrides.
    *   `GreenCorridorActivatedEvent`: Emitted when a priority ambulance lane is established.
*   **Repositories:** 
    *   `CorridorRepository`: Manages spatial signal mappings and coordination rules.
    *   `IncidentRepository`: Stores active accident records and historical flow data.
*   **Services:** 
    *   `GreenCorridorOrchestrator`: Dynamically syncs downstream traffic signals to facilitate emergency vehicle transit.
    *   `ArterialCongestionAnalyzer`: Detects traffic bottlenecks using camera feed metadata.
*   **APIs (Inbound/Outbound):**
    *   `POST /api/v1/traffic/corridor/{id}/greencorridor`: Activates pre-emptive green signal phases.
    *   `POST /api/v1/traffic/signals/{id}/phases`: Modifies active signal timings.
*   **External Dependencies:** 
    *   CCTV Video Analytics Edge Gateway APIs.

---

### Bounded Context 6: CMO (Public Health) Context

*   **Responsibilities:** 
    *   Monitor regional health metrics, coordinate primary clinics, and track disease outbreak indicators.
    *   Allocate emergency hospital beds, testing kits, and medicine inventories.
*   **Aggregate Roots:** 
    *   `EpidemiologicalMonitor`: Represents health indicator trends across the district's wards.
*   **Entities:** 
    *   `PrimaryHealthCenter`: Models local clinics, medical staff, and medical supplies.
    *   `HospitalBedRegistry`: Models active emergency bed counts and critical care availabilities.
*   **Value Objects:** 
    *   `InfectionCluster`: Mapped coordinates of concentrated waterborne or flu-like symptoms.
    *   `InventoryLog`: Quantities of vaccines, chlorine tablets, and diagnostic testing kits.
*   **Domain Events:** 
    *   `OutbreakClusterFlaggedEvent`: Emitted when an anomalous concentration of infection cases is identified in a ward.
    *   `BedShortageWarningTriggered`: Emitted when emergency hospital capacities fall below 10%.
*   **Repositories:** 
    *   `PHCRepository`: Manages clinic records, supplies, and regional staff rosters.
    *   `EpidemiologicalRepository`: Stores historical patient statistics and disease models.
*   **Services:** 
    *   `EpidemiologicalTracer`: Correlates student absences with water-contamination coordinates.
    *   `MedicalResourceDispatcher`: Schedules emergency vaccine deliveries to high-risk clinics.
*   **APIs (Inbound/Outbound):**
    *   `POST /api/v1/health/screenings/schedule`: Dispatches mobile medical screening vans.
    *   `GET /api/v1/health/bed-registry`: Delivers aggregated emergency hospital capacities to SCOS.
*   **External Dependencies:** 
    *   Unified Integrated Disease Surveillance Programme (IDSP) Database.

---

### Bounded Context 7: Urban Planning & KDA Context

*   **Responsibilities:** 
    *   Track land zoning, structural footprint deviations, and Master Plan compliance.
    *   Manage property tax registrations, GIS boundaries, and construction permits.
*   **Aggregate Roots:** 
    *   `GISParcel`: Represents a registered property land plot, including geographic boundary polygons.
*   **Entities:** 
    *   `PropertyRecord`: Models construction permissions, permit filings, and tax clearance statuses.
    *   `ZoningGuideline`: Models spatial development constraints and maximum-height limits.
*   **Value Objects:** 
    *   `ParcelId` (String code, e.g., "KDA-PR-SWAROOP-104")
    *   `BoundaryPolygon`: Array of GPS coordinates enclosing the land plot.
    *   `ZoningClass` (Enum: RESIDENTIAL, COMMERCIAL, INDUSTRIAL, GREEN_BELT)
*   **Domain Events:** 
    *   `PropertyDeviationDetectedEvent`: Emitted when satellite imagery indicates a structural footprint violation.
    *   `ZoningComplianceAlertIssued`: Emitted when a construction project violates zoning codes.
*   **Repositories:** 
    *   `ParcelRepository`: Manages spatial parcel boundaries and geometric queries.
    *   `PropertyRecordRepository`: Stores construction permits and tax clearances.
*   **Services:** 
    *   `FootprintDifferentialAnalyzer`: Computes differences between historical and active satellite maps to identify illegal expansions.
    *   `ZoningValidatorService`: Audits building designs against the District Master Plan.
*   **APIs (Inbound/Outbound):**
    *   `POST /api/v1/planning/parcels/audit`: Initiates property shape comparisons.
    *   `PATCH /api/v1/planning/properties/{id}/flag`: Suspends property accounts for non-compliance.
*   **External Dependencies:** 
    *   ISRO Cartosat Satellite Imagery Gateway.

---

## 2. Bounded Context Integration & Communication

To prevent tight database coupling, Bounded Contexts communicate strictly via three architectural patterns:

1.  **Asynchronous Message Broker (Shared Event Bus):** 
    Contexts publish high-priority **Domain Events** (e.g., `WaterContaminationAlarmTriggered`) onto the SCOS Kernel Event Bus. Downstream contexts subscribe to these events asynchronously, executing local workflows without locking upstream databases.
2.  **Open Host Service / Published Language (OHS/PL):** 
    The **Cognitive AI Orchestration Context** acts as an Open Host Service. It exposes standardized APIs with a published language (e.g., standardized JSON schemas for triage outputs), allowing the Citizen Engagement and Department contexts to interact with AI models easily.
3.  **Customer-Supplier / Conformist Relationship:** 
    Municipal departments (e.g., Jal Sansthan, KESCO) act as suppliers to the **Disaster Management Context** (Customer). When Disaster Management requests resources, the departments must conform to the standard data contracts defined by the SCOS core.

---
*This Domain-Driven Design specification establishes the software-engineering blueprint for SCOS, translating complex urban operations into clean, decoupled, and implementable microservice boundaries.*
