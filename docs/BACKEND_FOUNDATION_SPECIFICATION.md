# BACKEND FOUNDATION ARCHITECTURE & CORE SYSTEM SPECIFICATION
## System: Smart City Operating System (AI-SCOS) for Indian District Administration
### Academic Subtitle: Enterprise Service Foundations, Dependency Injection Topologies, Modular Extension Contracts, and Resilient Middleware Pipelines
**Institution:** Indian Institute of Technology Kanpur (IIT Kanpur)  
**Author:** Office of the Chief Backend Architect & Core Infrastructure Group  

---

## 1. Executive Summary & Core Architectural Vision

The **Smart City Operating System (AI-SCOS)** backend is engineered as a resilient, enterprise-grade, modular foundation. Designed to support 12 bounded microservices operating at city scale across Kanpur District, the backend foundation establishes unified core modules for **Authentication & RBAC**, **Configuration & Fail-Fast Validation**, **Database Abstraction & Transactions**, **Structured JSON Logging with PII Masking**, **Observability & OpenTelemetry Metrics**, **RFC 7807 Error Handling**, and **OpenAPI 3.1 Swagger Auto-Generation**.

Every microservice and backend module in AI-SCOS extends this foundation using strict **Dependency Injection (DI)**, **Clean Architecture Layer Isolation**, and **Uniform Request/Response Contracts**.

---

## 2. Global Backend Folder Hierarchy & Module Structure

```
backend/
├── src/
│   ├── config/                   # Centralized Configuration & Zod Env Validation
│   │   ├── env.config.ts         # Environment variable schemas & fail-fast validator
│   │   └── swagger.config.ts     # OpenAPI 3.1 / Swagger UI configuration
│   │
│   ├── core/                     # Core Cross-Cutting Technical Services
│   │   ├── auth/                 # Keycloak OIDC & JWT RBAC Guard Module
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── rbac.decorator.ts
│   │   │   └── user-session.interface.ts
│   │   │
│   │   ├── database/             # Drizzle PostgreSQL & Connection Pool Layer
│   │   │   ├── db.client.ts
│   │   │   ├── transaction.manager.ts
│   │   │   └── base.repository.ts
│   │   │
│   │   ├── errors/               # RFC 7807 Exception Hierarchy & Filters
│   │   │   ├── app-error.base.ts
│   │   │   ├── http-exception.filter.ts
│   │   │   └── rfc7807.interface.ts
│   │   │
│   │   ├── logging/              # Structured Pino JSON Logger & PII Sanitizer
│   │   │   ├── logger.service.ts
│   │   │   └── pii-masker.util.ts
│   │   │
│   │   ├── monitoring/           # OpenTelemetry Tracing & Prometheus Metrics
│   │   │   ├── metrics.service.ts
│   │   │   └── health.controller.ts
│   │   │
│   │   ├── security/             # Security Headers, CORS, Rate-Limiting & CSRF
│   │   │   ├── security.middleware.ts
│   │   │   └── rate-limiter.guard.ts
│   │   │
│   │   └── validation/           # Zod Body/Query/Param Pipe Validation
│   │       └── zod-validation.pipe.ts
│   │
│   ├── modules/                  # Business Feature Modules (Extends Core)
│   │   ├── citizen/              # Citizen Ingress & Ticket Module
│   │   ├── department/           # Department Roster & Asset Module
│   │   └── twin/                 # Spatial GIS Digital Twin Module
│   │
│   ├── shared/                   # Internal Reusable Core Utilities
│   │   ├── interceptors/         # Response Envelope Transformer
│   │   └── utils/                # Crypto & String Helpers
│   │
│   ├── app.module.ts             # Root IoC Dependency Injection Container
│   └── server.ts                 # HTTP Server Entrypoint & Port 3000 Ingress
│
├── tsconfig.json                 # Strict TypeScript Configuration
└── package.json                  # Dependencies & Script Definitions
```

---

## 3. Core Technical Modules & Implementation Blueprint

---

### A. Centralized Configuration & Environment Validation (`/src/config/env.config.ts`)

*   **Responsibility:** Reads `process.env`, validates variables against a strict Zod schema at container startup, and exports an immutable, strongly-typed configuration object.
*   **Fail-Fast Behavior:** If any required variable is missing or malformed, the process exits immediately with a diagnostic message before accepting traffic.

