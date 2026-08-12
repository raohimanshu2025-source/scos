# SCOS ENGINEERING WORKFLOW & SYSTEMS GOVERNANCE MANUAL
## System: Smart City Operating System (SCOS) for Indian District Administration
### Academic Subtitle: A Rigorous Software Engineering Framework, Continuous Verification Topologies, and Research Integration Protocols
**Institution:** Indian Institute of Technology Kanpur (IIT Kanpur)  
**Author:** M.Tech Thesis Research Sandbox  
**Role:** Director of Engineering & Monorepo Operations Lead  

---

## Executive Summary

At city scale, engineering a Smart City Operating System (SCOS) is as much an organizational and workflow coordination challenge as it is a technical one. SCOS integrates academic researchers at IIT Kanpur, municipal engineering departments (such as KESCO, Jal Sansthan), third-party SaaS vendors, and district administrative coordinators. Without a highly rigorous, well-defined, and automated engineering workflow, a system of this scale will suffer from configuration drift, silent regressions, security gaps, and integration bottlenecks.

The **SCOS Engineering Workflow** provides a structured handbook that guides daily development operations. It covers sprint planning, Git branching models, code review protocols, continuous testing, release procedures, deployment strategies, and academic-research translation workflows.

---

## 1. Project Management & Agile Sprint Cadence

To balance high-velocity feature delivery with academic research depth, SCOS utilizes a adapted **Two-Week Sprint Agile Cadence**:

```
[ Sprint Planning ] ──► [ Daily Standups ] ──► [ Mid-Sprint Review ] ──► [ Sprint Review & Demo ] ──► [ Retro ]
   (Day 1 - 2 hrs)         (Daily - 15 mins)       (Day 5 - 30 mins)         (Day 10 - 1 hr)          (Day 10 - 45 mins)
```

1.  **Sprint Planning (Day 1 - 2 Hours):**
    *   *Participants:* Product Owners, Lead Architects, Academic Supervisors, Core Developers.
    *   *Activities:* Refine the product backlog, evaluate ticket estimates using story points based on a Fibonacci sequence ($1, 2, 3, 5, 8, 13$), and commit to a clear Sprint Goal.
2.  **Daily Standup (Days 2 to 9 - 15 Minutes):**
    *   *Format:* Fast, focused round-robin addressing three core questions:
        *   *What was accomplished yesterday?*
        *   *What is the focus for today?*
        *   *Are there any active blockers or dependencies?*
3.  **Mid-Sprint Alignment Check (Day 5 - 30 Minutes):**
    *   *Activities:* Review the active burndown chart, address blocked tasks, and adjust sprint backlog allocations if bottlenecks are detected.
4.  **Sprint Review & Demo (Day 10 - 1 Hour):**
    *   *Activities:* Demonstrate fully compiled, functional software increments to stakeholders (e.g., Kanpur municipal coordinators). No slide presentations are permitted; only live software demonstrations on staging environments are accepted.
5.  **Sprint Retrospective (Day 10 - 45 Minutes):**
    *   *Format:* Open, collaborative discussion focused on process improvement:
        *   *What went well during this sprint cycle?*
        *   *What processes slowed us down?*
        *   *What concrete actions will we take next sprint to resolve these issues?*

---

## 2. Distributed Git Workflow & Release Mechanics

SCOS implements a strict **Trunk-Based Development** Git workflow to maintain a reliable, continuous release cycle.

---

### A. Branch Lifecycle Strategy
All modifications must flow through short-lived feature branches, keeping the central repository clean and deployable:

```
[ main ] ─────────────────────────┬───────────────────────── [ main (Deployable) ]
                                  │
                                  └──► [ feature/scos-102-water-map ] ──(Merge via Squash PR)
```

*   **The `main` Trunk:**
    *   The single source of truth. Direct pushes to `main` are strictly forbidden.
    *   Every commit on `main` **must** pass all CI pipeline checks (linting, compilation, unit tests, security scans).
*   **Feature Branches (`feature/scos-{ticket_id}-{short_description}`):**
    *   Created directly from the latest `main` commit.
    *   Branches should be short-lived, with a target lifecycle of **$<48\text{ hours}$** to prevent branch divergence.
*   **Release Branches (`release/v{major}.{minor}.{patch}`):**
    *   Cut from `main` to freeze features for upcoming production pilots. Only critical bug fixes are cherry-picked into these branches.

---

### B. Pull Request (PR) & Code Review Protocols
Merging code into `main` requires passing a rigorous code review process:
1.  **Automated Pre-Check:** Submitting a PR automatically triggers the GitHub Actions CI pipeline. If any build, lint, or test check fails, the PR is automatically locked against merging.
2.  **Review Requirements:** A minimum of **two approvals** from designated senior engineers inside the code owners list (`CODEOWNERS`) is mandatory.
3.  **The Reviewer Checklist:** Reviewers must evaluate the incoming code against five key criteria:
    *   *Design Token Compliance:* Does the UI utilize variables mapped in `/docs/DESIGN_SYSTEM.md`?
    *   *Type Safety:* Are there any loose typing structures (`any`) or bypassed type guards?
    *   *SQL Injection Protection:* Are all database queries properly parameterized via the database client?
    *   *SLA Integrity:* Does the new service endpoint complete within our target response window ($<200\text{ms}$)?
    *   *Idempotency:* Do mutative POST actions support idempotency key checks?
