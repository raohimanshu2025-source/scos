# DEVELOPER ONBOARDING & QUICKSTART GUIDE
## System: Smart City Operating System (AI-SCOS) for Indian District Administration
### Academic Subtitle: Zero-to-Contribution Setup Manual for Engineers, Researchers, and System Developers
**Institution:** Indian Institute of Technology Kanpur (IIT Kanpur)  
**Author:** Developer Experience (DX) Group & Core Systems Engineering Council  

---

## 1. Executive Summary & Objective

Welcome to the **Smart City Operating System (AI-SCOS)** development team! AI-SCOS is an enterprise-grade urban operating system built to unify municipal governance across 110 wards in Kanpur District.

This **Developer Onboarding & Quickstart Guide** is designed to take a new software engineer, researcher, or contributor from a fresh workstation setup to running the full monorepo stack, executing test suites, and submitting their first pull request **in under 60 minutes**.

---

## 2. Prerequisites & Software Requirements

Before bootstrapping your local environment, ensure your workstation meets the following hardware and software requirements:

### Hardware Specifications:
*   **CPU:** x86_64 or Apple Silicon (M1/M2/M3) — minimum 4 cores (8 cores recommended).
*   **RAM:** 16 GB minimum (32 GB recommended for running full Docker Compose microservices stack).
*   **Disk:** 20 GB available SSD storage space.

### Software Toolchain Matrix:
| Software Tool | Required Version | Purpose | Verification Command |
| :--- | :--- | :--- | :--- |
| **Node.js** | `20.18.0` (LTS) | JavaScript/TypeScript Runtime Engine | `node -v` |
| **pnpm** | `9.12.0` | Monorepo Package Manager | `pnpm -v` |
| **Python** | `3.11.9` | AI Cognitive Engine & GIS Tooling | `python3 --version` |
| **Docker Engine** | `26.1.4+` | Container Virtualization | `docker --version` |
| **Docker Compose** | `2.27.1+` | Multi-container Local Infrastructure | `docker compose version` |
| **Git** | `2.40.0+` | Version Control System | `git --version` |

---

## 3. Step-by-Step Installation & Setup (Under 15 Mins)

### Step 1: Clone the Monorepo Repository
```bash
git clone https://github.com/iitk-cse/ai-scos-monorepo.git
cd ai-scos-monorepo
```

### Step 2: Configure Node.js & pnpm
Use `nvm` (Node Version Manager) to switch to the exact required Node version, then enable `corepack`:
```bash
nvm install 20.18.0
nvm use 20.18.0
corepack enable
corepack prepare pnpm@9.12.0 --activate
```

### Step 3: Install Monorepo Dependencies
Install all packages across the root, shared contracts, packages, frontend, and microservices in one command:
```bash
pnpm install --frozen-lockfile
```

---

## 4. Environment Configuration Setup

AI-SCOS employs strict environment variable validation (`/src/config/env.config.ts`) that fails fast if required configurations are missing.

### Step 1: Copy Environment Template
```bash
cp .env.example .env
```

### Step 2: Review `.env` Values
The default `.env` file comes pre-configured for local Docker development:
```env
# Server-Side Core Runtime Configuration
NODE_ENV=development
PORT=3000
HOST=0.0.0.0
LOG_LEVEL=debug

# Relational & Spatial Database
DATABASE_URL=postgresql://scos_admin:dev_password_123@localhost:5432/scos_dev_db

# Event Bus & Caching
REDIS_URL=redis://localhost:6379

# Authentication & Keycloak Identity Provider
KEYCLOAK_ISSUER_URL=http://localhost:8080/realms/scos
KEYCLOAK_CLIENT_ID=scos-web-client

# Optional AI Gemini API Key (For Cognitive Agent Workflows)
GEMINI_API_KEY=

# Frontend Public Configuration
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

---

## 5. Local Infrastructure Bootstrap (Docker Compose)

Launch local instance of PostgreSQL with PostGIS, TimescaleDB, Redis, and Keycloak IAM using Docker Compose:

### Step 1: Spin Up Containers
```bash
docker compose -f docker/docker-compose.yml up -d
```

### Step 2: Verify Container Health
```bash
docker compose -f docker/docker-compose.yml ps
```
*Expected Output:* All three containers (`scos-postgres`, `scos-redis`, `scos-keycloak`) should show status `Up (healthy)`.

### Step 3: Run Database Migrations & Seed Initial District Data
Execute Drizzle ORM migrations and seed initial Kanpur District ward polygons, departments, and test users:
```bash
# Execute PostGIS schema migrations
pnpm db:migrate

