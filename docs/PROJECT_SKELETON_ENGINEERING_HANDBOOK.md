# PROJECT SKELETON & ENGINEERING HANDBOOK
## System: Smart City Operating System (AI-SCOS) for Indian District Administration
### Academic Subtitle: Complete Workspace Directory Topology, Folder Responsibilities, Naming Standards, and Module Ownership Matrix
**Institution:** Indian Institute of Technology Kanpur (IIT Kanpur)  
**Author:** Principal Workspace Architect & Engineering Leadership Council  

---

## 1. Executive Summary & Repository Blueprint

The **Smart City Operating System (AI-SCOS)** is engineered as a enterprise-grade polyglot monorepo. At district scale, managing 12 microservices, a GPU 3D GIS Digital Twin, LangGraph cognitive AI agents, real-time WebSocket meshes, and a cryptographically verifiable SHA-256 audit ledger requires strict directory boundaries and absolute folder ownership.

This **Project Skeleton Engineering Handbook** serves as the definitive reference guide for all developers, researchers, systems engineers, and QA personnel. It defines the exact purpose, file layout, naming conventions, architectural responsibilities, and team ownership across all **15 core root directories**.

---

## 2. Global Monorepo Directory Layout

```
/ (AI-SCOS Workspace Root)
├── frontend/             # Single-Page App & Mobile Progressive Web Apps
├── backend/              # Core API Gateway & Monolithic Orchestrator Fallbacks
├── shared/               # Universal Types, Zod DTOs, & Cross-Layer Utilities
├── packages/             # Internal Shared Libraries (Auth, Spatial, UI Components)
├── services/             # Polyglot Microservices (Node.js, Python, FastAPI)
├── configs/              # Centralized Build, Lint, & Tooling Configurations
├── docker/               # Containerfiles, Compose Topologies, & Base Images
├── .github/              # CI/CD Workflows, Issue Templates, & Security Policies
├── docs/                 # Architectural Specs, IEEE Standards, & Thesis Papers
├── research/             # Academic Benchmarks, Experimental Notebooks, & Papers
├── database/             # Drizzle Schemas, PostGIS Migrations, & Neo4j Cypher Scripts
├── deployment/           # Helm Charts, ArgoCD GitOps Manifests, & K8s Topologies
├── datasets/             # Municipal GIS Shapefiles, Kanpur Benchmarks, & Seed Data
├── testing/              # End-to-End Cypress Suites, k6 Load Tests, & Mock Data
└── scripts/              # Local Dev Bootstrap, DB Seed, & Operational Tooling
```

---

## 3. Directory Specification Manual (15 Core Folders)

---

### 1. `frontend/`
*   **Purpose:** Houses client-side Web and Mobile Progressive Web Applications (PWAs) providing user interfaces for Citizens, Department Supervisors, Field Crews, Emergency Dispatchers, and Executive Leadership.
*   **Expected Files & Subdirectories:**
    ```
    frontend/
    ├── public/               # Favicons, PWA manifest.json, GeoJSON static caches
    ├── src/
    │   ├── assets/           # Vector icons, SVG logos, map markers
    │   ├── components/       # Atom/Molecule UI components (Button, Modal, Card)
    │   ├── features/         # Feature-based domain views (citizen-ingress, gis-map, ai-command)
    │   ├── hooks/            # Custom React hooks (useWebSocket, useGeoLocation)
    │   ├── pages/            # Page route entrypoints
    │   ├── services/         # Axios/Fetch API client adapters
    │   ├── store/            # Zustand global state slices
    │   ├── types/            # Component-level React prop interface types
    │   ├── App.tsx           # Primary application root layout
    │   └── main.tsx          # Vite React entrypoint
    ├── index.html            # HTML5 single-page application template
    ├── package.json          # Frontend dependencies (React, Vite, Motion, Maplibre)
    └── vite.config.ts        # Vite build & dev proxy configuration
    ```
*   **Naming Conventions:**
    *   *Components/Pages:* PascalCase (e.g., `GrievanceCard.tsx`, `AiCommandConsole.tsx`).
    *   *Hooks/Utilities:* camelCase with `use` prefix (e.g., `useWebSocket.ts`, `useSpatialQuery.ts`).
    *   *Styles:* Tailwind CSS utility classes directly in JSX.
*   **Responsibilities:** Rendering responsive UI viewports, GPU map rendering (Maplibre GL JS + Deck.gl), local IndexedDB state buffering for offline PWA sync, and real-time WebSocket state handling.
*   **Ownership:** Lead Frontend Engineer & UX/UI Design Directorate.

