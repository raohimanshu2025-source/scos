# EVENT-DRIVEN ARCHITECTURE SPECIFICATION
## System: Smart City Operating System (SCOS) for Indian District Administration
### Academic Subtitle: A High-Throughput Event-Driven Broker Core, Spatial-Temporal Schema Enforcements, and Idempotency Substrates
**Institution:** Indian Institute of Technology Kanpur (IIT Kanpur)  
**Author:** M.Tech Thesis Research Sandbox  

---

## Executive Summary

To operate effectively at city scale, the **Smart City Operating System (SCOS)** must process thousands of heterogeneous signals per second. Traditional request-response (REST/gRPC) architectures fall short in this environment; they introduce tight coupling, synchronous blocking, cascading failures, and severe database lockups during high-volume crises (e.g., monsoonal storms).

To eliminate these constraints, SCOS implements an asynchronous, decoupled, and partition-scalable **Event-Driven Architecture (EDA)**. Under this design, any physical or digital occurrence—from a citizen's complaint to a high-voltage circuit trip—is captured as an immutable, structured **Domain Event**. These events are processed through a distributed event broker (Apache Kafka) that handles routing, schema validation, and logging.

This document identifies the core SCOS events, defines their structured schemas, specifies the event bus topology and lifecycle, and details why an event-driven core is superior to request-response models for urban governance.

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                           SCOS HIGH-VELOCITY EVEN HUB (KAFKA)                           │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│   [ Event Producers ]              [ Event Bus Channels / Topics ]   [ Event Consumers ]│
│                                                                                         │
│   ┌─────────────────┐              ┌───────────────────────────┐     ┌────────────────┐ │
│   │ Citizen Griev.  ├─────────────►│ Topic: citizen-grievances ├────►│ Citizen Agent  │ │
│   └─────────────────┘              └───────────────────────────┘     └────────────────┘ │
│                                                                                         │
│   ┌─────────────────┐              ┌───────────────────────────┐     ┌────────────────┐ │
│   │ River Gauges    ├─────────────►│ Topic: water-telemetry    ├────►│ Env. Agent     │ │
│   └─────────────────┘              └───────────────────────────┘     └────────────────┘ │
│                                                                                         │
│   ┌─────────────────┐              ┌───────────────────────────┐     ┌────────────────┐ │
│   │ Police Incident ├─────────────►│ Topic: police-incidents   ├────►│ Traffic Agent  │ │
│   └─────────────────┘              └───────────────────────────┘     └────────────────┘ │
│                                                                                         │
│   ┌─────────────────┐              ┌───────────────────────────┐     ┌────────────────┐ │
│   │ Power Sensors   ├─────────────►│ Topic: electrical-grid    ├────►│ Emergency Agt. │ │
│   └─────────────────┘              └───────────────────────────┘     └────────────────┘ │
│                                                                                         │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                        DISTRIBUTED ZOOKEEPER & KAFKA CONTROLLERS                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Catalog of Critical SCOS Domain Events

---

### Event 1: Citizen Complaint Submitted (`CitizenComplaintSubmitted`)

*   **Producer:** `SCOS-CITIZEN` (Citizen Engagement Microservice via Mobile/Web Portals).
*   **Consumers:** `SCOS-COGNITIVE` (Triage Engine), `SCOS-ZTSAC` (Audit Logger).
*   **Payload (JSON Schema):**
    ```json
    {
      "eventId": "e910c283-0421-4f9a-88cb-ffbd7da32104",
      "eventType": "CitizenComplaintSubmitted",
      "timestamp": "2026-07-13T11:35:00Z",
      "producer": "scos-citizen-service",
      "priority": "MEDIUM",
      "data": {
        "complaintId": "comp-77291",
        "citizenId": "cit-882194",
        "rawText": "Kalyanpur bypass ke paas naala jam hai, paani sadak par beh raha hai.",
        "languageCode": "hi-HN",
        "coordinates": {
          "latitude": 26.4942,
          "longitude": 80.2573
        },
        "attachments": [
          {
            "type": "IMAGE",
            "url": "https://storage.scos.gov.in/complaints/img_77291.jpg",
            "sha256": "8f3c71...5a8"
          }
        ]
      }
    }
    ```
