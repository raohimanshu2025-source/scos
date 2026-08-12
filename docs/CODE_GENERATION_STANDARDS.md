# CORE CODE GENERATION STANDARDS & CODING GOVERNANCE MANUAL
## System: Smart City Operating System (AI-SCOS) for Indian District Administration
### Academic Subtitle: Immutable Engineering Standards, Naming Conventions, Architectural Contracts, and Code Generation Governance
**Institution:** Indian Institute of Technology Kanpur (IIT Kanpur)  
**Author:** Principal Software Engineer & Engineering Standards Authority  

---

## Executive Summary & Governance Directive

At city scale, a Smart City Operating System (AI-SCOS) is a mission-critical, multi-decade software system. Over its lifetime, hundreds of engineers, academic research groups, and municipal contractors will inspect, modify, and extend this monorepo codebase. If individual code modules are developed with inconsistent naming, loose typing, hardcoded values, unhandled edge cases, or opaque directory structures, the system will degrade rapidly—introducing silent bugs, security vulnerabilities, and unrepeatable research benchmarks.

This **Engineering Standards & Coding Governance Manual** establishes the absolute, non-negotiable coding standards across all frontend applications, microservices, shared packages, database modules, and test suites within the AI-SCOS workspace.

**Every future code generation prompt, AI agent turn, and human pull request MUST strictly adhere to the standards, naming conventions, and structural rules defined herein.**

---

## 1. Folder Naming Standards

*   **Rule:** All directory names across the monorepo **MUST** use lowercase `kebab-case`.
*   **Multi-Word Rules:** Words must be separated by hyphens (e.g., `citizen-ingress`, `spatial-utils`, `ai-command-center`).
*   **Prohibited Patterns:** No `camelCase`, `PascalCase`, `snake_case`, spaces, or uppercase characters in directory names.
*   **Examples:**
    *   `GOOD:` `/src/features/citizen-ingress/`, `/services/scos-citizen/`, `/packages/auth-client/`
    *   `BAD:` `/src/features/CitizenIngress/`, `/services/scos_citizen/`, `/packages/authClient/`
*   **Rationale:** Ensures absolute cross-platform compatibility between case-sensitive Linux Cloud Run containers, macOS workstations, and Git file trees.

---

## 2. File Naming Standards

*   **TypeScript / JavaScript Modules:** Lowercase `kebab-case` with descriptive extension (e.g., `spatial-query.util.ts`, `jwt-auth.middleware.ts`).
*   **React Component Files:** `PascalCase` matching the primary export name exactly (e.g., `GrievanceCard.tsx`, `AiCommandConsole.tsx`).
*   **React Custom Hook Files:** `camelCase` with mandatory `use` prefix (e.g., `useWebSocket.ts`, `useSpatialQuery.ts`).
*   **Test Files:** Co-located with target files using `.spec.ts`, `.spec.tsx`, `.test.ts`, or `.test.tsx` (e.g., `spatial-query.util.spec.ts`).
*   **Configuration Files:** Lowercase `kebab-case` or standard tool names (e.g., `vite.config.ts`, `drizzle.config.ts`).
*   **Rationale:** Prevents file import mismatches across case-sensitive operating systems and establishes instant visual recognition of file roles.

---

## 3. Component Naming & Architecture (React / UI)

*   **Naming Convention:** `PascalCase` for component names, interfaces, and file names (e.g., `IncidentReportModal.tsx`).
*   **Single Responsibility & Density Limit:** No component file shall exceed **250 lines of code**. Large components must be decomposed into modular sub-components in a co-located `components/` subdirectory.
*   **Container vs. Presentation Pattern:**
    *   *Container Components (Stateful):* Handle data fetching, Zustand state hooks, and side effects.
    *   *Presentation Components (Stateless):* Receive typed props and render Tailwind CSS markup strictly.
*   **Prop Typing:** Props must be declared via explicit TypeScript interfaces named `<ComponentName>Props`.
*   **Code Example:**
    ```tsx
    // src/features/citizen-ingress/components/GrievanceCard.tsx
    import React from 'react';
    import { GrievanceDTO } from '@scos/shared';

    export interface GrievanceCardProps {
      readonly grievance: GrievanceDTO;
      readonly onSelect: (id: string) => void;
    }

    export const GrievanceCard: React.FC<GrievanceCardProps> = ({ grievance, onSelect }) => {
      return (
        <div 
          id={`grievance-card-${grievance.id}`}
          onClick={() => onSelect(grievance.id)}
          className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all cursor-pointer"
        >
          <h3 className="text-base font-semibold text-slate-900">{grievance.title}</h3>
          <p className="text-sm text-slate-600 mt-1">{grievance.description}</p>
        </div>
      );
    };
    ```