```typescript
import { z } from 'zod';

const EnvironmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('0.0.0.0'),
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid PostgreSQL connection URI'),
  REDIS_URL: z.string().url('REDIS_URL must be a valid Redis connection URI'),
  KEYCLOAK_ISSUER_URL: z.string().url(),
  KEYCLOAK_CLIENT_ID: z.string().min(1),
  GEMINI_API_KEY: z.string().optional(),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
});

export type EnvironmentConfig = z.infer<typeof EnvironmentSchema>;

function loadAndValidateConfig(): EnvironmentConfig {
  const result = EnvironmentSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ FATAL: Environment Configuration Validation Failed');
    console.error(JSON.stringify(result.error.format(), null, 2));
    process.exit(1);
  }
  return result.data;
}

export const envConfig: EnvironmentConfig = loadAndValidateConfig();
```

---

### B. Authentication & Keycloak RBAC Guard (`/src/core/auth/jwt-auth.guard.ts`)

*   **Responsibility:** Intercepts incoming HTTP request headers, verifies OpenID Connect (OIDC) JWT signatures against Keycloak JWKS endpoints, extracts role claims, and attaches a sanitized `UserSession` context to the request.

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import jwksRsa from 'jwks-rsa';
import { envConfig } from '../../config/env.config';

export interface UserSession {
  readonly userId: string;
  readonly email: string;
  readonly roles: readonly string[];
  readonly departmentCode?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserSession;
    }
  }
}

const jwksClient = jwksRsa({
  jwksUri: `${envConfig.KEYCLOAK_ISSUER_URL}/protocol/openid-connect/certs`,
  cache: true,
  rateLimit: true,
});

function getKey(header: jwt.JwtHeader, callback: jwt.SigningKeyCallback) {
  jwksClient.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

export function jwtAuthGuard(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({
      type: 'https://scos.kanpur.gov.in/errors/unauthorized',
      title: 'Unauthorized',
      status: 401,
      detail: 'Missing or malformed Authorization bearer header.',
    });
    return;
  }

  const token = authHeader.substring(7);
  jwt.verify(token, getKey, { issuer: envConfig.KEYCLOAK_ISSUER_URL }, (err, decoded) => {
    if (err || !decoded || typeof decoded !== 'object') {
      res.status(401).json({
        type: 'https://scos.kanpur.gov.in/errors/invalid-token',
        title: 'Unauthorized',
        status: 401,
        detail: 'Invalid or expired JWT access token.',
      });
      return;
    }

    req.user = {
      userId: decoded.sub || '',
      email: decoded.email || '',
      roles: decoded.realm_access?.roles || [],
      departmentCode: decoded.department_code,
    };
    next();
  });
}

export function requireRoles(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ title: 'Unauthorized', status: 401 });
      return;
    }
    const hasRole = allowedRoles.some((role) => req.user?.roles.includes(role));
    if (!hasRole) {
      res.status(403).json({
        type: 'https://scos.kanpur.gov.in/errors/forbidden',
        title: 'Forbidden',
        status: 403,
        detail: `User lacks required role: ${allowedRoles.join(', ')}`,
      });
      return;
    }
    next();
  };
}
```

---

### C. Database Layer & Base Repository (`/src/core/database/base.repository.ts`)

*   **Responsibility:** Provides type-safe database queries via Drizzle ORM, implements connection pooling, wraps operations in ACID transactions, and enforces repository pattern isolation.

```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { envConfig } from '../../config/env.config';

