# INITIAL DATABASE SCHEMA SPECIFICATION & MODULAR DATA ARCHITECTURE
## System: Smart City Operating System (AI-SCOS) for Indian District Administration
### Academic Subtitle: Polyglot Relational/Spatial Schemas, Cryptographic Audit Tables, Migration Topologies, and Drizzle ORM Extensions
**Institution:** Indian Institute of Technology Kanpur (IIT Kanpur)  
**Author:** Lead Database Architect & Spatial Data Engineering Directorate  

---

## 1. Architectural Overview & Polyglot Database Strategy

The **Smart City Operating System (AI-SCOS)** requires a resilient, multi-engine data storage architecture to manage diverse district data types at scale across Kanpur District:

1. **PostgreSQL 16.4 with PostGIS 3.4.2 (Relational & Spatial Core):** Serves as the primary operational data store for transactional entities, user profiles, municipal ward polygon geometries, citizen grievances, and dispatch assignments.
2. **TimescaleDB Extension (Time-Series Telemetry):** Powers high-throughput SCADA water pressure, Ganga hydrograph levels, and IoT grid telemetry via automated chunked hypertables.
3. **Cryptographic Append-Only Audit Ledger (`scos_audit_ledger`):** A SHA-256 chained audit table ensuring immutable, tamper-evident administrative logging.
4. **Neo4j 5.23 Graph Engine (Topological Network Twin):** Stores physical utility network topologies (e.g., Water Main -> Substation -> Road Section -> Hospital) for multi-hop failure cascade analysis.

---

## 2. Entity-Relationship (ER) Diagram

```
┌────────────────────────┐         ┌────────────────────────┐
│     scos_wards         │         │   scos_departments     │
├────────────────────────┤         ├────────────────────────┤
│ PK  id (UUID)          │         │ PK  id (UUID)          │
│     ward_number (INT)  │         │ UNQ code (VARCHAR)     │
│     ward_name (VARCHAR)│         │     name (VARCHAR)     │
│     boundary (GEOMETRY)│         │     head_email (VARCHAR│
└───────────┬────────────┘         └───────────┬────────────┘
            │ 1                                │ 1
            │                                  │
            │ N                                │ N
┌───────────┴────────────┐         ┌───────────┴────────────┐
│     scos_users         │         │  scos_grievance_tickets│
├────────────────────────┤         ├────────────────────────┤
│ PK  id (UUID)          │◄────────┤ PK  id (UUID)          │
│ UNQ email (VARCHAR)    │ 1     N │ UNQ ticket_number (VAR)│
│     role (VARCHAR)     │         │ FK  citizen_id (UUID)  │
│ FK  ward_id (UUID)     │         │ FK  department_id(UUID)│
│ FK  department_id(UUID)│         │ FK  ward_id (UUID)     │
└────────────────────────┘         │     title (VARCHAR)    │
                                   │     status (VARCHAR)   │
                                   │     location (GEOMETRY)│
                                   └───────────┬────────────┘
                                               │ 1
                                               │
                                               │ N
                                   ┌───────────┴────────────┐
                                   │ scos_dispatch_assigns  │
                                   ├────────────────────────┤
                                   │ PK  id (UUID)          │
                                   │ FK  ticket_id (UUID)   │
                                   │ FK  crew_id (UUID)     │
                                   │     dispatched_at (TS) │
                                   │     status (VARCHAR)   │
                                   └────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                   scos_scada_telemetry (Hypertable)               │
├──────────────────────────────────────────────────────────────────┤
│ PK  time (TIMESTAMPTZ), device_id (VARCHAR)                       │
│     sensor_type (VARCHAR), val_numeric (DOUBLE), location (POINT)│
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│             scos_audit_ledger (SHA-256 Chained)                  │
├──────────────────────────────────────────────────────────────────┤
│ PK  id (UUID), block_index (BIGINT)                              │
│     actor_id (VARCHAR), action (VARCHAR), payload_hash (VARCHAR) │
│     previous_hash (VARCHAR), current_hash (VARCHAR)              │
└──────────────────────────────────────────────────────────────────┘
```