4.  **Merge Mechanics:** All approved merges use **Squash and Merge** to keep the `main` commit history clean, linear, and readable.

---

## 3. Automated Continuous Testing Pipeline

To guarantee system stability at scale, SCOS enforces a strict **Multi-Tier Testing Pipeline** executed automatically on every pull request:

```
[ Code Commit ] ──► [ Lint & Type Checks ] ──► [ Unit Tests ] ──► [ Integration Tests ] ──► [ Security Scans ]
                         (tsc / eslint)         (Vitest / pytest)      (Kafka / Postgres)       (Trivy / OWASP)
```

*   **Static Analysis Layer:**
    *   TypeScript verification: `tsc --noEmit`.
    *   Linter validation: `eslint --max-warnings=0`.
*   **Unit Testing Layer (Minimum Coverage Target: 80%):**
    *   *Frontend:* Written using **Vitest** paired with React Testing Library.
    *   *Backend:* Python-based AI services are tested using **pytest**, while Node.js services leverage Vitest.
*   **Integration Testing Layer:**
    *   Integration tests boot isolated service environments inside temporary Docker containers, validating database operations and Kafka message deliveries.
*   **Security Scanning Layer:**
    *   Container images are scanned for vulnerabilities using **Trivy**.
    *   Codebases are scanned for hardcoded secrets, API keys, or exposed credentials using **GitGuardian**.

---

## 4. Continuous Deployment (CD) & GitOps Delivery

Once code merges into `main`, deployments are automated through a reliable **GitOps Delivery Pipeline**:

```
[ Merge to main ] ──► [ Build Container ] ──► [ Push to Artifacts ] ──► [ ArgoCD Sync ] ──► [ Pod Rollout ]
```

1.  **Artifact Compilation:** GitHub Actions builds a production-ready, lightweight Docker container image from the merged code.
2.  **Registry Push:** The compiled container image is tagged with the commit SHA and pushed to the secure, private Container Registry.
3.  **GitOps Synchronization (ArgoCD):**
    *   The deployment configurations in the `/deployment` folder are updated with the new container image tag.
    *   **ArgoCD** detects the configuration update, compares it against the active state of the Kubernetes cluster, and automatically starts a rolling update.
4.  **Rolling Rollouts:** Kubernetes performs a rolling update, spawning new application pods and running health checks before terminating old containers. This guarantees **zero-downtime** deployments.

---

## 5. Architectural Decision Records (ADR) Process

To track and document major architectural decisions over time, SCOS enforces the **Architectural Decision Record (ADR)** pattern:

*   **The Rule:** Any modification that alters the database schema, introduces a new external library, changes the API gateway configuration, or modifies an internal microservice communication protocol **must** be documented via an ADR.
*   **Storage Path:** ADR files are written as markdown files inside `/documentation/adr/` using a standardized naming convention (e.g., `ADR-004-introduce-timescaledb.md`).
*   **Standard ADR Structure:**
    *   **Title:** Concise description of the decision.
    *   **Status:** Active states (`Proposed`, `Accepted`, `Deprecated`, `Superseded`).
    *   **Context:** Detailed explanation of the architectural challenge, constraints, and alternatives considered.
    *   **Decision:** The chosen path and the underlying technical justifications.
    *   **Consequences:** The impact of this choice on performance, security, and developer velocity.

---

## 6. Academic Research Integration & Transition

SCOS bridges the gap between academic research sandbox models developed at IIT Kanpur and high-performance production operations:

1.  **Sandbox Isolation (`/research`):** Research students, PhD candidates, and ML engineers develop and refine predictive models inside the isolated `/research` folder using Jupyter Notebooks and PyTorch.
2.  **Interface Standardization:** Before a research prototype can be integrated into the core backend, it must package its logic as a clean, microservice API conforming to `/docs/API_HANDBOOK.md`.
3.  **Verification Pipeline:** The microservice must pass standard CI pipeline checks (linting, unit tests, and security scans) and obtain approvals from lead software architects before merging.
4.  **Gradual Production Rollouts:** New ML and AI models are deployed gradually using **Canary Deployments**, routing only $5\%$ of traffic to the new model initially to monitor performance, resource footprints, and accuracy in production.

---

## 7. Daily Developer Workflow Lifecycle

To illustrate these engineering standards in action, here is the typical daily workflow for an SCOS developer:

1.  **Morning Alignment:** Check the active Jira sprint board, verify assigned tasks, and participate in the 15-minute Daily Standup.
2.  **Local Workspace Sync:** Pull the latest changes from the `main` branch to keep the local workspace up to date:
    ```bash
    git checkout main
    git pull origin main
    ```
3.  **Local Feature Development:** Create a short-lived feature branch and write code following the design tokens in `/docs/DESIGN_SYSTEM.md`:
    ```bash
    git checkout -b feature/scos-102-water-map
    ```
4.  **Local Verification:** Run the local test suites to verify code changes before pushing:
    ```bash
    npm run lint
    npm run test
    ```
5.  **Submit Pull Request:** Push the feature branch to origin and submit a Pull Request, linking the relevant Jira ticket and detailing the changes.
6.  **Review & Merge:** Address code review feedback from team leads. Once approved and all CI checks pass, squash and merge the branch into `main`.

---
*This engineering workflow and systems governance manual establishes the absolute development standards, release mechanics, and continuous verification protocols required to develop, deploy, and maintain the Smart City Operating System safely and reliably.*