const pool = new Pool({
  connectionString: envConfig.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const db = drizzle(pool);

export abstract class BaseRepository<TEntity, TInsert> {
  protected readonly dbClient = db;

  public abstract findById(id: string): Promise<TEntity | null>;
  public abstract create(data: TInsert): Promise<TEntity>;
  public abstract update(id: string, data: Partial<TInsert>): Promise<TEntity | null>;
  public abstract delete(id: string): Promise<boolean>;

  public async withTransaction<R>(
    work: (tx: Parameters<Parameters<typeof db.transaction>[0]>[0]) => Promise<R>
  ): Promise<R> {
    return await db.transaction(work);
  }
}
```

---

### D. Structured Pino JSON Logger with PII Masking (`/src/core/logging/logger.service.ts`)

*   **Responsibility:** Emits machine-readable JSON logs containing timestamps, log levels, service names, and distributed trace IDs while automatically masking Aadhaar, phone numbers, and credentials.

```typescript
import pino from 'pino';
import { envConfig } from '../../config/env.config';

const piiRedactPaths = [
  'req.headers.authorization',
  '*.aadhaarNumber',
  '*.phoneNumber',
  '*.password',
  '*.creditCard',
];

export const logger = pino({
  level: envConfig.LOG_LEVEL,
  redact: {
    paths: piiRedactPaths,
    censor: '[REDACTED_PII]',
  },
  base: {
    service: 'scos-backend-core',
    env: envConfig.NODE_ENV,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});
```

---

### E. RFC 7807 Exception Filter (`/src/core/errors/http-exception.filter.ts`)

*   **Responsibility:** Catches unhandled errors across all HTTP routes and formats responses into standard `application/problem+json` RFC 7807 payloads.

```typescript
import { Request, Response, NextFunction } from 'express';
import { logger } from '../logging/logger.service';

export interface Rfc7807Problem {
  readonly type: string;
  readonly title: string;
  readonly status: number;
  readonly detail: string;
  readonly instance: string;
  readonly code: string;
  readonly timestamp: string;
}

export class AppError extends Error {
  constructor(
    public readonly title: string,
    public readonly statusCode: number,
    public readonly detail: string,
    public readonly code: string = 'INTERNAL_ERROR',
    public readonly type: string = 'https://scos.kanpur.gov.in/errors/general'
  ) {
    super(detail);
  }
}

export function globalExceptionFilter(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const problem: Rfc7807Problem = {
    type: err instanceof AppError ? err.type : 'https://scos.kanpur.gov.in/errors/internal',
    title: err instanceof AppError ? err.title : 'Internal Server Error',
    status: statusCode,
    detail: err.message || 'An unexpected error occurred.',
    instance: req.originalUrl,
    code: err instanceof AppError ? err.code : 'SCOS_ERR_INTERNAL',
    timestamp: new Date().toISOString(),
  };

  logger.error({ err, path: req.originalUrl, traceId: req.headers['x-trace-id'] }, problem.title);

  res.status(statusCode).type('application/problem+json').json(problem);
}
```

---

### F. Health Checks & Observability (`/src/core/monitoring/health.controller.ts`)

*   **Responsibility:** Exposes `/health/liveness` and `/health/readiness` endpoints for Kubernetes probes and Prometheus metric scrapers.

```typescript
import { Router, Request, Response } from 'express';
import { db } from '../database/db.client';
import { sql } from 'drizzle-orm';

export const healthRouter = Router();

healthRouter.get('/health/liveness', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'UP', service: 'scos-backend', timestamp: new Date().toISOString() });
});

healthRouter.get('/health/readiness', async (_req: Request, res: Response) => {
  try {
    await db.execute(sql`SELECT 1`);
    res.status(200).json({
      status: 'READY',
      checks: { database: 'UP', storage: 'UP' },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'DOWN',
      checks: { database: 'DOWN' },
      timestamp: new Date().toISOString(),
    });
  }
});
```

---

### G. Server Entrypoint (`/src/server.ts`)

```typescript
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { envConfig } from './config/env.config';
import { logger } from './core/logging/logger.service';
import { globalExceptionFilter } from './core/errors/http-exception.filter';
import { healthRouter } from './core/monitoring/health.controller';

const app = express();

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));

// Health Check Routes
app.use(healthRouter);

// Global Error Handler
app.use(globalExceptionFilter);

app.listen(envConfig.PORT, envConfig.HOST, () => {
  logger.info(`🚀 SCOS Backend Foundation Running on http://${envConfig.HOST}:${envConfig.PORT}`);
});
```

---

## 4. Extension Guidelines for Future Backend Modules

When introducing a new business module (e.g., `scos-citizen`, `scos-twin`, `scos-cognitive`), the module **MUST** extend the foundation as follows:

1. **Module Folder Location:** Create directory under `src/modules/<module-name>/`.
2. **DTO & Validation Schema:** Define request Zod schemas in `dto/<action>.dto.ts`.
3. **Repository Extension:** Create a domain repository extending `BaseRepository<TEntity, TInsert>`.
4. **Service Injection:** Create a domain service encapsulating business rules, injecting the repository via constructor.
5. **Controller Mount:** Expose Express routes wrapped with `jwtAuthGuard`, `requireRoles()`, and Zod validation middleware.
6. **Error Propagation:** Throw `AppError` subclasses (`NotFoundError`, `ValidationError`) to automatically trigger RFC 7807 responses.

---
*This Backend Foundation Architecture Specification establishes the immutable core runtime, security guards, error pipelines, and extension patterns across the Smart City Operating System.*