---

## 3. Database Naming Conventions

To guarantee consistency across Drizzle ORM schemas, SQL migrations, and analytical queries, all database objects adhere strictly to these naming rules:

*   **Tables:** Lowercase `snake_case` with mandatory `scos_` domain prefix (e.g., `scos_users`, `scos_grievance_tickets`).
*   **Columns:** Lowercase `snake_case` (e.g., `ward_number`, `created_at`, `is_active`).
*   **Primary Keys:** Named `id` of type `UUID` defaulting to `gen_random_uuid()` (except time-series hypertables which use composite `[time, device_id]`).
*   **Foreign Keys:** Named `<referenced_singular_table_name_without_prefix>_id` (e.g., `ward_id`, `department_id`, `citizen_id`).
*   **Indexes:** Named `idx_<table_without_prefix>_<column_names_snake_case>` (e.g., `idx_grievance_tickets_status_ward`).
*   **Spatial Indexes:** Named `sidx_<table_without_prefix>_<geometry_column>` (e.g., `sidx_wards_boundary`).

---

## 4. Drizzle ORM Schema Definition (`/database/postgres/schema/index.ts`)

```typescript
import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  doublePrecision,
  timestamp,
  boolean,
  index,
  uniqueIndex,
  bigint,
  customType,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// PostGIS Geometry Custom Type Definition
const postgisGeometry = customType<{ data: string; driverData: string }>({
  dataType() {
    return 'geometry(Geometry, 4326)';
  },
});

// 1. Municipal Wards Table
export const scosWards = pgTable(
  'scos_wards',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    wardNumber: integer('ward_number').notNull().unique(),
    wardName: varchar('ward_name', { length: 100 }).notNull(),
    zoneName: varchar('zone_name', { length: 100 }).notNull(),
    boundary: postgisGeometry('boundary'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    wardNumberIdx: uniqueIndex('idx_wards_number').on(table.wardNumber),
  })
);

// 2. Municipal Departments Table
export const scosDepartments = pgTable('scos_departments', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 150 }).notNull(),
  headEmail: varchar('head_email', { length: 255 }).notNull(),
  slaThresholdHours: integer('sla_threshold_hours').default(24).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// 3. User Profiles & Roles Table
export const scosUsers = pgTable(
  'scos_users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    fullName: varchar('full_name', { length: 255 }).notNull(),
    role: varchar('role', { length: 50 }).notNull(), // 'CITIZEN', 'SUPERVISOR', 'FIELD_CREW', 'DM'
    departmentId: uuid('department_id').references(() => scosDepartments.id),
    wardId: uuid('ward_id').references(() => scosWards.id),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: uniqueIndex('idx_users_email').on(table.email),
    roleIdx: index('idx_users_role').on(table.role),
  })
);

// 4. Citizen Grievance Tickets Table
export const scosGrievanceTickets = pgTable(
  'scos_grievance_tickets',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    ticketNumber: varchar('ticket_number', { length: 30 }).notNull().unique(),
    citizenId: uuid('citizen_id').references(() => scosUsers.id).notNull(),
    departmentId: uuid('department_id').references(() => scosDepartments.id).notNull(),
    wardId: uuid('ward_id').references(() => scosWards.id).notNull(),
    title: varchar('title', { length: 200 }).notNull(),
    description: text('description').notNull(),
    status: varchar('status', { length: 50 }).default('SUBMITTED').notNull(),
    priority: varchar('priority', { length: 20 }).default('MEDIUM').notNull(),
    location: postgisGeometry('location'),
    imageUrl: text('image_url'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    ticketNumIdx: uniqueIndex('idx_grievance_ticket_number').on(table.ticketNumber),
    statusDeptIdx: index('idx_grievance_status_dept').on(table.status, table.departmentId),
    wardStatusIdx: index('idx_grievance_ward_status').on(table.wardId, table.status),
  })
);

// 5. Dispatch Assignments Table
export const scosDispatchAssignments = pgTable('scos_dispatch_assignments', {
  id: uuid('id').defaultRandom().primaryKey(),
  ticketId: uuid('ticket_id').references(() => scosGrievanceTickets.id).notNull(),
  crewId: uuid('crew_id').references(() => scosUsers.id).notNull(),
  dispatchedAt: timestamp('dispatched_at', { withTimezone: true }).defaultNow().notNull(),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  status: varchar('status', { length: 50 }).default('ASSIGNED').notNull(),
  notes: text('notes'),
});

// 6. Cryptographic Append-Only Audit Ledger
export const scosAuditLedger = pgTable('scos_audit_ledger', {
  id: uuid('id').defaultRandom().primaryKey(),
  blockIndex: bigint('block_index', { mode: 'number' }).notNull().unique(),
  actorId: varchar('actor_id', { length: 255 }).notNull(),
  action: varchar('action', { length: 100 }).notNull(),
  entityName: varchar('entity_name', { length: 100 }).notNull(),
  entityId: varchar('entity_id', { length: 255 }).notNull(),
  payloadHash: varchar('payload_hash', { length: 64 }).notNull(),
  previousHash: varchar('previous_hash', { length: 64 }).notNull(),
  currentHash: varchar('current_hash', { length: 64 }).notNull(),
  timestamp: timestamp('timestamp', { withTimezone: true }).defaultNow().notNull(),
});
```

