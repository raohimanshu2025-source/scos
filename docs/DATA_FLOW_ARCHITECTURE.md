# DATA FLOW & PROCESSING ARCHITECTURE SPECIFICATION
## System: Smart City Operating System (SCOS) for Indian District Administration
### Academic Subtitle: A High-Throughput, Spatial-Temporal Ingestion Pipeline, Semantic Graph Construction, and Cognitive Feedback Loops
**Institution:** Indian Institute of Technology Kanpur (IIT Kanpur)  
**Author:** M.Tech Thesis Research Sandbox  

---

## Executive Summary

To achieve real-time, closed-loop urban computing, the **Smart City Operating System (SCOS)** implements a unified data flow architecture. This architecture transitions the district administration from batch-oriented, siloed departmental reporting to a continuous, high-velocity, and semantically unified data processing stream. 

This document specifies the complete telemetry and events pipeline, detailing the journey of urban data from diverse physical and digital producers, through multi-stage processing layers, to cognitive decision engines and citizen feedback loops.

---

## The End-to-End SCOS Data Pipeline Hierarchy

The following ASCII diagram maps the multi-stage, bi-directional lifecycle of data flowing through the SCOS system:

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ 1. DATA PRODUCERS (Sensors, CCTV, Satellites, Mobile Apps, GPS, Weather APIs, CPGRAMS)  │
└──────────────────────────────────────────┬──────────────────────────────────────────────┘
                                           │ (Protobuf, MQTT, HTTPS, JSON Streams)
                                           ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ 2. INGESTION & GATEWAY LAYER (Load Balancer, Decoupled Buffer, Event Queues)            │
└──────────────────────────────────────────┬──────────────────────────────────────────────┘
                                           │
                                           ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ 3. VALIDATION & SANITIZATION LAYER (Schema Validation, Type Checks, Spatial Bounds)    │
└──────────────────────────────────────────┬──────────────────────────────────────────────┘
                                           │
                                           ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ 4. CLEANING & DENOISING LAYER (Outlier Detection, Kalman Filtering, De-duplication)     │
└──────────────────────────────────────────┬──────────────────────────────────────────────┘
                                           │
                                           ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ 5. STORAGE & KNOWLEDGE GRAPH ENGINE (STMM Hot Cache, USFS SQL DB, Spatial Indexes)      │
└──────────────────────────────────────────┬──────────────────────────────────────────────┘
                                           │
                                           ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ 6. COGNITIVE AI PROCESSING LAYER (Gemini Multi-lingual Triage, Legal RAG, Hydrology)    │
└──────────────────────────────────────────┬──────────────────────────────────────────────┘
                                           │
                                           ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ 7. DECISION ENGINE & DISPATCH (RTS Scheduler, Coordinated Work-Orders, FSM State Engine)│
└──────────────────────────────────────────┬──────────────────────────────────────────────┘
                                           │
                                           ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ 8. VISUALIZATION & ACTUATION (UCCC Dashboard, Mobile Terminals, Streetlights, Sirens)  │
└──────────────────────────────────────────┬──────────────────────────────────────────────┘
                                           │
                                           ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ 9. CITIZEN FEEDBACK LOOP & REPORTING (Public Portals, SLA Analytics, Cryptographic ID)  │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Unified Taxonomy of Data Producers

The SCOS pipeline consumes data from twelve heterogeneous classes of producers, categorized by their velocity, variety, and structure:

1.  **Sensors (Environmental & Hydrological):** Continuous streams of water levels (Ganga Barrage), air quality metrics (AQI monitors), and sewer flow volumes (Jajmau main lines). High-velocity, low-variety, structured data (MQTT/CoAP).
2.  **CCTV & Video Analytics:** Edge-processed traffic densities, garbage heap detections, and public safety anomalies. High-bandwidth, high-velocity, semi-structured vector metadata.
3.  **Satellites (Earth Observation):** Periodic, high-resolution multi-spectral imagery (e.g., RISAT/Cartosat) used for land-use zoning classification and encroachment analysis. Low-velocity, high-volume, unstructured raster datasets.
4.  **Mobile Applications:** Real-time citizen grievance submissions, including localized coordinates and photographic uploads. Burst-velocity, multi-modal, unstructured text/image data.
5.  **Global Positioning Systems (GPS):** Automatic Vehicle Location (AVL) telemetry from municipal fleet assets (garbage loaders, desilting trucks, ambulances). High-velocity, structured stream ($x, y, \theta, t$).
6.  **Weather APIs:** External, forecasted meteorological datasets (e.g., IMD) tracking precipitation, humidity, and storm trajectories. Medium-velocity, structured JSON schemas.
7.  **Government Databases & ERPs:** Legacy relational databases of sister agencies (Jal Sansthan, KDA, KMC, KESCO) tracking property tax, electrical grids, water connections, and staff rosters. Batch-velocity, structured relational tables.
8.  **IoT Devices:** Smart municipal assets including LED streetlights, water meter gateways, and transformer tilt sensors. High-velocity, highly structured, low-payload streams.
9.  **Drones:** Aerial photogrammetry and localized thermal scans during disaster monitoring or encroachment verification. Low-frequency, ultra-high-volume spatial raster and point-cloud files.
10. **Manual Field Reports:** Digital field-diary uploads from municipal engineering crews, sanitation inspectors, and health workers. Low-velocity, semi-structured text and checklists.
11. **CPGRAMS & State Grievance Portals:** Federated state-level complaint ingestion pipelines. Low-velocity, unstructured multi-lingual text records.
12. **Social Media & Public Sentiment Feeds:** Geotagged public posts indicating localized utility failures or emergency situations. High-velocity, high-noise unstructured text streams.