*   **Priority:** **MEDIUM** (Escalated dynamically based on AI evaluation).
*   **AI Agent Involvement:** **Citizen Agent** translates Hinglish dialects into structured English, and **Cognitive Agent** categorizes the issue as `SEWAGE_OVERFLOW` and flags high priorities if near hospital coordinates.
*   **Workflow Triggered:** Starts the `CPGRAMS_Grievance_Triage` state machine, prompting department dispatchers and validating location coordinates.
*   **Audit Requirements:** The payload hash, citizen ID, and timestamp are written to the append-only ledger managed by the Zero-Trust Security layer (ZTSAC).

---

### Event 2: Water Pipeline Leak Detected (`WaterPipelineLeakDetected`)

*   **Producer:** `SCOS-DSAL` (Wastewater and SCADA Flow Meter Gateways).
*   **Consumers:** `SCOS-WATER` (Jal Sansthan Connector), `SCOS-TWIN` (GIS Mapper), `SCOS-SCHEDULER` (Resource Dispatcher).
*   **Payload (JSON Schema):**
    ```json
    {
      "eventId": "f128d904-7123-4b92-99ca-cc372a912199",
      "eventType": "WaterPipelineLeakDetected",
      "timestamp": "2026-07-13T11:35:02Z",
      "producer": "scos-dsal-gateway",
      "priority": "HIGH",
      "data": {
        "sensorId": "flow-sensor-kp-44",
        "pipeSegmentId": "pipe-kalyanpur-main-08",
        "flowRateIn": 112.4,
        "flowRateOut": 84.1,
        "lossPercentage": 25.17,
        "coordinates": {
          "latitude": 26.4950,
          "longitude": 80.2580
        }
      }
    }
    ```
*   **Priority:** **HIGH** (Severe resource loss risk).
*   **AI Agent Involvement:** **Environment Agent** evaluates pollution indicators near the leak coordinates to identify contamination risks.
*   **Workflow Triggered:** Starts the `Water_Line_Isolation_Workflow`, commanding valves adjacent to the segment to close and alerting maintenance dispatchers.
*   **Audit Requirements:** Records telemetry inputs, valve statuses, and pipeline identifiers to log pressure maintenance records.

---

### Event 3: Road Accident Reported (`RoadAccidentReported`)

*   **Producer:** `SCOS-POLICE` (Police Incident Dispatch Logs / CCTV Video Analytics).
*   **Consumers:** `SCOS-TWIN` (GIS Mapper), `SCOS-TRAFFIC` (Signal Controllers), `SCOS-SCHEDULER` (Dispatch Optimizer).
*   **Payload (JSON Schema):**
    ```json
    {
      "eventId": "a749c122-8394-4c81-aa12-ff5c1a892b11",
      "eventType": "RoadAccidentReported",
      "timestamp": "2026-07-13T11:35:05Z",
      "producer": "scos-police-connector",
      "priority": "HIGH",
      "data": {
        "incidentId": "incident-pol-992",
        "severityIndex": "CRITICAL",
        "laneBlockageCount": 2,
        "vehiclesInvolved": ["BUS", "CAR"],
        "coordinates": {
          "latitude": 26.5012,
          "longitude": 80.2641
        }
      }
    }
    ```
*   **Priority:** **HIGH** (Risk of total corridor blockage and casualty delays).
*   **AI Agent Involvement:** **Traffic Agent** analyzes arterial camera streams to calculate downstream gridlocks, formulating signal-timing offsets for alternative routes.
*   **Workflow Triggered:** Executes the `Corridor_Incident_Clearing_Workflow`, deploying tow cranes, and alerting emergency responders.
*   **Audit Requirements:** Logs dispatcher IDs, accident coordinates, and tow dispatch times to maintain operational safety trails.

---

### Event 4: AQI Exceeds Threshold (`AQIExceedsThreshold`)

*   **Producer:** `SCOS-DSAL` (Municipal Air Quality Monitors).
*   **Consumers:** `SCOS-HEALTH` (CMO Connector), `SCOS-ENVIRONMENT` (Pollution Monitor).
*   **Payload (JSON Schema):**
    ```json
    {
      "eventId": "b881a293-4122-4a01-9988-cb12da091104",
      "eventType": "AQIExceedsThreshold",
      "timestamp": "2026-07-13T11:35:10Z",
      "producer": "scos-dsal-gateway",
      "priority": "MEDIUM",
      "data": {
        "stationId": "aqi-station-dada-nagar",
        "zone": "Industrial Zone 2",
        "aqiValue": 342,
        "pm2_5": 184.2,
        "pm10": 294.1,
        "coordinates": {
          "latitude": 26.4421,
          "longitude": 80.3122
        }
      }
    }
    ```
