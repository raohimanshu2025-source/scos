# URBAN KNOWLEDGE GRAPH & SEMANTIC MEMORY SPECIFICATION
## System: Smart City Operating System (SCOS) for Indian District Administration
### Academic Subtitle: A Multi-Relational Spatial-Temporal Urban Ontology, Semantic Schema Matching, and Explainable AI (XAI) Decoupling Substrate
**Institution:** Indian Institute of Technology Kanpur (IIT Kanpur)  
**Author:** M.Tech Thesis Research Sandbox  

---

## Executive Summary

While relational databases excel at transactional indexing and event-driven brokers (like Apache Kafka) excel at high-velocity message passing, neither contains the capability to dynamically model, infer, or explain complex, multi-layered urban relationships. A modern district administration deals with cross-domain phenomena: an overflowing sewer line (Water) is geographically near a primary school (Education) whose attendance has dropped (Health) because citizens have filed complaints (Citizen Engagement) about localized odors, all while legal bylaws (Policy) dictate that high-severity health risks must be audited within 24 hours.

To establish a cognitive "city brain," the **Smart City Operating System (SCOS)** implements an **Urban Knowledge Graph (UKG)**. The UKG acts as SCOS's unified semantic memory, linking physical infrastructure, administrative bodies, statutory rules, operational events, and inhabitants into a queryable spatial-temporal-semantic graph. 

This document formalizes the SCOS Ontology, details entity-resolution and versioning strategies, specifies how the graph supports cognitive reasoning and Explainable AI (XAI), and provides conceptual SPARQL/Cypher query models.

---

## 1. Unified SCOS Ontology Design

The UKG represents city structures as a directed, multi-relational property graph. The underlying ontology is structured into classes, attributes, taxonomical hierarchies, and multi-directional edge relations.

```
┌─────────────────┐             LOCATED_IN             ┌──────────────────┐
│    Building     ├───────────────────────────────────►│       Ward       │
└────────┬────────┘                                    └────────▲─────────┘
         │                                                      │
         │ BELONGS_TO_PARCEL                                    │
         ▼                                                      │
┌─────────────────┐             GEOGRAPHICALLY_NEAR             │
│    GISParcel    ├─────────────────────────────────────────────┤
└────────┬────────┘                                             │
         │                                                      │
         │ REGISTERED_UNDER                                     │
         ▼                                                      │
┌─────────────────┐             REPORTED_NEAR                   │
│     Citizen     ├─────────────────────────────────────────────┘
└─────────────────┘
```

---

### Node Taxonomy & Class Definitions

The SCOS Ontology defines thirteen core classes (node labels), each containing localized property structures:

1.  **Citizen (`:Citizen`):** Represents an inhabitant within the district administrative geofence.
    *   *Properties:* `id` (UUID), `verificationLevel` (Aadhaar status), `satisfactionIndex` (Float), `wardId` (String).
2.  **Department (`:Department`):** Models the municipal administrative bodies and offices.
    *   *Properties:* `code` (e.g., "KMC", "JS", "KESCO"), `name` (String), `slaThresholdHours` (Integer).
3.  **Road (`:Road`):** Models structural transportation corridors, corridors, and street grids.
    *   *Properties:* `id` (UUID), `name` (String), `surfaceType` (Enum), `laneCount` (Integer), `gisGeometry` (LineString).
4.  **Building (`:Building`):** Models structural, vertical physical parcels within the district master plan.
    *   *Properties:* `id` (UUID), `address` (String), `useType` (Enum: RESIDENTIAL, COMMERCIAL, PUBLIC, INDUSTRIAL).
5.  **School (`:School`):** A specialized sub-class of `:Building` representing public/private educational institutes.
    *   *Properties:* `enrollmentCount` (Integer), `schoolLevel` (Enum), `contactEmail` (String).
6.  **Hospital (`:Hospital`):** A specialized sub-class of `:Building` representing medical clinics and primary health centers.
    *   *Properties:* `bedCapacity` (Integer), `icuBedsAvailable` (Integer), `traumaLevel` (Integer).
7.  **Utility (`:Utility`):** Represents critical urban assets (water lines, electrical grids, gas ducts).
    *   *Properties:* `id` (UUID), `utilityClass` (Enum: WATER, ELECTRIC, GAS), `material` (String), `installationYear` (Integer).
8.  **Incident (`:Incident`):** Represents an active physical, spatial, or citizen-submitted event requiring resolution.
    *   *Properties:* `id` (UUID), `category` (String), `severity` (Enum), `reportedAt` (Timestamp), `workflowStatus` (Enum).
9.  **Asset (`:Asset`):** Represents high-value moveable or stationary municipal equipment (pumps, generators, desilting trucks).
    *   *Properties:* `id` (UUID), `assetType` (String), `operationalStatus` (Enum), `lastMaintenanceDate` (Timestamp).