---

## 2. Nine-Stage Comprehensive Processing Pipeline

SCOS structures its data flow through nine distinct execution stages:

---

### Stage 1: Data Ingestion & Gateway Ingress
*   **Purpose:** Securely capture raw data payloads from all producers, decouple the high-velocity intake from down-stream processing nodes, and prevent system-wide backpressure.
*   **Methodology:**
    *   Exposes a distributed gateway layer supporting multiple transport protocols: an **MQTT Broker** for IoT and telemetry, **gRPC** for internal microservices, and **REST APIs** for mobile and legacy connections.
    *   An ingest proxy routes raw streams into high-throughput message partitions, ensuring that heavy bursts of sensor data (e.g., during a thunderstorm) do not drop packets or delay high-priority citizen grievance events.

---

### Stage 2: Verification, Schema Validation & Ingress Control
*   **Purpose:** Filter malformed payloads, verify device identity, and enforce type-safety at the boundary.
*   **Methodology:**
    *   The Zero-Trust Security layer inspects cryptographic signatures or JWT authorization headers in the incoming request.
    *   Payload structures are validated against strict JSON and Protocol Buffer schemas.
    *   Spatial coordinates are validated to ensure they fall within the physical administrative boundaries of the district (the "Kanpur Nagar Polygon Geofence"). Values outside this range are rejected with an out-of-bounds error.

---

### Stage 3: Data Cleaning, Denoising & Filtering
*   **Purpose:** Eliminate environmental noise, handle missing fields, and prevent redundant data from consuming database writes.
*   **Methodology:**
    *   *Sensor Streams:* Applies linear interpolation and **Kalman Filtering** to smooth erratic, noisy sensor telemetries (e.g., momentary water level fluctuations).
    *   *Fleet Telemetry:* Deduplicates static coordinate reports from stationary vehicles, keeping database logs clear of idle entries.
    *   *Citizen Grievances:* Uses fuzzy-matching algorithms to group duplicate citizen reports regarding the same localized issue (e.g., multiple reports of a single tree fall on G.T. Road) into a single, parent incident thread.

---

### Stage 4: Persistent Storage & Spatial-Temporal Indexing
*   **Purpose:** Write clean data into relational and cached data layers optimized for high-performance spatial-temporal queries.
*   **Methodology:**
    *   The **Spatial-Temporal Memory Manager (STMM)** caches active telemetry (last 24 hours) in-memory using **Uber H3 Hexagonal Indexes** and spatial R-Trees.
    *   All transactional tables, core entity records, and system-wide state profiles are committed persistently to the **Unified Spatial File System (USFS)** relational database, managed via **Drizzle ORM** for schema integrity.

---

### Stage 5: Semantic Knowledge Graph Construction
*   **Purpose:** Correlate disparate physical assets, citizen reports, and administrative hierarchies into a single queryable entity graph.
*   **Methodology:**
    *   SCOS maps incoming data to a dynamic entity-relationship ontology.
    *   *Example Relationship:* Node $A$ (Citizen Sewage Outflow Grievance) is linked via a `GEOGRAPHICALLY_NEAR` relation to Node $B$ (Industrial Effluent Sensor) and Node $C$ (Sanitation Inspector Ward Registry).
    *   The graph allows cross-agency inference queries (e.g., "Find all water contamination sensors near schools reporting sudden attendance drops").

---

