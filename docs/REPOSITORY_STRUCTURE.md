# MONOREPO REPOSITORY STRUCTURE & ENGINEERING STANDARDS SPECIFICATION
## System: Smart City Operating System (SCOS) for Indian District Administration
### Academic Subtitle: A Distributed Hermetic Monorepo Specification, Strict Build Graphs, and Large-Scale Code Governance Substrates
**Institution:** Indian Institute of Technology Kanpur (IIT Kanpur)  
**Author:** M.Tech Thesis Research Sandbox  
**Role:** Lead Systems Architect / Monorepo Release Engineer  

---

## Executive Summary

At city scale, developing a complex software system like the **Smart City Operating System (SCOS)** with multiple independent development teams, research student groups, and municipal engineering departments can lead to **code fragmentation**, **dependency drift**, and **integration testing bottlenecks**. If each microservice, data science model, or user interface is stored in a separate repository, the system quickly degrades into a state of "dependency hell" where breaking changes in core schemas (such as the Urban Knowledge Graph or Event-Driven brokers) are only detected at runtime.

To enforce absolute type-safety, contract compliance, hermetic reproducibility, and high developer velocity, SCOS implements a unified, enterprise-grade **Hermetic Monorepo Layout** modeled after the engineering standards used by Google (Piper/Bazel) and Microsoft (OneBox/Rush). 

This document formalizes the monorepo directory topology, specifies the purpose of every folder, establishes strict coding and naming conventions, details trunk-based branching strategies, and provides code ownership policies suitable for high-impact research and commercial deployment.

---

## 1. Unified SCOS Monorepo Topology

SCOS leverages a modern, workspace-isolated monorepo design managed via **pnpm Workspaces** (for Node.js/TypeScript core services) and **Poetry Workspaces** (for Python-based AI and GIS engines). The entire repository tree is organized into highly logical, isolated, and reusable directories:

```
scos-monorepo/ (Root)
├── .github/                       # GitHub Actions workflows, issue templates, and pull request configurations
├── apps/                          # Deployable frontend user interfaces and portal applications
├── services/                      # Decoupled, deployable microservice backends (REST/gRPC/MQTT)
├── packages/                      # Local, reusable code libraries and package workspaces
├── shared/                        # Shared static resources, types, and schema contracts
├── infrastructure/                # Infrastructure-as-Code (IaC) configuration scripts
├── deployment/                    # Production deployment definitions (Helm, ArgoCD, K8s manifests)
├── documentation/                 # Comprehensive architecture guides, API specs, and bylaws
├── research/                      # Academic research sandboxes, notebooks, and prototype models
├── datasets/                      # Seed database records, calibration matrices, and mock telemetries
├── scripts/                       # Monorepo-wide developer toolings, seeders, and build utilities
├── testing/                       # Centralized end-to-end (E2E) integration test suites
├── pnpm-workspace.yaml            # Monorepo configuration for pnpm workspaces
└── package.json                   # Root workspace manifest with shared devDependencies
```

---

## 2. Granular Directory Specifications & Purpose

---

### `/apps` (Deployable User Interfaces)
Houses the client-side, browser-based applications that expose SCOS features to diverse physical and social entities. Every application in this folder is built as a highly responsive Single Page Application (SPA) using React 18 and Vite:
*   `apps/citizen-portal/`: The primary public interface where citizens submit Hinglish grievances, track ticket progress, and verify accounts using Aadhaar.
*   `apps/command-center-dashboard/`: The highly visual visual terminal used by the District Magistrate and department supervisors, displaying 3D geospatial overlays (Deck.gl) and real-time status indicators.
*   `apps/field-crew-mobile/`: A lightweight, localized mobile application designed for municipal field engineers (Jal Sansthan, KESCO) to receive dispatches and upload repair photographs.

---