---

### 2. `backend/`
*   **Purpose:** Provides the primary Express/FastAPI monolithic orchestrator, API Gateway proxy, and legacy HTTP route handlers prior to full microservice extraction.
*   **Expected Files & Subdirectories:**
    ```
    backend/
    ├── src/
    ├── controllers/      # HTTP REST request/response route controllers
    ├── middleware/       # Keycloak JWT verification, rate-limiting, CORS, error handling
    ├── routes/           # Express router declarations (/api/v1/*)
    ├── services/         # Core business logic service wrappers
    ├── utils/            # JWT decoders, string formatters, hash calculators
    ├── server.ts         # Main backend server entrypoint
    ├── package.json      # Node.js Express backend dependencies
    └── tsconfig.json     # TypeScript backend configuration
    ```
*   **Naming Conventions:**
    *   *Controllers/Routes:* kebab-case with descriptive suffix (e.g., `citizen-controller.ts`, `grievance-routes.ts`).
    *   *Middlewares:* kebab-case (e.g., `jwt-auth.middleware.ts`, `rate-limiter.middleware.ts`).
*   **Responsibilities:** Reverse proxying API requests, enforcing rate limits, initial authentication header validation, and orchestrating fallback route handling.
*   **Ownership:** Senior Backend Systems Architect & Gateway Engineering Team.

---

### 3. `shared/`
*   **Purpose:** Contains cross-layer TypeScript types, Zod DTO validation schemas, and universal utility functions shared seamlessly between client frontends and backend services.
*   **Expected Files & Subdirectories:**
    ```
    shared/
    ├── src/
    │   ├── contracts/    # Zod payload contracts (GrievanceDTO, DispatchApprovalDTO)
    │   ├── constants/    # Municipal status enums, HTTP status codes, error identifiers
    │   ├── types/        # TypeScript global interface definitions (User, Ward, Ticket)
    │   ├── utils/        # SHA-256 hash chaining, date formatters, sanitizers
    │   └── index.ts      # Main barrel export
    ├── package.json      # Shared package manifest
    └── tsconfig.json     # TypeScript library config
    ```
*   **Naming Conventions:**
    *   *Types/Contracts:* PascalCase with `DTO` or `Type` suffix (e.g., `CreateGrievanceDTO.ts`, `UserRoleType.ts`).
    *   *Constants:* UPPER_SNAKE_CASE exports inside camelCase files.
*   **Responsibilities:** Guaranteeing zero-drift type safety across API boundaries, unifying Zod runtime payload validation, and providing shared hashing algorithms.
*   **Ownership:** Lead Software Architect & Monorepo Governance Committee.

---

### 4. `packages/`
*   **Purpose:** Houses modular internal libraries and SDKs that encapsulate specific operational domain capabilities across microservices.
*   **Expected Files & Subdirectories:**
    ```
    packages/
    ├── auth-client/      # Keycloak OIDC client library & JWT parsing utilities
    ├── spatial-utils/    # PostGIS distance & Uber H3 spatial index wrapper functions
    ├── ui-components/    # Reusable shadcn/Tailwind component primitives
    ├── logger/           # Structured JSON logger with PII masking rules
    └── event-bus/        # Redis Pub/Sub & WebSockets event client wrappers
    ```
*   **Naming Conventions:**
    *   *Package Folders:* kebab-case prefixed with `@scos/` in package.json (e.g., `@scos/auth-client`).
    *   *Source Files:* camelCase or PascalCase matching export type.
*   **Responsibilities:** Isolating reusable domain utilities, standardizing authentication enforcement, and enforcing modular code reuse.
*   **Ownership:** Monorepo Engineering Core & Shared Library Maintainers.

---

### 5. `services/`
*   **Purpose:** Encapsulates independent, domain-driven polyglot microservices operating within distinct bounded contexts.
*   **Expected Files & Subdirectories:**
    ```
    services/
    ├── scos-citizen/     # Node.js/Fastify citizen grievance ingress & tracking API
    ├── scos-user/        # User profile, role management & shift roster service
    ├── scos-dept/        # Department boundary & inventory tracking service
    ├── scos-twin/        # Python/FastAPI PostGIS + Neo4j GIS Digital Twin engine
    ├── scos-cognitive/   # Python LangGraph + Gemini 2.5 Multi-Agent Cognitive engine
    ├── scos-scheduler/   # Node.js Temporal.io workflow worker service
    ├── scos-ingestion/   # WebSockets gateway (Port 3000) & SCADA ingestion service
    ├── scos-analytics/   # TimescaleDB time-series BI aggregation service
    ├── scos-reports/     # Node.js Puppeteer PDF compilation service
    └── scos-audit/       # SHA-256 append-only cryptographic ledger service
    ```
