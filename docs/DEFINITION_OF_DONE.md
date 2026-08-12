# ENTERPRISE DEFINITION OF DONE (DoD) & QUALITY GATE GOVERNANCE
## System: Smart City Operating System (SCOS / AI-SCOS) for Indian District Administration
### Academic Subtitle: Continuous Verification Topologies, Strict Quality Gates, and Research Artifact Validation Protocols
**Institution:** Indian Institute of Technology Kanpur (IIT Kanpur)  
**Author:** Office of the Chief Software Architect & Quality Assurance Governance Directorate  

---

## Executive Summary

At city scale, software flaws, security oversights, unverified AI models, or incomplete documentation can cause severe real-world consequences—ranging from failed emergency dispatches and municipal data leaks to unrepeatable academic research claims.

The **AI-SCOS Definition of Done (DoD)** establishes an absolute, non-negotiable quality framework. No pull request (PR), feature branch, microservice endpoint, AI agent workflow, or UI component can be marked as `DONE` or merged into the production `main` branch unless it strictly satisfies all **15 Mandatory Governance Criteria** and passes through **5 Automated Quality Gates**.

---

## The 5 Sequential Quality Gates

Before any code increment is accepted, it must traverse five sequential quality gates:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        QUALITY GATE PIPELINE                           │
├────────────────────────────────────────────────────────────────────────┤
│ GATE 1: Code & Static Analysis Audit (tsc, eslint, SonarQube)           │
│   │                                                                    │
│   ▼                                                                    │
│ GATE 2: Comprehensive Test Verification (Unit, Integration, E2E)     │
│   │                                                                    │
│   ▼                                                                    │
│ GATE 3: Security, Privacy & Cryptographic Audit (Trivy, OWASP, Secret) │
│   │                                                                    │
│   ▼                                                                    │
│ GATE 4: Performance, Scalability & A11y Audit (k6, WebGL, WCAG)        │
│   │                                                                    │
│   ▼                                                                    │
│ GATE 5: AI Safety, Research & Documentation Validation (JSDoc, Thesis) │
└────────────────────────────────────────────────────────────────────────┘
```

---

## The 15 Mandatory DoD Verification Criteria

Every single feature developed within the AI-SCOS monorepo must satisfy the following 15 criteria in full:

---

### 1. Code Review Protocols
*   **Peer Approvals:** Requires a minimum of **two approvals** from designated CODEOWNERS before merging into `main`.
*   **Style & Limits Compliance:** Code must adhere strictly to `/docs/CODE_GENERATION_STANDARDS.md`. React components must not exceed **250 lines of code**; backend functions must not exceed **50 lines of code**.
*   **Clean History:** Commits must follow Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`) and be squashed cleanly prior to merge.

---

### 2. Testing Coverage
*   **Line & Branch Coverage:** Minimum **80% statement coverage** and **75% branch coverage** across all newly created modules.
*   **Zero Regression Policy:** All existing test suites across the monorepo must pass with 100% success rate (`0` failing tests).

---

### 3. Comprehensive Documentation
*   **In-Code JSDoc:** All public classes, interfaces, hooks, and service functions must be documented using standard JSDoc/TSDoc notation.
*   **Architectural Decision Records (ADR):** Any change modifying database schemas, API contracts, or external dependencies must submit a corresponding ADR in `/docs/adr/`.

---

### 4. Accessibility (A11y) & Usability
*   **WCAG 2.1 AA Compliance:** UI components must maintain a minimum color contrast ratio of **4.5:1** for body text.
*   **Screen Reader Readiness:** All interactive controls must feature explicit, unique `id` attributes and descriptive `aria-label` tags.
*   **Touch Targets:** Interactive targets on mobile screens must measure at least **$44 \times 44\text{ pixels}$**.

---

### 5. Zero-Trust Security & Data Protection
*   **Input Validation:** All incoming REST/gRPC payload inputs must be validated and sanitized using Zod schemas.
*   **SQL Injection Elimination:** Database interactions must exclusively use parameterized queries or type-safe ORM query builders (Drizzle).
*   **Secret Protection:** Zero hardcoded API keys, passwords, or tokens. Secret scanning (GitGuardian/Trivy) must pass with zero alerts.

---

### 6. Standardized Structured Logging
*   **JSON Logger Context:** All log outputs must be structured JSON containing `timestamp`, `level`, `service_name`, `trace_id`, and `context`.
*   **PII Masking:** Personally Identifiable Information (Aadhaar numbers, phone numbers, exact residential addresses) must be masked automatically before writing to log streams.

---

### 7. Observability & Health Monitoring
*   **Health Endpoints:** Microservices must expose `/health/liveness` and `/health/readiness` HTTP endpoints returning RFC 7807 problem details if degraded.
*   **OpenTelemetry Tracing:** HTTP and gRPC request headers must propagate `trace_id` and `span_id` downstream for distributed tracing across Kafka and database operations.

---

### 8. Performance & Latency Constraints
*   **API Latency SLA:** $95\%$ of non-analytical REST API requests must complete in **$<200\text{ms}$**.
*   **Spatial Canvas FPS:** GPU map rendering (Maplibre GL + Deck.gl) must sustain $\ge 50\text{ FPS}$ on desktop and $\ge 30\text{ FPS}$ on mobile viewports.

---

