# DATA PERSISTENCE STRATEGY & DATABASE ARCHITECTURE
## System: Smart City Operating System (SCOS) for Indian District Administration
### Academic Subtitle: A Multi-Paradigm Storage Substrate, Bitemporal Spatial Graphs, and High-Throughput Distributed Ledger Systems
**Institution:** Indian Institute of Technology Kanpur (IIT Kanpur)  
**Author:** M.Tech Thesis Research Sandbox  
**Role:** Principal Database Architect & Systems Engineer  

---

## Executive Summary

At city scale, a Smart City Operating System (SCOS) is subjected to a massive, highly heterogeneous workload. It must process continuous, sub-second telemetry streams from thousands of SCADA sensors, maintain relational integrity for civil registries, parse semantic relationships across urban structures, search unstructured Hinglish grievance text, serve high-frequency spatial queries, and secure cryptographically verifiable audit trails. 

Attempting to force this diverse data landscape into a single "silver bullet" database model introduces severe architectural limitations—such as write locks, index bloating, query degradation, and storage bottlenecks.

To address these challenges, SCOS implements a **Multi-Paradigm Distributed Storage Strategy**. This strategy matches each administrative data class with an optimized database engine. 

This document defines the SCOS persistence topology, catalogues where data classes reside, and specifies the operational parameters (indexing, partitioning, replication, backups, security, and performance optimizations) for each storage engine.

---

## The SCOS Polyglot Persistence Mesh

The following diagram illustrates how incoming data streams are classified and routed to specialized database engines within the SCOS storage mesh:

```
                          [ INCOMING DATA LAYER ]
                                     │
      ┌──────────────────┬───────────┼───────────┬──────────────────┐
      ▼                  ▼           ▼           ▼                  ▼
[ Relational / Spatial] [Telemetry] [Knowledge] [Search / Logs] [Media / Docs]
      │                  │           │           │                  │
      ▼                  ▼           ▼           ▼                  ▼
┌───────────┐      ┌───────────┐┌───────────┐┌───────────┐      ┌───────────┐
│PostgreSQL │      │TimescaleDB││   Neo4j   ││OpenSearch │      │MinIO / GCS│
│(PostGIS)  │      │(Time-     ││(Labeled  ││(Inverted  │      │(S3-Compat │
│ (ACID &   │      │ Series)   ││ Property ││  Index)   │      │  Object)  │
│ Geometry) │      └───────────┘│  Graph)   │└───────────┘      └───────────┘
└─────┬─────┘            ▲      └─────┬─────┘      ▲                  ▲
      │                  │            │            │                  │
      └─────────┬────────┴────────────┼────────────┴──────────────────┘
                ▼                     ▼
         ┌─────────────┐       ┌─────────────┐
         │Redis Cluster│ <───> │Temporal.io  │
         │ (Hot Cache) │       │ (Workflows) │
         └─────────────┘       └─────────────┘
```

---

## 1. Multi-Paradigm Data Distribution Directory

The following matrix maps the system's diverse data classes to their designated database engines based on query requirements and performance expectations:

| Data Class | Designated Database Engine | Key Rationale | Primary Operations |
| :--- | :--- | :--- | :--- |
| **Civil Profiles & Security Credentials** | PostgreSQL (Relational Core) | Guarantees strict ACID transactions and relational foreign keys for audits. | Write, Update, Joins |
| **Grievances & Workflows** | PostgreSQL + Temporal.io | Manages long-running state transitions, ensuring durability across service restarts. | Stateful mutations |
| **Asset & Parcel Geometries** | PostgreSQL (PostGIS) | Supports advanced spatial operations, boundary intersections, and coordinate routing. | R-Tree Spatial Joins |
| **Cognitive Templates & Logs** | PostgreSQL (JSONB) | Allows flexible schema variations while maintaining core relational constraints. | Document read/write |
| **Smart Meter Telemetry** | TimescaleDB | Ingests continuous sensor measurements without index bloat using time-partitioned tables. | Append-Only, Aggregations |
| **Urban Topologies & Ontologies** | Neo4j (LPG) | Executes fast, multi-hop relationship lookups (e.g., tracing upstream blockages). | Path traversals |
| **Search Indexes & Audit Logs** | OpenSearch | Provides sub-second full-text Hinglish searches and aggregations over historical logs. | Inverted Index queries |
| **Crews, Vehicles & Live Cache** | Redis Cluster | Delivers sub-millisecond read/write speeds for transient data (e.g., live GPS coordinates). | KV, Geospatial Index |
| **Photographs & Generated Reports** | MinIO / Google Cloud Storage | Offers highly cost-efficient storage for raw, unstructured media with retention rules. | File Upload / GET |

