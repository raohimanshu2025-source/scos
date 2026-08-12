# SYSTEM INTEGRATION STRATEGY & API GOVERNANCE SPECIFICATION
## System: Smart City Operating System (SCOS) for Indian District Administration
### Academic Subtitle: A Federated API Integration Substrate, Multi-Protocol Gateways, and Open-Governance Standards
**Institution:** Indian Institute of Technology Kanpur (IIT Kanpur)  
**Author:** M.Tech Thesis Research Sandbox  

---

## Executive Summary

At city scale, a Smart City Operating System is only as strong as its ability to integrate with diverse, heterogeneous external platforms, legacy government databases, high-frequency IoT gateways, and proprietary utility SCADA systems. Attempting to force these disparate networks into a single, rigid integration standard introduces severe protocol bottlenecks and coupling errors.

The **Smart City Operating System (SCOS)** implements a **federated, multi-protocol integration strategy**. This strategy decouples internal microservices using high-performance, type-safe gRPC and REST APIs, while interfacing with external systems using specialized adaptor layers, secure translation gateways, and event-driven pipelines.

This document catalogues SCOS's internal and external APIs, defines protocol selection matrices (REST vs. GraphQL vs. gRPC), establishes security, rate-limiting, and error-handling standards, and details the **SCOS API Governance Model** to guide future developers and municipal administrators.

---

## The SCOS Integration and API Gateway Topology

The following diagram illustrates how the SCOS API Gateway manages and routes incoming requests from diverse physical, social, and administrative endpoints using a secure multi-protocol layer:

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          EXTERNAL INGRESS CLIENTS                        │
│   (Citizen Mobile Apps, Municipal Web Portals, External Webhooks, IoT)   │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │ (HTTPS / WSS / MQTT)
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                      SCOS KONG API GATEWAY LAYER                         │
├──────────────────────────────────────────────────────────────────────────┤
│ - SSL/TLS Termination            - JWT Validation & RBAC Auditing        │
│ - Rate Limiting & Geo-Blocking   - CORS Enforcements                     │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │ (mTLS / Internal Routing)
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                     INTERNAL SERVICE CONNECTOR PLUGINS                   │
├─────────────────────────┬──────────────────────────┬─────────────────────┤
│ REST/JSON Endpoints     │ High-Performance gRPC    │ WebSockets (WSS)    │
│ (Citizen & Config)      │ (Service-to-Service)     │ (Real-Time Streams) │
└─────────────────────────┴──────────┬───────────────┴─────────────────────┘
                                     │
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                         SCOS CORE MICROSERVICES                          │
│   (Citizen, Cognitive Triage, Scheduler, GIS Twin, Security, Event Bus)   │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 1. SCOS Unified Integration Catalog

To establish absolute spatial-temporal awareness, SCOS coordinates a wide array of internal and external interfaces:

---

### Internal APIs (Service-to-Service Ecosystem)

SCOS microservices communicate internally using two distinct communication patterns to balance latency and readability:

1.  **gRPC (Protobuf over HTTP/2):** Used for all high-velocity, synchronous service-to-service calls where sub-millisecond latencies are critical.
    *   *Example:* The `SCOS-SCHEDULER` querying the `SCOS-TWIN` for the nearest available vacuum truck coordinates.
2.  **REST/JSON (HTTP/1.1):** Used for serving the administrative dashboard frontends, configuration management panels, and user session requests.
    *   *Example:* The District Magistrate's web dashboard requesting active daily performance KPIs from the `SCOS-REPORT` service.

---

### External Integration Interfaces

SCOS bridges the district administration with external agencies through secure adaptation gateways:

#### 1. Geographic Information System (GIS) Services
*   **Target Systems:** ISRO Bhuvan Portal, NIC State GIS Registries, Google Maps Platform.
*   **Integration Pattern:** REST APIs consuming GeoJSON vectors and Web Map Service (WMS) raster tiles.
*   **Purpose:** Map district parcel boundaries, track road construction coordinates, and geofence active municipal utility corridors.

#### 2. Meteorological and Weather Services
*   **Target Systems:** Indian Meteorological Department (IMD) feeds, local rain gauge telemetry networks.
*   **Integration Pattern:** Polling REST endpoints and receiving Webhook alerts during critical weather changes.
*   **Purpose:** Feed hourly precipitation trends and wind speed metrics into the **Predictive Analytics Agent** to generate flood warnings.

#### 3. National and State Government Databases
*   **Target Systems:** CPGRAMS (Centralized Public Grievance Redress and Monitoring System), Aadhaar identity verification registry.
*   **Integration Pattern:** SOAP/XML gateways (legacy CPGRAMS connectors) and OAuth2-secured REST endpoints (Aadhaar).
*   **Purpose:** Automatically sync citizen grievances submitted to national channels and verify citizen profiles securely.

#### 4. High-Throughput IoT Gateways
*   **Target Systems:** Smart Streetlight management systems, SCADA water flow meters, environmental AQI monitoring arrays.
*   **Integration Pattern:** Asynchronous MQTT brokers with TLS mutual authentication.
*   **Purpose:** Ingest real-time pressure, flow rate, and pollution parameters directly into the event-driven ingestion pipeline.

#### 5. Financial & Payment Gateways (Future-Ready)
*   **Target Systems:** UPI (Unified Payments Interface) networks, Bharat Bill Payment System (BBPS).
*   **Integration Pattern:** Webhook-driven REST APIs with secure signature verification.
*   **Purpose:** Allow citizens to pay municipal property taxes and sanitation clearances directly through the SCOS portal.