*   **Naming Conventions:**
    *   *Service Folders:* kebab-case with `scos-` prefix.
    *   *Service Code:* Clean Architecture structure (`domain/`, `application/`, `infrastructure/`).
*   **Responsibilities:** Executing specific business domain workflows, processing async event messages, and managing bounded data stores.
*   **Ownership:** Domain Lead Engineers (Backend, AI/ML, GIS, and Data Engineering leads).

---

### 6. `configs/`
*   **Purpose:** Centralizes root-level tool configurations, linter rule sets, code style guidelines, and build compiler settings.
*   **Expected Files & Subdirectories:**
    ```
    configs/
    ├── eslint/           # Base ESLint rule sets (.eslintrc.base.js)
    ├── typescript/       # Shared tsconfig settings (tsconfig.base.json, tsconfig.node.json)
    ├── tailwind/         # Tailwind CSS preset themes & design tokens
    └── prettier/         # Standard formatting rule sets (.prettierrc)
    ```
*   **Naming Conventions:**
    *   *Folder/File Names:* lowercase kebab-case (e.g., `tsconfig.base.json`).
*   **Responsibilities:** Enforcing universal code quality standards, reducing configuration duplication, and simplifying package setup.
*   **Ownership:** DevOps & Software Quality Assurance Directorate.

---

### 7. `docker/`
*   **Purpose:** Contains multi-stage Containerfiles, base image definitions, and Docker Compose deployment manifests for local development and staging environments.
*   **Expected Files & Subdirectories:**
    ```
    docker/
    ├── docker-compose.yml       # Local development stack (PostgreSQL, Keycloak, Redis)
    ├── docker-compose.prod.yml  # Production container stack topology
    ├── Containerfile.frontend   # Multi-stage Nginx build for React frontend
    ├── Containerfile.backend    # Node.js backend container definition
    ├── Containerfile.python     # Python FastAPI/LangGraph container definition
    └── envoy/                   # Reverse proxy routing configurations
    ```
*   **Naming Conventions:**
    *   *Containerfiles:* PascalCase `Containerfile.<service-name>` or `Dockerfile.<service-name>`.
    *   *Compose Files:* `docker-compose.<env>.yml`.
*   **Responsibilities:** Guaranteeing reproducible, isolated runtime environments across development, testing, and production clusters.
*   **Ownership:** DevOps Infrastructure & Container Security Team.

---

### 8. `.github/`
*   **Purpose:** Houses GitHub Actions CI/CD workflows, issue templates, pull request checklists, and security policy definitions.
*   **Expected Files & Subdirectories:**
    ```
    .github/
    ├── workflows/
    │   ├── ci-pipeline.yml     # Automated build, lint, & unit test workflow
    │   ├── security-scan.yml   # Trivy container & GitGuardian secret scan
    │   └── e2e-testing.yml     # Nightly Cypress & k6 performance test workflow
    ├── ISSUE_TEMPLATE/         # Bug report & feature request templates
    ├── PULL_REQUEST_TEMPLATE.md# Mandatory DoD PR submission checklist
    └── CODEOWNERS              # Codebase file ownership mapping definitions
    ```
*   **Naming Conventions:**
    *   *Workflows:* lowercase kebab-case `.yml` files.
*   **Responsibilities:** Automating continuous integration, enforcing quality gates before merge, scanning for security vulnerabilities, and assigning PR reviews.
*   **Ownership:** Release Engineering & Delivery Governance Directorate.

---

### 9. `docs/`
*   **Purpose:** Stores technical architecture specifications, IEEE requirements documents, API handbooks, user story matrices, and thesis evaluation reports.
*   **Expected Files & Subdirectories:**
    ```
    docs/
    ├── AGILE_SPRINT_ROADMAP.md             # 20-Sprint Delivery Execution Plan
    ├── API_HANDBOOK.md                      # OpenAPI 3.1 & RFC 7807 Handbook
    ├── CODE_GENERATION_STANDARDS.md         # Code style & line limit rules
    ├── DEFINITION_OF_DONE.md               # 15 DoD criteria & quality gates
    ├── DEMO_ROADMAP.md                     # 6-Stage Professor Review Roadmap
    ├── MODULE_DEPENDENCY_GRAPH.md          # 12-Stage Topological Build Sequence
    ├── MVP_PRODUCT_SPECIFICATION.md        # M.Tech Thesis MVP Scope Defs
    ├── PROJECT_SKELETON_ENGINEERING_HANDBOOK.md # This Engineering Handbook
    ├── THESIS_COMMITTEE_EVALUATION_REPORT.md# Formal IIT Kanpur Evaluation Report
    └── USER_STORIES.md                     # 10-Persona Stakeholder Matrix
    ```