---

## 2. In-Depth Database Specifications & Topology

---

### A. Relational & Geospatial Core: PostgreSQL + PostGIS

The bedrock of SCOS transactional data. PostgreSQL manages structured data while the PostGIS extension provides advanced geographic operators.

*   **Data Model:** Relational schema with highly normalized tables representing citizen accounts, departments, escalations, and geospatial vectors (using `GEOMETRY` types).
*   **Retention:** Indefinite for active operational data and transactional registries.
*   **Backup Strategy:**
    *   Daily full database backups using `pg_dump` with compressed output written to isolated object storage.
    *   Continuous **Write-Ahead Log (WAL)** archiving to support point-in-time recovery (PITR) within a 15-minute window.
*   **Partitioning:** Table partitioning applied to historical transaction tables (e.g., `scos_audit_ledger`) on a monthly interval base.
*   **Replication:** Single-primary, multi-replica layout:
    *   1 master node handles all writes and spatial updates.
    *   2 read replicas handle spatial queries and API GET routes.
    *   Replication lag is actively monitored; transactions switch to read-replica pools only when lag is $<100\text{ms}$.
*   **Indexing Strategy:**
    *   Primary and Foreign keys indexed via standard **B-Tree** indexes.
    *   Spatial geometries (e.g., Ward polygons, asset points) indexed using **GIST (Generalized Search Tree)** indexes, enabling fast R-Tree spatial-bounding box calculations.
    *   Compound indexes on common search combinations (e.g., `(department_id, status)`).
*   **Security Controls:**
    *   **Row-Level Security (RLS):** Restricts data access dynamically:
        $$\text{Access}(\text{User}) \implies \text{Ward}(\text{User}) = \text{Ward}(\text{Data})$$
        This guarantees department operators can only query assets in their assigned geographic zone.
    *   Storage-level encryption using **AES-256** and TLS v1.3 encryption for all active database connection pools.
*   **Performance Optimizations:**
    *   Connection pooling managed using **PgBouncer** to reduce connection overhead.
    *   Careful adjustments of `shared_buffers` ($25\%$ of system RAM) and `work_mem` settings to cache heavy geometric joins in memory.

---

### B. Time-Series Engine: TimescaleDB (PostgreSQL Extension)

Designed to process continuous, high-volume telemetry streams from municipal streetlights, water meters, and environmental sensors without performance degradation over time.

*   **Data Model:** Hypertables—automatically partitioned PostgreSQL tables representing time, device ID, and telemetry values.
*   **Retention:**
    *   **Hot Tier:** High-frequency raw readings kept in active storage for exactly 14 days.
    *   **Cold Tier:** Auto-compressed and down-sampled records aggregated into hourly averages and kept for 24 months.
*   **Backup Strategy:** Integral to the PostgreSQL backup pipeline, using continuous logical WAL replication and file-level volume snapshots.
*   **Partitioning:** Hypertables automatically partition data into localized chunks based on a 1-day time interval and a hash of the `device_id`. This restricts writes to memory-resident chunks, preventing standard index bloating.
*   **Replication:** Multi-zone high-availability mirroring, maintaining a hot standby node within GKE.
*   **Indexing Strategy:**
    *   Compound indexes on `(device_id, time DESC)`.
    *   TimescaleDB's native **compressed indexes** to reduce storage requirements on cold data.
*   **Security Controls:**
    *   Read-only database roles assigned to reporting microservices.
    *   Dynamic token-based write authentications verified on incoming MQTT packets.
*   **Performance Optimizations:**
    *   Continuous aggregations run in the background to automatically pre-calculate daily metric trends.
    *   Native TimescaleDB chunk compression enabled after 7 days, reducing cold data storage requirements by up to $90\%$.