---

## 4. Custom Hooks Standards

*   **Naming Convention:** `camelCase` with mandatory `use` prefix (e.g., `useGrievanceStream.ts`).
*   **Responsibility:** Encapsulate stateful logic, side-effects, WebSocket subscriptions, or media API interactions.
*   **Return Contract:** Return a strongly-typed object or tuple with primitive or memoized values.
*   **Code Example:**
    ```typescript
    // src/hooks/useGrievanceStream.ts
    import { useState, useEffect, useCallback } from 'react';
    import { GrievanceDTO } from '@scos/shared';

    export interface UseGrievanceStreamResult {
      readonly grievances: readonly GrievanceDTO[];
      readonly isConnected: boolean;
      readonly reconnect: () => void;
    }

    export function useGrievanceStream(wardId: string): UseGrievanceStreamResult {
      const [grievances, setGrievances] = useState<readonly GrievanceDTO[]>([]);
      const [isConnected, setIsConnected] = useState<boolean>(false);

      const reconnect = useCallback(() => {
        // Safe reconnection logic
      }, [wardId]);

      useEffect(() => {
        // Stream subscription logic
      }, [wardId]);

      return { grievances, isConnected, reconnect };
    }
    ```

---

## 5. Utilities & Pure Functions

*   **Naming Convention:** `camelCase` file names ending in `.util.ts` or `.helper.ts` (e.g., `date-formatter.util.ts`).
*   **Purity Requirement:** Utility functions must be **pure functions**—side-effect free, deterministic, and independently testable without global state mocks.
*   **JSDoc Requirement:** All exported utility functions must feature explicit JSDoc annotations describing parameters, returns, and edge-case behaviors.
*   **Code Example:**
    ```typescript
    // src/utils/spatial-distance.util.ts
    /**
     * Calculates the Haversine distance in meters between two geospatial coordinates.
     * 
     * @param lat1 Latitude of point 1 in decimal degrees
     * @param lon1 Longitude of point 1 in decimal degrees
     * @param lat2 Latitude of point 2 in decimal degrees
     * @param lon2 Longitude of point 2 in decimal degrees
     * @returns Distance in meters rounded to 2 decimal places
     */
    export function calculateHaversineDistanceMeters(
      lat1: number,
      lon1: number,
      lat2: number,
      lon2: number
    ): number {
      const R = 6371000; // Earth radius in meters
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return Math.round(R * c * 100) / 100;
    }
    ```

---

## 6. Domain Services Standards

*   **Naming Convention:** `PascalCase` class names with `Service` suffix, file named in `kebab-case` ending in `.service.ts` (e.g., `GrievanceDispatchService.ts` -> `grievance-dispatch.service.ts`).
*   **Single Responsibility:** Focus strictly on domain business rules and orchestrating repositories or external clients.
*   **Length & Parameter Limits:** Individual service functions must not exceed **50 lines of code** or **3 parameters** (use Options Objects for larger input payloads).
*   **Code Example:**
    ```typescript
    // src/services/grievance-dispatch.service.ts
    import { IGrievanceRepository } from '../repositories/grievance.repository.interface';
    import { DispatchDecisionDTO } from '@scos/shared';

    export class GrievanceDispatchService {
      constructor(private readonly grievanceRepo: IGrievanceRepository) {}

      public async dispatchGrievanceTicket(
        ticketId: string,
        decision: DispatchDecisionDTO
      ): Promise<void> {
        const ticket = await this.grievanceRepo.findById(ticketId);
        if (!ticket) {
          throw new Error(`Ticket not found: ${ticketId}`);
        }
        ticket.assignToCrew(decision.crewId);
        await this.grievanceRepo.save(ticket);
      }
    }
    ```

---

## 7. Data Transfer Objects (DTOs) & Zod Validation Schemas

*   **Naming Convention:** `PascalCase` interface/type ending in `DTO`, file ending in `.dto.ts` or `.schema.ts` (e.g., `CreateGrievanceDTO.ts`).
*   **Validation Rule:** Every network endpoint input **MUST** be validated runtime-side using Zod before touching business logic.
*   **Code Example:**
    ```typescript
    // shared/src/contracts/create-grievance.dto.ts
    import { z } from 'zod';

    export const CreateGrievanceSchema = z.object({
      title: z.string().min(5).max(120),
      description: z.string().min(10).max(2000),
      departmentCode: z.enum(['WATER', 'POWER', 'PUBLIC_WORKS', 'TRAFFIC']),
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
      imageUrl: z.string().url().optional(),
    });

    export type CreateGrievanceDTO = z.infer<typeof CreateGrievanceSchema>;
    ```