# Seed initial Kanpur district wards and benchmark tickets
pnpm db:seed
```

---

## 6. Running the Local Development Servers

AI-SCOS runs seamlessly in local development mode using Vite and Node tsx.

### Option A: Launch Full Monorepo Application Stack
Runs backend services and the frontend portal concurrently with unified logging:
```bash
pnpm dev
```
*   **Web Portal Access:** Open [http://localhost:3000](http://localhost:3000) in your browser.
*   **API Health Status:** Open [http://localhost:3000/health/readiness](http://localhost:3000/health/readiness).

### Option B: Launch Specific Workspace Packages Individually
```bash
# Run Frontend Single-Page App only
pnpm --filter @scos/frontend dev

# Run Backend Gateway Service only
pnpm --filter @scos/backend dev

# Run Python AI Cognitive Service (FastAPI)
cd services/scos-cognitive && poetry run uvicorn main:app --reload --port 8000
```

---

## 7. Testing, Linting & Quality Verification

Before submitting any code changes, you **MUST** run the automated verification suite to pass the CI quality gates:

### Step 1: Code Linting & Formatting Check
```bash
# Run ESLint across monorepo
pnpm lint

# Format code with Prettier
pnpm format
```

### Step 2: TypeScript Type-Safety Check
```bash
pnpm typecheck
```

### Step 3: Run Unit & Integration Tests
```bash
# Run Jest / Vitest unit tests
pnpm test

# Run spatial calculation utility tests
pnpm --filter @scos/spatial-utils test
```

---

## 8. Building for Production

Verify that your changes compile successfully into production bundles:
```bash
pnpm build
```
This executes Vite build for frontend static assets into `dist/` and compiles backend server code via esbuild into `dist/server.cjs`.

---

## 9. Troubleshooting & Common Issues

| Issue / Symptom | Root Cause | Resolution Strategy |
| :--- | :--- | :--- |
| **`FATAL: Environment Configuration Validation Failed`** | Missing or malformed keys in `.env`. | Compare `.env` against `.env.example` and ensure all required non-empty string variables are present. |
| **`Error: connect ECONNREFUSED 127.0.0.1:5432`** | PostgreSQL Docker container is not running. | Run `docker compose -f docker/docker-compose.yml up -d` and check status with `docker ps`. |
| **`Type error: Type 'any' is not assignable to...`** | Violation of zero `any` type rule in `/docs/CODE_GENERATION_STANDARDS.md`. | Replace `any` with explicit TypeScript interface or `unknown` with runtime type guard. |
| **`Vite failed to connect to websocket`** | Normal behavior in sandboxed container environment. | Ignore this message; HMR is disabled by design in the platform environment. |
| **`Port 3000 is already in use`** | Another node process is holding port 3000. | Run `lsof -i :3000` or `fuser -k 3000/tcp` to free port 3000. |

---

## 10. Developer Onboarding Checklist (<60 Mins)

- [x] Installed Node.js `20.18.0`, pnpm `9.12.0`, Python `3.11.9`, and Docker Engine.
- [x] Cloned repository and executed `pnpm install --frozen-lockfile`.
- [x] Copied `.env.example` to `.env`.
- [x] Launched local Docker Compose infrastructure (`scos-postgres`, `scos-redis`).
- [x] Ran database migrations (`pnpm db:migrate`) and seeded test data (`pnpm db:seed`).
- [x] Started local development stack with `pnpm dev` and accessed `http://localhost:3000`.
- [x] Passed code verification tools (`pnpm lint`, `pnpm typecheck`, `pnpm test`).
- [x] Read `/docs/CODE_GENERATION_STANDARDS.md` and prepared for feature submission!

---
*This Developer Onboarding & Quickstart Guide provides complete, step-by-step instructions for getting new engineers up and running on the Smart City Operating System workspace in under 60 minutes.*