*   **Naming Conventions:**
    *   *Documentation Files:* UPPER_SNAKE_CASE markdown files (`.md`).
*   **Responsibilities:** Serving as the single source of architectural truth, preserving design decisions (ADRs), and maintaining complete thesis documentation.
*   **Ownership:** Lead System Architect & Academic Research Scholar.

---

### 10. `research/`
*   **Purpose:** Contains academic benchmarking scripts, quantitative evaluation plots, experimental Jupyter notebooks, and thesis research manuscript drafts.
*   **Expected Files & Subdirectories:**
    ```
    research/
    ├── benchmarks/       # Python scripts measuring translation & negotiation latency
    ├── notebooks/        # Jupyter notebooks analyzing WPACS algorithm convergence
    ├── datasets/         # Anonymized municipal benchmark evaluation datasets
    ├── paper/            # LaTeX / Markdown thesis manuscript chapters
    └── plots/            # Generated vector charts (ANOVA, latency distribution)
    ```
*   **Naming Conventions:**
    *   *Notebooks/Scripts:* snake_case with descriptive suffix (e.g., `wpacs_convergence_test.ipynb`).
    *   *Manuscripts:* Standard LaTeX document naming conventions.
*   **Responsibilities:** Storing reproducible research artifacts, evaluating experimental hypotheses, and generating academic publication graphics.
*   **Ownership:** M.Tech Research Scholar & Faculty Advisory Panel.

---

### 11. `database/`
*   **Purpose:** Manages relational Drizzle schemas, PostGIS spatial migration SQL scripts, TimescaleDB hypertable setups, and Neo4j Cypher graph population scripts.
*   **Expected Files & Subdirectories:**
    ```
    database/
    ├── postgres/
    │   ├── migrations/   # Auto-generated Drizzle SQL migration files
    │   ├── schema/       # TypeScript Drizzle table definitions
    │   └── seeds/        # Initial ward and municipal department seed data
    ├── timescaledb/      # SCADA telemetry hypertable SQL setup scripts
    └── neo4j/            # Cypher graph schema & asset relationship seeds
    ```
*   **Naming Conventions:**
    *   *Migrations:* Timestamped files (e.g., `0001_initial_schema.sql`).
    *   *Schemas:* PascalCase TypeScript schema files (e.g., `UsersSchema.ts`).
*   **Responsibilities:** Standardizing database migration execution, maintaining schema state versions, and seeding initial infrastructure topology.
*   **Ownership:** Lead Database Engineer & Spatial Data Architect.

---

### 12. `deployment/`
*   **Purpose:** Stores Kubernetes deployment manifests, Helm charts, and ArgoCD GitOps configurations for staging and production Cloud Run / K8s clusters.
*   **Expected Files & Subdirectories:**
    ```
    deployment/
    ├── helm/             # Helm chart templates for all 12 microservices
    ├── argocd/           # ArgoCD GitOps application & cluster configs
    ├── k8s/              # Raw Kubernetes YAML manifests (Services, Ingress, HPA)
    └── terraform/        # Infrastructure-as-Code scripts for GCP Cloud Run
    ```
*   **Naming Conventions:**
    *   *K8s Manifests:* kebab-case with resource type (e.g., `scos-citizen.deployment.yaml`).
*   **Responsibilities:** Enabling automated GitOps deployments, defining cluster resource limits, and orchestrating horizontal pod autoscaling (HPA).
*   **Ownership:** DevOps Lead & Cloud Infrastructure Engineering Team.

---

### 13. `datasets/`
*   **Purpose:** Stores public domain municipal GIS shapefiles, Kanpur district ward geometries, SCADA sensor benchmarks, and sample citizen grievance test data.
*   **Expected Files & Subdirectories:**
    ```
    datasets/
    ├── kanpur_wards.geojson     # Kanpur District ward polygon geometries
    ├── utility_networks.json    # Sample water and electrical network topology
    ├── hinglish_phrases.json    # Benchmark dataset of 500 Hinglish complaint phrases
    └── scada_samples/           # Sample time-series water pressure sensor logs
    ```