---

### C. Urban Semantic Graph: Neo4j (Labeled Property Graph)

Maps the complex, interconnected dependencies across city infrastructures (e.g., tracing power grids, water lines, and critical city resources).

*   **Data Model:** Labeled Property Graph (LPG). Nodes represent physical entities (e.g., sub-stations, pipeline junctions, water towers) and social entities (e.g., hospital wards). Edges represent real-world relationships (e.g., `FEEDS`, `INTERSECTS`, `DEPENDS_ON`).
*   **Retention:** Indefinite for core administrative and infrastructure models.
*   **Backup Strategy:** Daily hot-backups of the graph database database using Neo4j Admin tools, exported directly to object storage.
*   **Partitioning:** Scaling is achieved through Neo4j **Causal Clustering**. Active topological models are sharded across geographic zones (e.g., North, South, East) to maintain fast regional traversals.
*   **Replication:** Three-node cluster deployment (1 Core Writer, 2 Read-Only Standby nodes) to guarantee cluster uptime.
*   **Indexing Strategy:**
    *   Unique constraint and schema indexes on `Node` identity properties (e.g., `device_id`, `uuid`).
    *   Full-text search indexing on node name properties to accelerate coordinate lookups.
*   **Security Controls:**
    *   Role-Based Access Control (RBAC) configured to limit write commands to structural engineering teams.
    *   Integration with Keycloak to authenticate active Cypher queries.
*   **Performance Optimizations:**
    *   Dynamic cache allocation settings (`dbms.memory.pagecache.size` set to $50\%$ of RAM) to hold active graph topology matrices directly in system memory.
    *   Cypher query profiling to rewrite and optimize multi-hop queries.

---

### D. Full-Text Search Index: OpenSearch

Enables search across millions of historical citizen complaints and processes centralized system logs.

*   **Data Model:** Document-based JSON indexes.
*   **Retention:** Operational search indices kept indefinitely; audit and log indices rotated and deleted after 180 days.
*   **Backup Strategy:** Daily snapshot creation using OpenSearch Snapshot APIs, written to cheap object storage.
*   **Partitioning (Sharding):**
    *   Dynamic index template generation (e.g., `scos-logs-YYYY-MM`).
    *   Primary indexes split across 5 shards with 1 replica shard per partition.
*   **Replication:** Automated multi-node shard replication managed natively by the OpenSearch cluster.
*   **Indexing Strategy:**
    *   Text fields processed using custom language analyzers (English, Hindi, and custom Phonetic Hinglish tokenizers).
    *   Numerical values mapped to high-precision double indices to enable fast dashboard filtering.
*   **Security Controls:**
    *   Fine-grained index security: department operators are restricted from accessing fields labeled as citizen PII (e.g., name, phone number, Aadhaar).
    *   Role-based access controls integrated with Keycloak OIDC tokens.
*   **Performance Optimizations:**
    *   Configured heap sizes pinned to exactly $50\%$ of container memory, capping out at $32\text{GB}$ to avoid JVM pointer overhead.
    *   Avoidance of deep pagination queries in favor of `search_after` cursors.

---

### E. Static Media & Document Store: MinIO / Google Cloud Storage

Stores raw, unstructured files (such as photographs uploaded by crews, compiled reports, and spatial base-map vector tiles).

*   **Data Model:** Flat, key-value object storage. Object keys use hashed directory prefixes (e.g., `citizen/complaints/2026/07/abcd-1234-image.jpg`) to prevent partition collisions.
*   **Retention:** Managed dynamically using bucket lifecycle rules:
    *   High-resolution photos compressed and archived to cold storage tiers after 90 days.
    *   Temporary generated PDF documents auto-deleted after 7 days.
*   **Backup Strategy:** Dual-region bucket replication configured natively inside Google Cloud Storage.
*   **Partitioning:** Scaling is handled natively by the cloud provider, but directory structures use prefix hashing to optimize file operations.
*   **Replication:** Multi-region geo-replication ensures high file durability ($99.999999999\%$ annual durability targets).
*   **Indexing Strategy:** Metadatas are indexed in PostgreSQL (containing object URLs, hash tags, and classifications), avoiding slow bucket list operations.
*   **Security Controls:**
    *   Private buckets: files cannot be accessed via public URLs.
    *   Temporary access managed using secure, time-limited **Signed URLs** with a maximum validity window ($TTL = 15\text{ minutes}$).