---

## 5. Cryptographic Audit Table Architecture

To satisfy enterprise governance standards (`/docs/DEFINITION_OF_DONE.md`), every administrative action (dispatch approvals, status overrides, configuration shifts) is cryptographically signed and appended to `scos_audit_ledger`.

### SHA-256 Chaining Formula:
$$\text{CurrentHash} = \text{SHA256}(\text{BlockIndex} \parallel \text{ActorID} \parallel \text{Action} \parallel \text{PayloadHash} \parallel \text{PreviousHash} \parallel \text{Timestamp})$$

If an attacker modifies a historical audit row, the downstream hash chain breaks instantly, triggering an automated tampering alarm in the AI Command Center.

---

## 6. Migration & Versioning Strategy

Database schema changes are managed via **Drizzle Kit** declarative migrations:

1. **Migration Generation:** Developer executes `pnpm drizzle-kit generate:pg` after modifying `/database/postgres/schema/`.
2. **Migration Review:** Generated SQL in `/database/postgres/migrations/` is inspected for destructive DDL commands (`DROP TABLE`, `DROP COLUMN`).
3. **Execution Pipeline:** CD deployment runs `pnpm drizzle-kit migrate` before rolling out new service pods.
4. **Zero-Downtime Rule:** Schema migrations must be additive (adding new nullable columns or tables first) before deprecating old columns in subsequent releases.

---

## 7. Database Seeding Strategy

Initial district seed data is populated using `/scripts/seed-db.ts`:

*   **Wards:** 110 official Kanpur District municipal wards loaded from `/datasets/kanpur_wards.geojson`.
*   **Departments:** Core municipal bodies (`JAL_SANSTHAN`, `KESCO`, `NAGAR_NIGAM`, `TRAFFIC_POLICE`).
*   **Users:** Seeded admin accounts for District Magistrate, Department Heads, and Field Crews with hashed test passwords.
*   **Grievances:** 50 benchmark Hinglish complaint tickets pre-populated across Kanpur wards for immediate demo testing.

---

## 8. Extension Guide for Future Modules

When a developer adds a new municipal department module (e.g., `scos-waste`, `scos-health`), they **MUST** extend the database schema modularly:

1. **File Location:** Create a new schema file in `/database/postgres/schema/scos-waste.schema.ts`.
2. **Table Prefix:** Use the `scos_` prefix with department identifier (e.g., `scos_waste_collection_routes`).
3. **Foreign Keys:** Reference core entities (`scos_users`, `scos_wards`) via explicit UUID foreign key relationships.
4. **Barrel Export:** Re-export the new schema from `/database/postgres/schema/index.ts`.

---
*This Initial Database Schema Specification establishes the relational, spatial, time-series, and cryptographic audit foundations for the Smart City Operating System.*