*   **Priority:** **MEDIUM** (Sustained exposure hazard).
*   **AI Agent Involvement:** **Environment Agent** correlates the spike with factory registries, checking emission permits and flagging potential violators.
*   **Workflow Triggered:** Launches the `AQI_Mitigation_Protocol`, adjusting industrial work patterns and issuing warning alerts.
*   **Audit Requirements:** Records the raw metrics, device calibration logs, and subsequent industrial inspections.

---

### Event 5: Hospital Occupancy Reaches Limit (`HospitalOccupancyLimitReached`)

*   **Producer:** `SCOS-HEALTH` (CMO Clinic bed capacity trackers).
*   **Consumers:** `SCOS-SCHEDULER` (Ambulance router), `SCOS-ZTSAC` (Identity and access auditor).
*   **Payload (JSON Schema):**
    ```json
    {
      "eventId": "c712d911-3944-4211-99ee-ab7c92a10104",
      "eventType": "HospitalOccupancyLimitReached",
      "timestamp": "2026-07-13T11:35:15Z",
      "producer": "scos-health-connector",
      "priority": "HIGH",
      "data": {
        "hospitalId": "hosp-hallet-kanpur",
        "capacityType": "ICU",
        "totalBeds": 120,
        "occupiedBeds": 118,
        "occupancyPercentage": 98.33,
        "coordinates": {
          "latitude": 26.4811,
          "longitude": 80.2942
        }
      }
    }
    ```
*   **Priority:** **HIGH** (Zero emergency-room buffer).
*   **AI Agent Involvement:** **Health Agent** evaluates nearby clinic capacities, re-allocating incoming patient dispatches to alternative facilities.
*   **Workflow Triggered:** Executes the `Bed_Capacity_Rebalancing_Protocol`, alerting CMO supervisors and shifting ambulance routes.
*   **Audit Requirements:** Records bed capacity changes, dispatcher decisions, and transfer records.

---

### Event 6: Rainfall Warning Issued (`RainfallWarningIssued`)

*   **Producer:** `SCOS-WEATHER` (IMD Meteorological Feeds).
*   **Consumers:** `SCOS-DISASTER` (Disaster Management Service), `SCOS-WATER` (Sewer grid operations).
*   **Payload (JSON Schema):**
    ```json
    {
      "eventId": "d192c304-4421-4b11-99dd-ab12d9041201",
      "eventType": "RainfallWarningIssued",
      "timestamp": "2026-07-13T11:35:20Z",
      "producer": "scos-weather-connector",
      "priority": "HIGH",
      "data": {
        "warningCode": "RED_ALERT",
        "expectedRainfallMmPerHour": 45.2,
        "durationInHours": 6,
        "effectiveRadiusKm": 15.0,
        "coordinates": {
          "latitude": 26.4900,
          "longitude": 80.3000
        }
      }
    }
    ```
*   **Priority:** **HIGH** (Severe flooding risk).
*   **AI Agent Involvement:** **Predictive Analytics Agent** runs runoff simulations to forecast which low-lying municipal sectors will face severe waterlogging.
*   **Workflow Triggered:** Initiates the `District_Flood_Mitigation_State_Machine`, warning low-lying wards, positioning rescue teams, and clearing drainage routes.
*   **Audit Requirements:** Records weather parameters, forecast accuracy rates, and administrative dispatch times.

---

### Event 7: Power Outage Detected (`PowerOutageDetected`)

*   **Producer:** `SCOS-POWER` (KESCO Feeder Grid Telemetry).
*   **Consumers:** `SCOS-DISASTER` (Disaster Management), `SCOS-HEALTH` (PHC emergency backups), `SCOS-TWIN` (GIS map).
*   **Payload (JSON Schema):**
    ```json
    {
      "eventId": "f771a201-9942-4f11-bb12-aa88cd901204",
      "eventType": "PowerOutageDetected",
      "timestamp": "2026-07-13T11:35:25Z",
      "producer": "scos-kesco-connector",
      "priority": "CRITICAL",
      "data": {
        "substationId": "sub-kalyanpur-3",
        "feederLineId": "feeder-33kv-line-4",
        "voltageAtTrip": 0.0,
        "affectedCustomers": 45000,
        "coordinates": {
          "latitude": 26.4912,
          "longitude": 80.2514
        }
      }
    }
    ```
*   **Priority:** **CRITICAL** (Grid line failure).
*   **AI Agent Involvement:** **Emergency Agent** checks nearby hospitals, verifying that backup power systems are active.
*   **Workflow Triggered:** Executes the `Grid_Failure_Safety_Protocol`, shifting secondary lines to balance loads and deploying emergency repair crews.
*   **Audit Requirements:** Logs breaker trip logs, de-energization duration, and crew response metrics.

