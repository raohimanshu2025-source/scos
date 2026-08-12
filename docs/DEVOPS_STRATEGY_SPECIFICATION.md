# DEVOPS STRATEGY & RELEASE ENGINEERING SPECIFICATION
## System: Smart City Operating System (AI-SCOS) for Indian District Administration
### Academic Subtitle: Immutable Multi-Stage Containers, GitOps Deployment Pipelines, Automated Security Gates, and Multi-Environment Lifecycle
**Institution:** Indian Institute of Technology Kanpur (IIT Kanpur)  
**Author:** Director of DevOps Infrastructure & Release Engineering Directorate  

---

## 1. Executive Summary & DevOps Vision

Deploying and maintaining a mission-critical **Smart City Operating System (AI-SCOS)** across 110 municipal wards in Kanpur District requires a resilient, reproducible, and secure DevOps pipeline. At municipal scale, automated integration, zero-downtime container deployments, airtight secret isolation, and shift-left security scanning are essential to prevent service interruptions across municipal infrastructure (water, power, traffic, emergency services).

This **DevOps Strategy & Release Engineering Specification** defines the containerization architecture, multi-environment lifecycle, secret management topologies, automated CI/CD GitHub Actions workflows, container registry policies, and security scanning gates for the entire AI-SCOS monorepo.

---

## 2. Multi-Environment Topology Overview

AI-SCOS operates across three isolated environments to guarantee zero risk to production district administration:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   AI-SCOS MULTI-ENVIRONMENT LIFECYCLE                  │
├────────────────────────────────────────────────────────────────────────┤
│ DEVELOPMENT (Local / Cloud Run Dev)                                   │
│  - Endpoint: https://ais-dev-4xp3i7p3y4yzlsgfvnm3ew-14785415266.run.app │
│  - Port Ingress: Single proxy binding on Port 3000                     │
│  - Database: Local Docker Compose (PostgreSQL, Redis, Keycloak)        │
│  - Trigger: Feature branch commits & PR creation                       │
├────────────────────────────────────────────────────────────────────────┤
│ STAGING (Pre-Production Pilot)                                         │
│  - Endpoint: https://ais-pre-4xp3i7p3y4yzlsgfvnm3ew-14785415266.run.app │
│  - Purpose: Full integration testing, k6 load testing, professor demos │
│  - Database: Managed Cloud SQL PostgreSQL + TimescaleDB (Staging Data) │
│  - Trigger: Merges into `main` branch                                  │
├────────────────────────────────────────────────────────────────────────┤
│ PRODUCTION (Kanpur District Administration Command Center)             │
│  - Endpoint: https://scos.kanpur.gov.in                                │
│  - Purpose: Real-time municipal operations & live SCADA ingestion      │
│  - Database: Highly Available Cloud SQL PostgreSQL + Read Replicas     │
│  - Trigger: Tagged production release (`vX.Y.Z`) with manual approval  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Containerization Strategy (Docker & Docker Compose)

All 12 microservices and frontend portals are containerized using multi-stage `Containerfiles` enforcing least-privilege security, zero unnecessary dependencies, and minimal image layers.

### A. Multi-Stage Container Architecture (Node.js Microservices)
```dockerfile
# Containerfile.backend (Node.js Services)
# Stage 1: Build & Dependencies
FROM node:20.18.0-alpine3.20 AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY shared/ ./shared/
COPY services/scos-citizen/ ./services/scos-citizen/

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @scos/citizen build

# Stage 2: Production Runtime Environment
FROM node:20.18.0-alpine3.20 AS runner
WORKDIR /app

# Non-root security enforcement
RUN addgroup -g 1001 -S scosgroup && adduser -u 1001 -S scosuser -G scosgroup
USER scosuser

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/services/scos-citizen/dist ./dist
COPY --from=builder /app/services/scos-citizen/package.json ./

EXPOSE 3000
CMD ["node", "dist/server.js"]
```

### B. Local Development Environment (`/docker/docker-compose.yml`)
```yaml
version: '3.8'

services:
  scos-postgres:
    image: postgis/postgis:16-3.4-alpine
    container_name: scos-postgres
    environment:
      POSTGRES_DB: scos_dev_db
      POSTGRES_USER: scos_admin
      POSTGRES_PASSWORD: dev_password_123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  scos-redis:
    image: redis:7.2.5-alpine
    container_name: scos-redis
    ports:
      - "6379:6379"

  scos-keycloak:
    image: quay.io/keycloak/keycloak:24.0.4
    container_name: scos-keycloak
    environment:
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: admin_password_123
    command: start-dev
    ports:
      - "8080:8080"

volumes:
  postgres_data:
```

---

## 4. Environment Configuration & Secret Isolation

In compliance with AI Studio runtime constraints and enterprise security standards:

1. **Port Restriction:** The application binds strictly to **Port 3000** on host `0.0.0.0`. All internal services route through an ingress proxy layer on Port 3000.
2. **Environment File Governance:** All environment variables **MUST** be declared in `.env.example`. Secret values (`GEMINI_API_KEY`, `POSTGRES_PASSWORD`, `JWT_SECRET`) are never hardcoded or committed to Git.
3. **Secrets Injection:** Production secrets are injected into container runtimes at launch via GCP Secret Manager or Cloud Run Environment Variables.
4. **Client-Side Secret Shielding:** No sensitive keys are exposed to client browsers. Only variables prefixed with `VITE_` are exposed to the frontend single-page app.