### 9. OpenAPI & API Documentation
*   **OpenAPI 3.1 Specification:** REST endpoints must export auto-generated OpenAPI 3.1 JSON schemas conforming to `/docs/API_HANDBOOK.md`.
*   **RFC 7807 Error Payloads:** Error responses must exclusively return standard RFC 7807 `application/problem+json` response structures.

---

### 10. Unit Testing Standards
*   **Framework:** Written using **Vitest** (Node.js/React) or **pytest** (Python/AI).
*   **Isolation:** Unit tests must be hermetic and executed without active network or physical database dependencies (using mock adapters).

---

### 11. Integration & E2E Testing
*   **Service Integration:** Integration tests must validate service-to-service communication over Kafka message queues and PostgreSQL database transactions.
*   **End-to-End (E2E):** Critical user workflows (e.g., citizen complaint submission -> supervisor dispatch -> field crew resolution) must pass automated Cypress/Playwright tests.

---

### 12. Deployment & Runtime Verification
*   **ArgoCD GitOps Rolling Rollouts:** Deployments to staging or production environments must complete using ArgoCD rolling updates with zero downtime.
*   **Container Health:** Newly deployed pods must pass Kubernetes liveness probes for at least 5 minutes without crashing or restarting.

---

### 13. Clean Architecture & DDD Compliance
*   **Dependency Rule:** Code dependencies must point strictly inward toward the domain layer. Core domain logic must not directly import Express, React, or database drivers.
*   **Bounded Context Isolation:** Domain entities must remain strictly within their bounded contexts (e.g., `Citizen` vs `Department`).

---

### 14. AI Safety, Ethics & Validation
*   **Deterministic Fallbacks:** AI multi-agent negotiation graphs (LangGraph) and Hinglish NLP translators must feature deterministic fallback logic if Gemini API calls fail or timeout.
*   **Human-in-the-Loop (HITL):** High-impact physical operations (e.g., valve actuations or crew dispatches) must enforce human confirmation controls.
*   **Transparency:** Every AI recommendation card must display an explainable reasoning summary and confidence score.

---

### 15. Academic Research & Thesis Artifacts
*   **Experimental Repeatability:** Algorithmic modifications to AI models, spatial queries, or graph algorithms must include reproducible benchmark scripts stored in `/research/benchmarks/`.
*   **Thesis Manuscript Alignment:** Features implementing novel algorithms must update corresponding LaTeX/Markdown thesis chapters (`/docs/IEEE_SOFTWARE_REQUIREMENT_SPECIFICATION.md`).

---

## Detailed Quality Gate Matrix

| Quality Gate | Automated Tooling | Verification Criteria | Enforcement Action On Failure |
| :--- | :--- | :--- | :--- |
| **Gate 1: Static Analysis** | `tsc`, `eslint`, SonarQube | Zero TypeScript errors, zero lint warnings, strict line-count limits. | Immediate PR Build Lock |
| **Gate 2: Test Verification** | Vitest, pytest, Cypress | $\ge 80\%$ test coverage, $100\%$ test pass rate across all suites. | Block Merge to `main` |
| **Gate 3: Security & Privacy** | Trivy, GitGuardian, OWASP | Zero secret exposure, zero high/critical CVE container vulnerabilities. | Security Alert & PR Lock |
| **Gate 4: Performance & A11y** | k6, Lighthouse, axe-core | Sub-200ms API response latency, $100\%$ WCAG 2.1 AA accessibility. | Block Release Candidate |
| **Gate 5: AI & Research** | LangGraph Evaluator, JSDoc | Validated HITL guards, complete JSDoc headers, benchmark scripts. | Block Thesis Milestone Sign-Off |

---

## Enforcement Checklist for Developers

When submitting a pull request, the developer must verify the following checklist:

```markdown
### AI-SCOS Pull Request DoD Checklist
- [ ] 1. Code Review: Approved by 2 CODEOWNERS; files under 250 lines.
- [ ] 2. Testing Coverage: Unit & integration tests written; statement coverage >= 80%.
- [ ] 3. Documentation: JSDoc comments added to all public functions; ADR submitted if applicable.
- [ ] 4. Accessibility: WCAG 2.1 AA verified; unique element IDs and aria-labels included.
- [ ] 5. Security: Input validated with Zod; zero hardcoded secrets or raw SQL strings.
- [ ] 6. Logging: Structured JSON logging configured with PII masking.
- [ ] 7. Monitoring: Health check endpoints exposed; trace_id propagated.
- [ ] 8. Performance: API latency < 200ms verified via local k6 run; WebGL canvas >= 50 FPS.
- [ ] 9. API Specs: OpenAPI 3.1 schema updated; errors return RFC 7807 problem details.
- [ ] 10. Unit Tests: Vitest/pytest tests pass isolated without network dependencies.
- [ ] 11. Integration Tests: E2E Cypress workflow passes end-to-end.
- [ ] 12. Deployment: Staging deployment verified with zero pod restarts.
- [ ] 13. Clean Architecture: Layer boundaries respected; zero circular imports.
- [ ] 14. AI Safety: HITL guardrail attached to high-impact actions; fallback configured.
- [ ] 15. Research Artifacts: Benchmark script updated in /research/benchmarks/ if applicable.
```

---
*This Enterprise Definition of Done manual establishes the mandatory quality gates, test requirements, security controls, and academic verification protocols required to maintain the Smart City Operating System at the highest engineering standards.*