### Stage 6: Cognitive AI Processing
*   **Purpose:** Perform intelligent parsing, multilingual translation, compliance audits, and predictive modelling.
*   **Methodology:**
    *   *CPGRAMS Pipeline:* Unstructured, multilingual citizen complaints (Hinglish/Hindi) are sent to the **Gemini API (@google/genai)** to extract the core category, estimate severity, and draft administrative routing metadata.
    *   *Legal RAG Audit:* The extracted dispatch is checked against administrative regulation databases (e.g., *UP Municipal Act*) using Retrieval-Augmented Generation (RAG) to verify legal compliance.
    *   *Hydrologic Forecaster:* Predicts river basin heights 24 to 48 hours in advance using state-space forecasting models on upstream telemetry.

---

### Stage 7: Decision Engine, Resource Scheduling & Actuation Dispatch
*   **Purpose:** Algorithmically optimize and coordinate municipal resources to resolve active urban issues.
*   **Methodology:**
    *   The **Resource & Task Scheduler (RTS)** matches open, prioritized tasks with the nearest available personnel, vehicles, and tools.
    *   **CAPWO** executes the corresponding municipal state machine (FSM), triggering automated actions (e.g., sending vacuum truck dispatches to field operators).
    *   If no manual approval is required, SCOS initiates direct down-link commands to actuators (e.g., dims smart streetlights to save power or trips a damaged transformer breaker).

---

### Stage 8: Real-Time Visualization & Command Interface
*   **Purpose:** Provide human administrators and operators with situational awareness and direct command controls.
*   **Methodology:**
    *   Serves live web socket streams of active events, GIS sensor overlays, and telemetry trends to the Integrated Command Center (UCCC) visual dashboard.
    *   Pushes localized task assignments and geo-routing directions directly to the field engineers' mobile application interfaces.

---

### Stage 9: Citizen Feedback Loop & Audit Verification
*   **Purpose:** Complete the closed-loop governance cycle, ensuring transparency, verification, and accountability.
*   **Methodology:**
    *   When a field engineer reports a task as RESOLVED, SCOS auto-generates an SMS notification to the reporting citizen.
    *   The citizen is provided with a unique cryptographic tracking ID to view the full resolution history, complete with before/after photos and inspector signatures.
    *   The citizen's rating (1 to 5 stars) is logged. Low ratings trigger an automatic feedback loop, escalating the ticket back to a senior supervisor for manual audit.

---

## 3. Data Quality Challenges & Engineering Solutions

Operating inside a brownfield Indian municipal infrastructure presents severe data quality challenges. SCOS mitigates these risks using specialized systems-engineering techniques:

### Challenge 1: The "Hinglish/Multilingual Noise" Problem
*   *The Problem:* Citizens submit grievances in localized dialects or mixed Hinglish ("*naala saaf kara do, paani road par aa gaya hai*"). Standard, English-trained keyword parsers misclassify these, resulting in misrouted tickets.
*   *SCOS Engineering Solution:* SCOS uses the **Gemini API** for multi-lingual zero-shot classification. It is prompted to ignore grammatical errors, translate colloquial expressions, and extract the core underlying intent, mapping the text to the precise municipal department with $>92\%$ accuracy.

### Challenge 2: Erratic, Spoofed, or Compromised Sensor Telemetries
*   *The Problem:* Physically compromised edge sensors can send corrupt data, or malicious actors can spoof environmental telemetry to trigger false alarms.
*   *SCOS Engineering Solution:*
    *   *Spatial Consensus Verification:* SCOS correlates a single sensor's high-severity report against adjacent sibling nodes (e.g., validating a rapid pH drop report at a sewer node by checking reading trends at adjacent upstream/downstream sensors).
    *   *Cryptographic Integrity:* Sensor streams are signed at the edge using lightweight hardware keys, and authenticated at the boundary via the **Zero-Trust Security Layer (ZTSAC)**.

### Challenge 3: Inconsistent GIS Layer Standards
*   *The Problem:* Legacy municipal maps are maintained in different coordinate systems, scale formats, or outdated paper registers, leading to geometric errors in spatial queries.
*   *SCOS Engineering Solution:* The **Unified Spatial File System (USFS)** normalizes all spatial vectors into the standardized WGS 84 (EPSG:4326) coordinate reference system. Outline boundaries are transformed into a hierarchical hexagonal grid system (Uber H3), enabling standard spatial queries across all departments.

### Challenge 4: High-Velocity Packet Drops (Network Instability)
*   *The Problem:* During monsoon storms, cellular and fiber connections can drop or brownout, cutting off live telemetry feeds.
*   *SCOS Engineering Solution:* SCOS utilizes the **IDFNS Network Stack**, which commands edge gateways to enter a local buffer state during network outages, caching readings on local storage and re-transmitting compressed telemetry batches once connectivity is restored.

---
*This data flow specification defines the standard pipeline for processing raw municipal signals into actionable, secure, and transparent urban governance operations.*