---

## 5. GitHub Actions Continuous Integration (CI) Pipeline

Every pull request or push to feature branches triggers the automated **CI Quality & Security Gate Pipeline** (`.github/workflows/ci-pipeline.yml`).

```yaml
name: AI-SCOS CI Quality & Security Pipeline

on:
  push:
    branches: [ main, 'feature/**' ]
  pull_request:
    branches: [ main ]

jobs:
  lint-and-typecheck:
    name: Lint & Type Validation
    runs-on: ubuntu-22.04
    steps:
      - name: Checkout Code Repository
        uses: actions/checkout@v4.1.7

      - name: Setup Node.js Runtime (20.18.0)
        uses: actions/setup-node@v4.0.3
        with:
          node-version: '20.18.0'

      - name: Enable Corepack & Install Dependencies
        run: |
          corepack enable
          pnpm install --frozen-lockfile

      - name: Execute Code Linter
        run: pnpm lint

      - name: Execute TypeScript Compiler Verification
        run: pnpm typecheck

  unit-and-integration-test:
    name: Automated Unit & Integration Testing
    needs: lint-and-typecheck
    runs-on: ubuntu-22.04
    steps:
      - name: Checkout Code Repository
        uses: actions/checkout@v4.1.7

      - name: Setup Node.js Runtime
        uses: actions/setup-node@v4.0.3
        with:
          node-version: '20.18.0'

      - name: Install Dependencies
        run: |
          corepack enable
          pnpm install --frozen-lockfile

      - name: Run Unit Tests
        run: pnpm test:unit

  security-vulnerability-scan:
    name: Container & Secret Security Scanning
    needs: lint-and-typecheck
    runs-on: ubuntu-22.04
    steps:
      - name: Checkout Code Repository
        uses: actions/checkout@v4.1.7

      - name: Secret Leak Scan (GitGuardian)
        uses: GitGuardian/ggshield-action@v1.27.0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          GITGUARDIAN_API_KEY: ${{ secrets.GITGUARDIAN_API_KEY }}

      - name: Vulnerability & Dependency Scan (Trivy)
        uses: aquasecurity/trivy-action@0.20.0
        with:
          scan-type: 'fs'
          ignore-unfixed: true
          severity: 'CRITICAL,HIGH'
```

---

## 6. Continuous Deployment (CD) Pipeline & GitOps Flow

When code passes CI checks and is merged into the `main` branch, the **CD Deployment Pipeline** triggers automatically to deploy updated services to Staging and Production.

```
┌────────────────────────────────────────────────────────────────────────┐
│                       AUTOMATED CD GITOPS PIPELINE                     │
├────────────────────────────────────────────────────────────────────────┤
│ 1. Git Merge / Release Tag Trigger                                     │
│     │                                                                  │
│ 2. Multi-Stage Docker Image Build (with build-kit caching)             │
│     │                                                                  │
│ 3. Vulnerability Scan of Built Container Image (Trivy)                 │
│     │                                                                  │
│ 4. Push Image to Google Artifact Registry (GAR)                        │
│     │  - Location: asia-south1-docker.pkg.dev/scos-kanpur/app/service   │
│     │                                                                  │
│ 5. Automated Database Schema Migration Execution (Drizzle Kit)          │
│     │                                                                  │
│ 6. Zero-Downtime Rolling Deployment to Cloud Run Container Instances   │
│     │                                                                  │
│ 7. Automated Synthetic Health Check Verification (/health/readiness)    │
│     │                                                                  │
│ 8. Slack / Teams Notification to IIT Kanpur DevOps Engineering Team    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Container Registry & Artifact Strategy

*   **Registry Engine:** Google Artifact Registry (GAR) hosted in `asia-south1` (Mumbai region for ultra-low latency).
*   **Tagging Convention:**
    *   *Staging:* `asia-south1-docker.pkg.dev/scos-kanpur/apps/<service-name>:sha-<commit-hash>`
    *   *Production:* `asia-south1-docker.pkg.dev/scos-kanpur/apps/<service-name>:vX.Y.Z`
*   **Image Cleanup Policy:** Retain the latest 10 production release tags and automatically prune untagged staging builds older than 14 days.

---

## 8. Summary of Quality Gates & Security Mandates

| Quality Gate | Tool / Engine | Success Criterion | Action on Failure |
| :--- | :--- | :--- | :--- |
| **Code Formatting** | Prettier `3.3.3` | 100% compliant formatting | Build fails immediately |
| **Static Code Analysis** | ESLint `8.57.0` | Zero errors, zero warnings | PR merge blocked |
| **Type Checking** | TypeScript `5.4.5` | Zero `any` types, zero compiler errors | PR merge blocked |
| **Secret Leak Detection** | GitGuardian / TruffleHog | Zero detected API keys or passwords | Immediate commit block & secret revocation |
| **Container Vulnerability**| Aquasec Trivy | Zero `CRITICAL` or `HIGH` CVEs | Image push blocked |
| **E2E Integration** | Cypress / Playwright | 100% pass rate across core workflows | Staging deployment blocked |
| **Performance Benchmark** | k6 Load Testing | Sub-200ms REST API latency at 100 req/sec | Performance regression warning |

---
*This DevOps Strategy & Release Engineering Specification establishes the complete containerization, CI/CD, security scanning, and multi-environment deployment framework for the Smart City Operating System.*