### `/services` (Microservice Backends)
Contains SCOS's independent, deployable backend services. Each service owns its database connection, exposes type-safe API endpoints, and communicates asynchronously via the Apache Kafka event bus:
*   `services/scos-citizen/`: Manages citizen user profiles, session states, and CPGRAMS ticket indexing.
*   `services/scos-cognitive/`: Houses the FastAPI service executing the Gemini 2.5 API RAG pipeline and Hinglish-to-English translation.
*   `services/scos-scheduler/`: Computes crew routes and dispatch allocations using constraint-solvers.
*   `services/scos-dsal/`: Manages incoming SCADA/IoT high-frequency telemetry translations.
*   `services/scos-twin/`: Executes 3D PostGIS spatial queries and manages the GIS hexagonal grid layer.

---

### `/packages` (Internal Shared Libraries)
Contains private, reusable code modules that are published locally within the monorepo workspace. Microservices import these packages natively to avoid code duplication:
*   `packages/database-client/`: A shared database abstraction client providing connection pools for PostgreSQL/PostGIS.
*   `packages/logger/`: A standardized Winston-based logger outputting JSON logs matching OpenTelemetry formats.
*   `packages/kafka-client/`: Standardizes consumer group retries, exponential backoff circuits, and dead-letter queue routing.

---

### `/shared` (Static Schemas & Type Contracts)
Holds raw files, type definitions, and protocol schemas that form the architectural contracts of SCOS:
*   `shared/schemas/proto/`: Standardized `.proto` files specifying gRPC interfaces for service-to-service communication.
*   `shared/schemas/json/`: Standardized AsyncAPI and OpenAPI JSON contracts validating event payloads.
*   `shared/types/`: Shared TypeScript type mappings used by both `/apps` and `/services` to guarantee compile-time contract compliance.

---

### `/infrastructure` (Infrastructure-as-Code)
Houses declarative blueprints to provision the underlying physical and cloud networks:
*   `infrastructure/terraform/`: Declarative scripts to provision the Google Cloud VPCs, GKE clusters, and managed services (Vertex AI, GCS).
*   `infrastructure/ansible/`: Configuration scripts to install and configure local physical servers in municipal district offices (hybrid Azure Arc environments).

---

### `/deployment` (Kubernetes Manifests & Orchestration)
Specifies how the compiled container images are managed and updated inside the Kubernetes cluster:
*   `deployment/helm/`: Standardized, parameter-driven Helm charts to install the SCOS microservices with a single command.
*   `deployment/argocd/`: GitOps deployment files that monitor our Git repository and automatically synchronize changes into production.

---

### `/documentation` (Academic & Operational Specs)
The repository's documentation repository:
*   `documentation/architecture/`: Technical specifications detailing the multi-agent cognitive architecture, event-driven pipelines, and data flows.
*   `documentation/bylaws/`: Vectorized municipal codes, building bylaws, and India's DPDP Act text used by the **Policy Agent**'s RAG system.

---

### `/research` (Academic Sandboxes & Models)
Dedicated research sandbox for academic students and ML engineers at IIT Kanpur:
*   `research/notebooks/`: Jupyter Notebooks documenting the development and testing of predictive hydrological models and traffic gridlock algorithms.
*   `research/prototypes/`: Isolated Python models and agent experiments (such as early tests of the WPACS arbitration solver).

---

### `/datasets` (Validation Records & Seeds)
Houses datasets used to calibrate, test, and seed SCOS environments:
*   `datasets/telemetry-seeds/`: Simulated water flow sensor values and historical AQI telemetry arrays used to benchmark ingestion pipelines.
*   `datasets/geofence-boundaries/`: Standardized GeoJSON coordinates representing administrative ward boundaries in Kanpur.

---

### `/scripts` (Monorepo Tooling)
Houses lightweight, cross-language utilities to automate daily developer operations:
*   `scripts/generate-grpc.sh`: Translates Protobuf `.proto` schema files into compiled TypeScript and Python classes inside target microservice folders.
*   `scripts/seed-databases.js`: Automatically populates development databases with localized test data.

---