10. **Policy (`:Policy`):** Models legal statutes, zoning codes, and administrative bylaws.
    *   *Properties:* `id` (UUID), `documentName` (String), `statuteSection` (String), `penaltyMatrix` (JSON).
11. **Project (`:Project`):** Models development initiatives or repairs planned across municipal boundaries.
    *   *Properties:* `id` (UUID), `budgetAllocated` (Decimal), `startDate` (Timestamp), `completionDeadline` (Timestamp).
12. **Sensor (`:Sensor`):** Models active, edge physical telemetry devices deployed in the field.
    *   *Properties:* `id` (UUID), `sensorType` (Enum: FLOW, AQI, PRESSURE, VIDEO), `ipAddress` (String), `batteryPercent` (Float).
13. **Vehicle (`:Vehicle`):** Models mobile municipal response fleets.
    *   *Properties:* `plateNumber` (String), `vehicleClass` (Enum: TOW, SANITATION, AMBULANCE), `speedLimit` (Float).

---

### Relation Taxonomy (Edge Map)

Relationships are directed and contain attributes (weights, distances, or timestamps) to enable fine-grained network flow routing and spatial analytics:

*   `(:Citizen)-[:FILED_COMPLAINT {onTimestamp}]->(:Incident)`
*   `(:Incident)-[:GEOGRAPHICALLY_NEAR {distanceMeters}]->(:Building)`
*   `(:Incident)-[:ASSIGNED_TO]->(:Department)`
*   `(:Department)-[:OWNS]->(:Asset)`
*   `(:Vehicle)-[:ASSIGNED_TO_FLEET]->(:Department)`
*   `(:Sensor)-[:MONITORS]->(:Utility)`
*   `(:Utility)-[:CROSSES]->(:Road)`
*   `(:Building)-[:BELONGS_TO_PARCEL]->(:GISParcel)`
*   `(:GISParcel)-[:UNDER_ZONING_GUIDELINE]->(:Policy)`
*   `(:Project)-[:MODIFIES]->(:Road)`
*   `(:School)-[:SERVED_BY_PHC]->(:Hospital)`

---

## 2. Advanced Graph Engineering: Entity Resolution & Versioning

### Entity Resolution (Spatial-Semantic Matching)
Because city data is ingested from separate legacy systems, identical physical entities are often recorded differently. For example, a water leak complaint at "Hallet Hospital Lane, Kalyanpur" (Citizen) and a pipe leak telemetry signal at "KM-89, KL" (SCADA Sensor) refer to the same physical event.

SCOS implements a three-step **Entity Resolution Pipeline**:
1.  **Spatial Buffering:** Ingested nodes are matched against active nodes within a spatial geofence (e.g., $50\text{ meters}$ radius using Uber H3 indexing).
2.  **Semantic String Alignment:** Text properties (names, addresses) are passed through Jaro-Winkler string distance metrics and cosine word vector similarities.
3.  **Probabilistic Graph Matching:** SCOS computes the probability that two nodes are identical based on their shared relational connections (e.g., if both Node $X$ and Node $Y$ are connected to the same `:Hospital` and have adjacent sensor values, they are merged). Merged nodes preserve a `[:RESOLVED_TO]` link to allow tracking.

### Graph Versioning (Temporal-Spatial Graph Splitting)
Urban assets change over time: a road is expanded, a school is relocated, or a zoning policy is modified. SCOS uses **Bitemporal Graph Versioning**:
*   Every node and edge contains twin timestamp properties: `validFrom`/`validTo` (representing the real-world occurrence time) and `txFrom`/`txTo` (representing the SCOS database write transaction time).
*   Instead of modifying properties directly, SCOS writes a new version of the node/edge with updated temporal attributes, allowing researchers and coordinators to run **temporal-replay graph queries** to inspect the state of the city at any precise moment in history.

---

## 3. Cognitive Capabilities of the SCOS Knowledge Graph

---

### AI Reasoning & Inference
SCOS uses UKG relationships to perform multi-hop, logical reasoning.
*   *Inference Example:* An AQI sensor detects a localized sulfur-dioxide peak. The UKG traces relationships:
    $$\text{Sensor} \xrightarrow{\text{MONITORS}} \text{Air Zone} \xrightarrow{\text{OVERLAPS}} \text{Factory Parcel} \xrightarrow{\text{REGISTERED_TO}} \text{Tannery ID}$$
    Instead of manually querying separate relational tables, the **Environment Agent** uses single graph queries to identify potential offending factories.