*   **Naming Conventions:**
    *   *Data Files:* snake_case or kebab-case `.json` / `.geojson` files.
*   **Responsibilities:** Providing consistent test data for local development, GIS spatial index rendering, and AI translation benchmarks.
*   **Ownership:** GIS Data Analyst & Research Assistant Team.

---

### 14. `testing/`
*   **Purpose:** Houses end-to-end Cypress/Playwright web testing suites, k6 load testing scripts, mock API servers, and automated regression runners.
*   **Expected Files & Subdirectories:**
    ```
    testing/
    ├── cypress/          # Cypress E2E user workflow test scripts
    ├── k6/               # k6 load testing scripts (simulating 2,000 concurrent users)
    ├── mocks/            # Mock server responses for external APIs (Aadhaar, SCADA)
    └── fixtures/         # Test fixture payloads for integration testing
    ```
*   **Naming Conventions:**
    *   *Test Files:* kebab-case with `.spec.ts` or `.test.ts` extension (e.g., `citizen-ingress.spec.ts`).
*   **Responsibilities:** Executing automated regression testing, benchmarking API response latencies under load, and verifying E2E user flows.
*   **Ownership:** QA Lead & Automated Testing Engineers.

---

### 15. `scripts/`
*   **Purpose:** Contains developer utility scripts for bootstrapping local workspace environments, seeding databases, resetting test clusters, and compiling releases.
*   **Expected Files & Subdirectories:**
    ```
    scripts/
    ├── dev-setup.sh      # One-click developer workspace setup script
    ├── seed-db.ts        # Database seeding utility for PostgreSQL & Neo4j
    ├── generate-docs.ts  # Auto-generates OpenAPI specs & TypeScript docs
    └── build-all.sh      # Monorepo release build script
    ```
*   **Naming Conventions:**
    *   *Executable Scripts:* kebab-case shell scripts (`.sh`) or TypeScript scripts (`.ts`).
*   **Responsibilities:** Streamlining local developer onboarding, automating repetitive tasks, and executing release generation tasks.
*   **Ownership:** Monorepo Core Maintainers & Developer Experience (DX) Team.

---

## 4. Master Directory Ownership Matrix

| # | Directory Name | Primary Responsibility | Lead Owner | Secondary Maintainer |
| :-: | :--- | :--- | :--- | :--- |
| **01** | `frontend/` | UI Portals, PWA, Maplibre GL Map Canvas | Lead Frontend Engineer | UX/UI Specialist |
| **02** | `backend/` | Monolithic Gateway, Fallback Routers | Senior Backend Lead | API Gateway Engineer |
| **03** | `shared/` | Cross-Layer Zod DTOs & TypeScript Types | Lead Software Architect | Monorepo Maintainer |
| **04** | `packages/` | Internal Shared Libraries & SDKs | Core Engineering Lead | Security Specialist |
| **05** | `services/` | Bounded Polyglot Microservices | Domain Microservice Leads | Backend Engineering Team |
| **06** | `configs/` | Universal Linter, Tooling & Build Configs | DevOps Lead | QA Lead |
| **07** | `docker/` | Containerfiles & Local Compose Topology | Infrastructure Engineer | DevOps Lead |
| **08** | `.github/` | CI/CD Workflows, DoD Gates & CODEOWNERS | Release Engineer | Security Lead |
| **09** | `docs/` | System Specifications & Thesis Manuscripts | Lead System Architect | M.Tech Research Scholar |
| **10** | `research/` | Academic Benchmarks & Evaluation Notebooks | M.Tech Research Scholar | Faculty Advisor |
| **11** | `database/` | Drizzle Schemas, PostGIS & Neo4j Scripts | Database Architect | GIS Data Engineer |
| **12** | `deployment/` | Helm Charts, K8s Manifests & ArgoCD GitOps | Cloud DevOps Engineer | Infrastructure Lead |
| **13** | `datasets/` | GIS Ward Geometries & Benchmark Datasets | GIS Analyst | Research Assistant |
| **14** | `testing/` | Cypress E2E & k6 Load Testing Suites | QA Automation Lead | Test Engineer |
| **15** | `scripts/` | DX Setup Scripts & Monorepo Tooling | Developer Experience Lead | DevOps Team |

---
*This Project Skeleton Engineering Handbook establishes the complete workspace topology, directory boundaries, file layout conventions, and ownership matrix across all 15 root folders of the Smart City Operating System.*