### `/testing` (Centralized E2E Integration Testing)
Houses comprehensive end-to-end (E2E) integration testing scripts:
*   `testing/k6-load-tests/`: Load-testing scripts simulating high-velocity sensor telemetry bursts.
*   `testing/playwright/`: Cross-browser UI testing scripts verifying citizen grievance submission flows.

---

## 3. Monorepo Developer Workflow & Engineering Rules

To maintain high software quality across a large, collaborative team, SCOS enforces standard monorepo engineering rules:

```
[ Developer Branch ] ──► [ Push to Origin ] ──► [ GitHub Actions CI Pipeline ] ──► [ Merge to Main ]
  - Feature branch          - Triggers build      - Runs Hermetic Build Graph      - Triggers GitOps
  - Local validation          & linter tests      - Enforces Strict Schema Locks     CD Deployment
```

---

### 1. Code-base Naming Conventions
All code within the monorepo must adhere to strict casing and naming rules:
*   *Directories:* Lowercase with hyphens (e.g., `services/scos-cognitive`).
*   *TypeScript Files:* PascalCase for React components (e.g., `GrievanceMap.tsx`); camelCase for functional helpers (e.g., `spatialUtils.ts`).
*   *Python Files:* SnakeCase (e.g., `hydrology_model.py`).
*   *Constants & Enums:* UPPER_SNAKE_CASE (e.g., `SLA_LIMIT_HOURS = 24`).

---

### 2. High-Performance Branching Strategy
SCOS enforces **Trunk-Based Development** to prevent long-lived branch divergences:
*   **The `main` Trunk:** The single source of truth. It must always be in a deployable, green-build state. Direct pushes to `main` are strictly forbidden.
*   **Short-Lived Feature Branches (`feature/scos-*`):** Developers branch off `main`, complete their isolated task within 48 hours, and submit a Pull Request.
*   **Release Branches (`release/v*`):** Cut from `main` to freeze features for upcoming production pilots. Only critical bug fixes are cherry-picked into these branches.

---

### 3. Strict Semantic Versioning (SemVer)
We use a three-tier semantic versioning system (`MAJOR.MINOR.PATCH`):
*   `PATCH` (e.g., `1.0.1`): Minor bug fixes or internal refactorings that do not modify external API signatures.
*   `MINOR` (e.g., `1.1.0`): Adding new APIs, microservices, or features in a backward-compatible manner.
*   `MAJOR` (e.g., `2.0.0`): Breaking changes in public REST API signatures, gRPC schema contracts, or database schemas.

---

### 4. Advanced Dependency Management
To prevent dependency bloat and security vulnerabilities:
*   **Hermetic Lockfiles:** Yarn/pnpm workspace lockfiles are pinned at the monorepo root. Dependencies cannot be installed globally; they must be registered inside specific service manifests using exact versions.
*   **Automated Audits:** Automated CI workflows run `npm audit` and `safety` (for Python) every 24 hours to flag and alert developers of outdated or vulnerable packages.

---

### 5. Code Ownership & Security Governance
We enforce granular code ownership using the **GitHub CODEOWNERS** protocol:
*   Any PR that modifies a file in a critical microservice (e.g., `services/scos-security-ztsac/`) or a shared API schema (e.g., `shared/schemas/`) **must** be reviewed and approved by designated Lead Security Engineers before merging.
*   Academic directories (`/research`) require approvals from IIT Kanpur faculty supervisors, while deployment manifests (`/deployment`) are guarded by DevOps release teams.

```
# .github/CODEOWNERS
/shared/schemas/              @scos-architects @iitk-faculty
/services/scos-security/     @scos-security-leads
/deployment/                  @scos-devops-leads
/research/                    @iitk-faculty
```

---
*This monorepo structure and engineering governance specification establishes the formal coding standards, release workflows, and directory topologies required to develop, deploy, and scale the Smart City Operating System safely and efficiently across academic research sandboxes and municipal district administrations.*