*   **Performance Optimizations:**
    *   Integration with a global Content Delivery Network (CDN) to accelerate static asset loads for client browsers.
    *   Enablement of multi-part upload protocols to handle large spatial data sets efficiently.

---

### F. Distributed Cache Layer: Redis Cluster

Caches API responses, tracks transient coordinate states, and manages global session variables.

*   **Data Model:** In-memory Key-Value store supporting advanced data structures (Lists, Hashes, Sets, and Geospatial Sorted Sets).
*   **Retention:** Managed using strict memory-eviction policies (LRU - Least Recently Used). Dynamic TTL values are set on every write:
    *   Session states: 2 hours.
    *   Common API caches: 1 hour.
    *   Transient coordinates: No TTL (manually updated by sensor pipelines).
*   **Backup Strategy:** Semi-persistent configuration using RDB (Redis Database snapshots every 60 minutes) and AOF (Append Only File) logging.
*   **Partitioning (Sharding):** Multi-node clustering using native Redis Sharding, dividing the keyspace across 16,384 slots.
*   **Replication:** Master-Replica architecture: each master node is paired with a hot replica node to enable automatic failovers.
*   **Indexing Strategy:**
    *   Keys styled with strict semantic prefixes (e.g., `scos:cache:citizen:profile:1234`).
    *   Geospatial values indexed using native Redis `GEOADD` coordinate keys.
*   **Security Controls:**
    *   Redis connection passwords stored securely inside HashiCorp Vault.
    *   All internal Redis traffic encrypted over mTLS.
*   **Performance Optimizations:**
    *   Avoiding slow wildcard operations (e.g., `KEYS *`) in favor of cursor-based scanning (`SCAN`).
    *   Pipelining queries during heavy write operations to minimize network latency overheads.

---

## 3. Storage Tiering & Lifecycle Topology

SCOS leverages a three-tier storage lifecycle strategy to maintain high performance while controlling operational costs:

```
[ INGESTION / WRITE ]
         │
         ▼
┌────────────────────────────────────────────────────────┐
│                      HOT TIER                          │
│   - Technologies: Redis, PostgreSQL, Active Hypertable │
│   - Storage Media: High-Speed NVMe SSDs                │
│   - Data: Active Tickets, Live GPS, Last 14-day Telemetry│
└────────────────────────┬───────────────────────────────┘
                         │
                         ▼ (Automated Archive / Compress)
┌────────────────────────────────────────────────────────┐
│                      WARM TIER                         │
│   - Technologies: PostgreSQL (Compressed Chunks), Neo4j │
│   - Storage Media: Standard SSDs                       │
│   - Data: Closed Tickets (6 months), Ingested Avg Logs  │
└────────────────────────┬───────────────────────────────┘
                         │
                         ▼ (Automated Lifecycle Transition)
┌────────────────────────────────────────────────────────┐
│                      COLD TIER                         │
│   - Technologies: GCS Coldline / Archive, OpenSearch   │
│   - Storage Media: Hard Disks (HDD), Object Storage   │
│   - Data: Transaction Logs (24 months), Raw Telemetries │
└────────────────────────────────────────────────────────┘
```

1.  **Hot Tier:** High-speed NVMe SSDs hosting Redis, PostgreSQL active registries, and active TimescaleDB hypertables. This tier handles high-frequency writes and real-time operations.
2.  **Warm Tier:** Standard SSDs hosting compressed TimescaleDB chunks, older ticket records, and historical graph models. Optimized for analytical traversals.
3.  **Cold Tier:** Cost-efficient HDD-backed storage hosting raw GCS logs and historic OpenSearch indices. Data is compressed to minimize storage footprints.

---
*This data persistence strategy and database architecture specification establishes the storage standards, backup policies, security protocols, and replication models required to run the Smart City Operating System safely and reliably across district administrations.*