---

## 2. Event Bus Core & Lifecycle Infrastructure

SCOS implements an enterprise-grade, high-throughput event processing core designed around **Apache Kafka**:

---

### Event Lifecycle Pipeline

```
[ Producer ] ──► (Schema Validation) ──► [ Kafka Topic Partition ] ──► [ Consumer Group ] ──► (Process & Commit)
                                                                             │
                                                                             ▼ (On Fatal Error after retries)
                                                                       [ Kafka DLQ Topic ]
```

1.  **Declaration:** A microservice generates a domain event and attempts to publish it to the Kafka bus.
2.  **Schema Enforcement:** The event passes through an **Apicurio Schema Registry** to guarantee compatibility. Payloads that do not conform to defined schemas are rejected.
3.  **Partition Routing:** The event is written to specific Kafka topic partitions (e.g., partitioned by Uber H3 geographic hex cell index), preserving strict chronological event orders inside each region.
4.  **Consuming:** Consumer groups pull events from partitions, updating their local states. Once processing succeeds, the partition offset is committed.

---

### Retry, Failure & Dead-Letter Queue (DLQ) Strategy

*   **Standard Retries:** On consumer failure (e.g., temporary database unreachable), SCOS retries processing using an **Exponential Backoff** loop with jitter:
    $$T_{\text{retry}} = T_{\text{base}} \times 2^{\text{attempt}} \pm \text{Random Jitter}$$
*   **Retry Topics:** Events are shifted to a specialized retry topic (e.g., `water-leak-retry-1`) to avoid blocking primary event pipelines.
*   **Dead-Letter Queue (DLQ):** If a consumer fails to process an event after 5 retry attempts, the event is shifted to the Dead-Letter Queue topic (`scos-dlq-corrupt-events`). The DLQ triggers an administrative notification on the system dashboard for developer audit.

---

### Idempotency & De-duplication

*   **Unique Message Keys:** Every SCOS event contains a unique, cryptographically signed `eventId` (UUIDv4).
*   **Idempotent Consumer Pattern:** Consumers track processed `eventId` keys inside a distributed Redis cache (with a 72-hour sliding TTL). If an event with an identical key is consumed again, the processor discards the packet, preventing duplicate transactions.

---

### Event Replay & State Restoration

*   **Persistent Event Ledger:** Kafka topic retention times are set to 14 days, preserving an immutable chronological log of city transactions.
*   **State Restoration:** If a database or microservice suffers a catastrophic failure, developers can spin up a new container and configure it to consume events from offset zero, reconstructing the database state step-by-step.

---

## 3. Why Event-Driven Architecture is Superior for City-Scale Governance

Traditional enterprise systems rely on Request-Response (REST/gRPC) patterns. For city-scale operating systems, request-response approaches fail due to several structural limitations:

| Architectural Metric | Traditional Request-Response (REST/gRPC) | Asynchronous Event-Driven Architecture (SCOS) |
| :--- | :--- | :--- |
| **System Coupling** | **Tight Coupling:** The calling system must know the destination API, structure, and address. Modifying any service breaks downstream code. | **Loose Coupling:** Services simply publish events. They are unaware of who consumes the data, enabling independent updates. |
| **Fault Isolation** | **None:** If a downstream service (e.g., the KDA database) is down, the upstream caller blocks, leading to cascading system crashes. | **High Isolation:** If a consumer is down, events queue up safely in Kafka. The consumer processes the queue once back online. |
| **Traffic Burst Resiliency** | **Low:** Sudden traffic spikes (e.g., thousands of flood reports) overload server threads, resulting in connection timeouts and dropped packets. | **High:** Kafka buffers incoming spikes. Consumers pull messages at their own pace, preventing service overloads. |
| **Audit & Reproducibility** | **Fragmented:** Audit histories are scattered across disparate database tables, making retrospective forensic audits difficult. | **Unified:** The append-only event stream provides an immutable, chronological, and verifiable audit record of all city events. |
| **Data Synchronization** | **Complex:** Re-syncing databases requires complex batch scripts or manual transfers. | **Native:** Systems can replay the event log to easily restore states or populate new read-replicas. |

---
*This event-driven architecture specification establishes the high-performance communication core of the Smart City Operating System, enabling a secure, responsive, and resilient digital brain for municipal administration.*