---

## 8. Domain Entities & Value Objects

*   **Naming Convention:** `PascalCase` class or type (e.g., `GrievanceEntity.ts`, `GeospatialCoordinate.ts`).
*   **Encapsulation:** Entities protect internal invariants using private members and public getter/mutator methods. Value objects are strictly immutable (`readonly`).
*   **Code Example:**
    ```typescript
    // src/domain/entities/grievance.entity.ts
    export enum GrievanceStatus {
      SUBMITTED = 'SUBMITTED',
      DISPATCHED = 'DISPATCHED',
      RESOLVED = 'RESOLVED',
    }

    export class GrievanceEntity {
      private status: GrievanceStatus = GrievanceStatus.SUBMITTED;
      private assignedCrewId?: string;

      constructor(
        public readonly id: string,
        public readonly title: string,
        public readonly createdAt: Date
      ) {}

      public assignToCrew(crewId: string): void {
        if (this.status === GrievanceStatus.RESOLVED) {
          throw new Error('Cannot assign resolved grievance');
        }
        this.assignedCrewId = crewId;
        this.status = GrievanceStatus.DISPATCHED;
      }

      public getStatus(): GrievanceStatus {
        return this.status;
      }
    }
    ```

---

## 9. Interfaces, Types & Enums

*   **Interfaces:** `PascalCase` named with descriptive nouns (e.g., `UserSession`, `GrievanceRepository`). Do **NOT** prefix with `I` unless defining a strictly abstract structural interface contract (e.g., `IGrievanceRepository`).
*   **Types:** `PascalCase` for union types or mapped types (e.g., `PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'`).
*   **Enums:** Standard TypeScript `enum` in `PascalCase` with `UPPER_SNAKE_CASE` key-value pairs.
*   **No `any` Policy:** `any` is strictly prohibited. Use `unknown` with type guards or generics instead.
*   **Code Example:**
    ```typescript
    // src/types/municipal-department.enum.ts
    export enum MunicipalDepartment {
      JAL_SANSTHAN = 'JAL_SANSTHAN',
      KESCO = 'KESCO',
      NAGAR_NIGAM = 'NAGAR_NIGAM',
      TRAFFIC_POLICE = 'TRAFFIC_POLICE',
    }
    ```

---

## 10. Repositories & Data Access Layers

*   **Interface Separation:** Every repository implementation must satisfy an explicit abstract interface contract.
*   **SQL Injection Protection:** Raw string query concatenation is strictly forbidden. All queries must use Drizzle ORM builders or parameterized prepared statements.
*   **Code Example:**
    ```typescript
    // src/repositories/grievance.repository.ts
    import { db } from '../db/client';
    import { grievancesTable } from '../db/schema';
    import { eq } from 'drizzle-orm';
    import { GrievanceEntity } from '../domain/entities/grievance.entity';

    export class GrievanceRepository {
      public async findById(id: string): Promise<GrievanceEntity | null> {
        const record = await db
          .select()
          .from(grievancesTable)
          .where(eq(grievancesTable.id, id))
          .limit(1);

        if (!record[0]) return null;
        return new GrievanceEntity(record[0].id, record[0].title, record[0].createdAt);
      }
    }
    ```

---

## 11. Testing Standards (Unit, Integration, E2E)

*   **Structure:** Arrange-Act-Assert (AAA) pattern with explicit assertion messages.
*   **Unit Tests:** Test domain entities, utilities, and services in isolation using mock objects.
*   **Integration & E2E:** Verify database query execution, REST endpoints, and UI user workflows.
*   **Code Example:**
    ```typescript
    // src/utils/spatial-distance.util.spec.ts
    import { calculateHaversineDistanceMeters } from './spatial-distance.util';

    describe('calculateHaversineDistanceMeters', () => {
      it('should return 0 meters for identical coordinates', () => {
        const distance = calculateHaversineDistanceMeters(26.4499, 80.3319, 26.4499, 80.3319);
        expect(distance).toBe(0);
      });

      it('should accurately compute distance between IIT Kanpur and Kanpur Central Station', () => {
        // IIT Kanpur: 26.5123, 80.2329 | Kanpur Central: 26.4537, 80.3512
        const distance = calculateHaversineDistanceMeters(26.5123, 80.2329, 26.4537, 80.3512);
        expect(distance).toBeGreaterThan(13000); // ~13.5 km
        expect(distance).toBeLessThan(14500);
      });
    });
    ```