### Semantic Search & Conversational Triage
When a citizen writes a conversational complaint ("*humare bacche ke school ke paas naala beh raha hai bimar pad rahe hain sab*"), standard keyword indexing fails. 
1.  The **Citizen Agent** converts the text into vectors.
2.  The vector is matched against UKG node labels. SCOS identifies "bacche ke school" (School), "naala beh raha hai" (Sewer Overflow), and "bimar" (Health Risk).
3.  The spatial engine queries the UKG to locate the primary school nearest to the citizen's GPS coordinates, mapping the complaint to the exact pipeline segment and dispatching the ticket to the sewage division immediately.

### Cross-Departmental Insights
The UKG breaks down municipal silos. By modeling city networks as a single connected graph, leadership can visualize and anticipate cascading effects. For instance, planning a road-widening project (`:Project`) triggers a query that identifies all water conduits (`:Utility`), transformer poles (`:Sensor`), and school boundaries (`:Building`) that will be affected by structural shifts, preventing accidental water line ruptures or power cuts during construction.

---

## 4. Explainable AI (XAI) & Decision Support

Monolithic AI chatbots suffer from the "black-box" dilemma—they make recommendations but cannot explain *why* they chose them, which is a major system risk for municipal governments that must justify resource allocation publicly.

SCOS solves this with **Graph-Regularized Decision Trees**:
1.  When SCOS selects an action (e.g., ordering the immediate de-energization of Substation 3), the **Coordinator Agent** constructs an **Explanation Subgraph**.
2.  This subgraph contains the exact chain of relationships that triggered the decision:
    $$\text{Wind Sensor (tilt detected)} \to \text{feeder circuit 4} \to \text{GT-Road Corridor (blocked)} \to \text{Kalyanpur School (evacuation route active)}$$
3.  The SCOS dashboard renders this explanation as an intuitive visual graph, allowing human administrators to inspect, verify, and approve the AI’s reasoning within milliseconds.

```
                    ┌─────────────────────────┐
                    │  EXPLANATION SUBGRAPH   │
                    └────────────┬────────────┘
                                 │
     ┌───────────────────────────┼───────────────────────────┐
     ▼                           ▼                           ▼
[Tilt Detected] ──► [Feeder Circuit 4] ──► [GT-Road Corridor] ──► [Kalyanpur School]
(Severe Hazard)       (KESCO Substation)     (Blocked Corridor)    (Evacuation Zone)
```

---

## 5. Conceptual Graph Query Formulations

---

### Cypher Query (Neo4j Context) - Outbreak Source Identification
This query finds the likely sources of water contamination near a school reporting a high rate of student absences, looking for adjacent industrial factories operating with outdated permits:

```cypher
MATCH (s:School)-[:SERVED_BY_PHC]->(p:Hospital)
MATCH (p)-[:REPORTED_CASE {symptom: "Gastroenteritis"}]->(i:Incident)
MATCH (i)-[:REPORTED_NEAR]->(u:Utility {utilityClass: "WATER"})
MATCH (sensor:Sensor {sensorType: "FLOW_MONITOR"})-[:MONITORS]->(u)
MATCH (factory:Building {useType: "INDUSTRIAL"})-[:GEOGRAPHICALLY_NEAR {maxDistance: 200}]->(u)
MATCH (factory)-[:UNDER_ZONING_GUIDELINE]->(policy:Policy)
WHERE sensor.lastTurbidityReading > 10.0 AND policy.permitStatus = "EXPIRED"
RETURN s.name AS SchoolName, factory.name AS SuspectFactory, policy.documentName AS ExpiredBylaw
```

---

### SPARQL Query (RDF Context) - Environmental Hazard Cross-Referencing
This query maps high-value municipal construction projects that are currently overlapping with active environmental pollution zones, returning the assigned contractors and environmental inspectors:

```sparql
PREFIX scos: <https://scos.gov.in/ontology#>
PREFIX geo: <http://www.opengis.net/ont/geosparql#>

SELECT ?projectName ?budget ?factoryName ?inspectorEmail
WHERE {
  ?project a scos:Project ;
           scos:name ?projectName ;
           scos:budgetAllocated ?budget ;
           scos:modifies ?road .
  ?road geo:sfWithin ?ward .
  ?factory a scos:Building ;
           scos:useType "INDUSTRIAL" ;
           scos:name ?factoryName ;
           geo:sfWithin ?ward .
  ?sensor a scos:Sensor ;
          scos:sensorType "AQI_MONITOR" ;
          scos:monitors ?factory ;
          scos:lastReading ?aqiValue .
  FILTER (?aqiValue > 300)
  ?inspector a scos:Citizen ;
             scos:role "ENVIRONMENT_INSPECTOR" ;
             scos:contactEmail ?inspectorEmail ;
             scos:assignedTo ?ward .
}
```

---
*This Urban Knowledge Graph specification establishes the semantic and cognitive substrate of the Smart City Operating System, transforming raw municipal data into actionable, transparent, and explainable urban governance decisions.*