#### 6. Messaging & Public Alert Systems
*   **Target Systems:** National Disaster Management Authority (NDMA) Common Alerting Protocol (CAP), SMS/WhatsApp business gateways.
*   **Integration Pattern:** High-priority webhook dispatches and REST integrations.
*   **Purpose:** Broadcast emergency warning alerts and status update SMS notifications to affected citizen wards.

---

## 2. API Protocols & Interface Design Decisions

To prevent architectural drift, SCOS defines strict guidelines for interface protocol selection:

---

### REST vs. GraphQL vs. gRPC Decision Matrix

| Dimension | REST (JSON over HTTP/1.1) | GraphQL | gRPC (Protobuf over HTTP/2) |
| :--- | :--- | :--- | :--- |
| **SCOS Target Use-case** | Public Citizen APIs, dashboard configurations, and static file endpoints. | Complex, multi-resource dashboard views (e.g., querying a hospital's beds, doctors, and location in one call). | Core internal service-to-service communication and high-frequency telemetry pipelines. |
| **Data Payload Format** | Text-based JSON. | Text-based JSON. | Binary Protocol Buffers (highly compressed). |
| **Network Protocol** | HTTP/1.1. | HTTP/1.1. | HTTP/2 (Multiplexed streams). |
| **Type Safety** | Low (requires manual schema verification). | Medium (GraphQL Schema Language). | High (Strict compile-time code generation from `.proto` contracts). |
| **Network Overhead** | Medium to High. | Medium (reduces over-fetching, but query parsing adds overhead). | Extremely Low. |

---

### Async Event-Driven APIs (AsyncAPI)

For asynchronous, event-driven interfaces (e.g., SCADA telemetry streams and Kafka topic channels), SCOS rejects standard OpenAPI declarations in favor of **AsyncAPI Specifications**. 

This enforces strict schema designs for message keys, headers, and event payloads (see JSON schemas in the Event-Driven Architecture document), ensuring that all publishers and subscribers maintain compatible data structures across iterations.

---

## 3. Policy, Security, & Lifecycle Controls

---

### Strict API Versioning Strategy
SCOS enforces **path-based versioning** for all public REST and GraphQL APIs to prevent breaking change cascades:
*   *Public APIs:* `/api/v1/citizen/...` or `/api/v2/citizen/...`
*   *Deprecation Policy:* When `v2` is deployed, `v1` is marked as deprecated in headers (`Sunset: Date`, `Deprecation: true`) and maintained for exactly 180 days before retirement.
*   *Internal gRPC:* Managed through Protocol Buffers' native field-number indexing, allowing back-wards compatible additions without breaking existing deployments.

---

### Intelligent Rate Limiting & Traffic Management
To defend against Distributed Denial of Service (DDoS) attacks and prevent API abuse, the Kong API Gateway enforces **Tiered Rate Limiting**:
*   *Citizen Tier:* Restricted to $60\text{ requests per minute}$ per IP address.
*   *IoT Gateways:* Configured dynamically based on expected device frequencies (e.g., $1\text{ request per second}$ for flow meters).
*   *Administrative Command Panels:* Restricted to $120\text{ requests per minute}$ per authenticated session token.
*   *Spike Arrest Pattern:* If any client exceeds their allocated limit, the gateway immediately returns an `HTTP 429 Too Many Requests` error with a `Retry-After` header.

---

### Zero-Trust Authentication & Authorization (ZTAA)
All API requests are validated through a strict multi-layer authentication framework:
1.  **Public Consumers:** Must authenticate using OAuth2 with JSON Web Tokens (JWT) containing cryptographically signed user IDs and validated roles.
2.  **IoT Devices:** Must authenticate using **Mutual TLS (mTLS)**, verifying unique, hardware-bound X.509 certificates against the municipal Certificate Authority.
3.  **Service-to-Service Hops:** Enforced inside the Istio Service Mesh using mTLS, ensuring that every internal packet is encrypted and verified.

---

### Universal Error Handling Standard
All SCOS REST APIs return standardized, machine-readable JSON error structures based on the **RFC 7807 (Problem Details for HTTP APIs)** specification:

```json
{
  "type": "https://errors.scos.gov.in/rate-limit-exceeded",
  "title": "Too Many Requests",
  "status": 429,
  "detail": "IP address has exceeded the allocated limit of 60 requests per minute.",
  "instance": "/api/v1/citizen/complaints",
  "errorCode": "SCOS_ERR_RATE_LIMIT",
  "timestamp": "2026-07-13T11:47:00Z"
}
```

---

## 4. The SCOS API Governance Model

To preserve system integrity, compatibility, and speed across multi-departmental development teams, SCOS establishes the **API Governance Board**:

1.  **Contract-First Design:** Developers are strictly forbidden from writing code before defining their API schemas. All REST interfaces must be designed as OpenAPI v3 files, and all internal hops must be specified as Protobuf `.proto` contracts.
2.  **Automated Schema Audits:** Every pull request runs automated schema validation checks. API designs are parsed to verify naming conventions, security configurations, rate-limiting declarations, and error-handling standards before approval.
3.  **Immutable API Ledger:** Approved API specifications are registered and displayed on the SCOS Developer Portal, serving as the single, current source of truth for all district-level integrations.

---
*This system integration strategy and API governance specification establishes the formal standards, protocols, and security controls required to deploy the Smart City Operating System safely, reliably, and seamlessly across district administrations.*