---

## 12. Environment Variables & Secret Security

*   **Declaration Mandatory:** Every new environment variable **MUST** be declared in `.env.example`.
*   **No Hardcoded Secrets:** API keys, database credentials, JWT secrets, and tokens must NEVER be checked into source code.
*   **Server-Side Isolation:** Secrets (e.g., `GEMINI_API_KEY`, `POSTGRES_PASSWORD`) must remain server-side and never be prefixed with `VITE_`.
*   **Client-Side Variables:** Only non-sensitive config variables prefixed with `VITE_` are exposed to frontend code.
*   **Example `.env.example`:**
    ```env
    # Server-Side Secrets
    DATABASE_URL=postgresql://user:pass@localhost:5432/scos_db
    GEMINI_API_KEY=
    JWT_SECRET=

    # Public Client Config
    VITE_API_BASE_URL=http://localhost:3000/api/v1
    VITE_MAP_TILES_URL=https://tiles.scos.kanpur.gov.in
    ```

---

## 13. Centralized Configuration Management

*   **Single Source of Truth:** App configurations must be loaded from a centralized configuration module (`/src/config/index.ts`) that reads `process.env` and validates values using Zod at startup.
*   **Fail Fast:** If required environment variables are missing, the application must fail immediately with a clear error message during startup rather than crashing later during execution.

---

## 14. Structured Logging Standards

*   **JSON Format:** Logs must be emitted in structured JSON format with `timestamp`, `level`, `service`, `trace_id`, and `message`.
*   **PII Masking:** Personally Identifiable Information (Aadhaar numbers, phone numbers, exact residential street addresses, passwords) must be automatically sanitized/masked before logging.
*   **No Raw `console.log`:** Production code must use standard structured loggers (e.g., Pino or Winston).

---

## 15. Error Handling & RFC 7807 Exception Hierarchy

*   **No Empty Catch Blocks:** Swallowing errors silently is strictly forbidden.
*   **RFC 7807 Problem Details:** API errors must return standardized machine-readable RFC 7807 JSON objects.
*   **Standard Error Format:**
    ```json
    {
      "type": "https://scos.kanpur.gov.in/errors/resource-not-found",
      "title": "Resource Not Found",
      "status": 404,
      "detail": "Grievance ticket 'GRV-20260808-9981' was not found in ward 12.",
      "instance": "/api/v1/citizen/grievances/GRV-20260808-9981",
      "code": "SCOS_ERR_TICKET_NOT_FOUND"
    }
    ```

---

## 16. API Responses & Uniform Payload Contracts

*   **Envelope Structure:** All REST API endpoints must wrap responses in a predictable payload envelope:
    ```typescript
    export interface ApiResponseEnvelope<T> {
      readonly success: boolean;
      readonly data: T;
      readonly meta?: {
        readonly page?: number;
        readonly limit?: number;
        readonly totalRecords?: number;
        readonly timestamp: string;
      };
    }
    ```

---

## 17. Git Commit Conventions (Conventional Commits)

*   **Format:** `<type>(<scope>): <short summary>`
*   **Allowed Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`.
*   **Examples:**
    *   `feat(citizen-ingress): add photo geotagging and Zod validation`
    *   `fix(spatial-twin): resolve memory leak in Deck.gl vector tile layer`
    *   `docs(standards): update code generation standards manual`

---

## 18. Branch Naming Conventions

*   **Format:** `<type>/<issue-id>-<short-description>`
*   **Prefixes:** `feature/`, `bugfix/`, `hotfix/`, `release/`, `refactor/`.
*   **Examples:**
    *   `feature/SCOS-102-hinglish-nlp-pipeline`
    *   `bugfix/SCOS-204-maplibre-canvas-resize`
    *   `hotfix/SCOS-911-jwt-auth-expiration`

---

## 19. Code Generation Governance & Automated Verification

From this point forward, **every code generation request, code edit, and automated build** in this repository is governed by this manual.

### Automated Verification Pipeline:
1.  **File Density Audit:** React component files checked against the 250-line limit; backend functions checked against the 50-line limit.
2.  **Type Safety Check:** Absolute zero toleration for `any`.
3.  **A11y Verification:** Interactive HTML elements checked for unique `id` attributes and ARIA labels.
4.  **Verification Tooling:** Every turn executing code edits MUST run `lint_applet` and `compile_applet` to confirm zero syntax errors, type mismatches, or build failures.

---
*This Code Generation Standards Manual establishes the absolute architectural patterns, naming conventions, type safety systems, and automated quality gates governing the Smart City Operating System codebase.*
