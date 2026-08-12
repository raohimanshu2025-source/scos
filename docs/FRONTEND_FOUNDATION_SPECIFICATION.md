# FRONTEND FOUNDATION ARCHITECTURE & CORE UI SPECIFICATION
## System: Smart City Operating System (AI-SCOS) for Indian District Administration
### Academic Subtitle: Enterprise App Shell, Layout System, RBAC Navigation, State Topologies, and Accessibility Engineering
**Institution:** Indian Institute of Technology Kanpur (IIT Kanpur)  
**Author:** Office of the Chief Frontend Architect & Civic Experience Engineering Group  

---

## 1. Executive Summary & Architectural Philosophy

The **Smart City Operating System (AI-SCOS)** frontend foundation is built to support high-density, mission-critical civic administration workflows across Kanpur District. Designed for district magistrates, departmental engineers, municipal operators, and citizens, the UI layer prioritizes **extreme legibility**, **zero-latency state synchronization**, **bulletproof error handling**, and **inclusive tri-lingual accessibility (English, Hindi, Hinglish)**.

This specification details the structural architecture of the App Shell, Layout Engine, Routing Topology, Keycloak OIDC Authentication Flow, Zustand State Stores, Theme System, Tri-lingual Localization, Error Boundaries, Skeleton Hydration, and Reusable Civic Component Library.

---

## 2. Directory Hierarchy & Folder Structure

All frontend code strictly adheres to lower-case `kebab-case` folder naming and modular component structures as mandated in `/docs/CODE_GENERATION_STANDARDS.md`.

```
src/
├── assets/                     # Static SVG icons, municipal logos, map markers
│   ├── icons/
│   └── logos/
├── components/                 # Reusable Civic UI Component Library
│   ├── feedback/               # Error Boundaries, Toast Notifications, Loading Skeletons
│   │   ├── CivicErrorBoundary.tsx
│   │   ├── SkeletonCard.tsx
│   │   └── ToastContainer.tsx
│   ├── layout/                 # Core Shell Layout Components
│   │   ├── AppShell.tsx
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Footer.tsx
│   │   └── Breadcrumbs.tsx
│   ├── primitives/             # Low-level Atomic UI Primitives
│   │   ├── Button.tsx
│   │   ├── Badge.tsx
│   │   ├── Modal.tsx
│   │   ├── Table.tsx
│   │   ├── Input.tsx
│   │   └── Card.tsx
│   └── widgets/                # Domain-Agnostic Civic Widgets
│       ├── StatWidget.tsx
│       └── StatusPill.tsx
├── config/                     # Frontend Configuration & Feature Flags
│   ├── app.config.ts           # Runtime environment bindings
│   └── navigation.config.ts    # RBAC route navigation definitions
├── features/                   # Domain-Specific Feature Modules
│   ├── citizen-ingress/        # CPGRAMS & Citizen Ticket Submission
│   ├── command-centre/         # UCCC Real-time Telemetry & Map Controls
│   ├── ganges-hydro/           # Ganga Barrage Telemetry & Early Warning
│   ├── iot-fleet/              # Streetlight & Municipal Vehicle Tracker
│   └── thesis-sandbox/         # M.Tech AI Model Hyperparameter Sandbox
├── hooks/                      # Custom React Hooks
│   ├── useAuth.ts              # Keycloak Session & RBAC Hook
│   ├── useI18n.ts              # Tri-Lingual Localization Hook
│   ├── useSpatialQuery.ts      # GIS Map Feature Selection Hook
│   └── useWebSocket.ts         # Live Telemetry Stream Hook
├── i18n/                       # Localization Dictionaries
│   ├── en.json                 # English Dictionary
│   ├── hi.json                 # Hindi Dictionary
│   └── hinglish.json           # Hinglish Dictionary
├── layouts/                    # Layout Templates (Dashboard, Focus, Fullscreen Map)
│   ├── AdministrativeLayout.tsx
│   └── CitizenLayout.tsx
├── routes/                     # Router Configuration & Guards
│   ├── AppRoutes.tsx
│   └── ProtectedRoute.tsx
├── stores/                     # Zustand Global State Stores
│   ├── useAuthStore.ts         # Session & Roles State
│   ├── useTelemetryStore.ts    # District IoT & Hydro State
│   ├── useI18nStore.ts         # Active Language State
│   └── useThemeStore.ts        # Dark/Light Mode & Density State
├── styles/                     # Tailwind Extensions & Design Tokens
│   ├── tokens.css              # Custom CSS Variable Tokens
│   └── typography.css          # Font Family Rules
├── types/                      # Global TypeScript Definitions
│   ├── auth.types.ts
│   ├── telemetry.types.ts
│   └── navigation.types.ts
├── utils/                      # Pure Utility Functions
│   ├── date-formatter.util.ts
│   └── spatial-distance.util.ts
├── App.tsx                     # Main Application Orchestrator Component
├── main.tsx                    # React 18 Concurrent Root Entrypoint
└── index.css                   # Tailwind Import Engine
```

---

## 3. App Shell Architecture & Layout Engine

The App Shell establishes a fixed, non-flickering viewport layout optimized for 1080p and 4K command room displays while gracefully adapting to mobile devices used by field officers.

### Layout System Principles:
1. **Header (Fixed Top):** 64px height. Contains District Magistrate branding, system health indicators, live clock, language selector, and user profile.
2. **Sidebar Navigation Rail (Fixed Left):** 256px expanded / 64px collapsed. Houses primary governance pillar navigation with badge counts and active tab indicators.
3. **Workspace Portal (Flexible Center):** Scrollable container with `overflow-y-auto`, `p-6` padding, and responsive grid layouts.
4. **Footer (Fixed Bottom):** 32px height. Displays IIT Kanpur research attribution, active WebSocket status, and security compliance badge.

```tsx
// src/components/layout/AppShell.tsx
import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { CivicErrorBoundary } from '../feedback/CivicErrorBoundary';

export interface AppShellProps {
  readonly children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      <Header />
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <Sidebar 
          isCollapsed={isSidebarCollapsed} 
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
        />
        <main id="scos-main-workspace" className="flex-1 bg-slate-950 p-6 overflow-y-auto space-y-6">
          <CivicErrorBoundary>
            {children}
          </CivicErrorBoundary>
        </main>
      </div>
      <Footer />
    </div>
  );
};
```

---

## 4. Routing & Role-Based Access Control (RBAC)

Routing is powered by a declarative React Router model integrated with Keycloak OIDC role verification.

### Supported Governance Roles:
*   `ROLE_DM`: District Magistrate (Unrestricted District Access)
*   `ROLE_DEPT_HEAD`: Department Head (Water, Kesco, KMC, PWD)
*   `ROLE_FIELD_ENGINEER`: Field Dispatch Crew
*   `ROLE_CITIZEN`: Citizen Ingress Only

```tsx
// src/routes/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react'
import { useAuthStore } from '../stores/useAuthStore';

export interface ProtectedRouteProps {
  readonly allowedRoles: readonly string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const hasAccess = allowedRoles.some((role) => user?.roles.includes(role));
  if (!hasAccess) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};
```

---

## 5. State Management Topology (Zustand)

Global frontend state is managed using **Zustand** stores designed for extreme atomic performance and minimal re-render cascades.

### Store Hierarchy:
1. **`useAuthStore`**: Handles Keycloak JWT, session timers, and active user profile.
2. **`useTelemetryStore`**: Stores real-time IoT node data, Ganga Barrage hydrograph levels, and CPGRAMS ticket state.
3. **`useI18nStore`**: Controls active locale (`en` | `hi` | `hinglish`) and translation lookups.
4. **`useThemeStore`**: Manages light/dark/high-contrast display modes and visual density.

```typescript
// src/stores/useAuthStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserSession {
  readonly userId: string;
  readonly name: string;
  readonly roles: readonly string[];
  readonly departmentCode?: string;
}

interface AuthState {
  user: UserSession | null;
  isAuthenticated: boolean;
  token: string | null;
  setSession: (user: UserSession, token: string) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      token: null,
      setSession: (user, token) => set({ user, token, isAuthenticated: true }),
      clearSession: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    { name: 'scos-auth-session' }
  )
);
```

---

## 6. Design Tokens & Visual Theme Engine

AI-SCOS employs a custom design token system leveraging Tailwind CSS and CSS variables. The primary palette utilizes sophisticated Slate neutrals with high-contrast civic status accents (Emerald for Optimal, Amber for Warning, Rose for Critical, Sky for Information).

### Design Token Table:
| Token Name | Hex Value | Semantic Purpose |
| :--- | :--- | :--- |
| `--color-slate-950` | `#020617` | Primary Dark Canvas |
| `--color-slate-900` | `#0f172a` | Card & Header Surface Background |
| `--color-slate-800` | `#1e293b` | Primary Border & Divider Accent |
| `--color-emerald-400`| `#34d399` | Optimal Telemetry / SLA Success |
| `--color-amber-400`  | `#fbbf24` | Warning Level / Medium Escalation |
| `--color-rose-500`   | `#f43f5e` | Critical Spill / Emergency Alarm |
| `--color-sky-400`    | `#38bdf8` | IoT Grid & System Information |

---

## 7. Tri-Lingual Localization Engine (English, Hindi, Hinglish)

To serve municipal officers and local citizens seamlessly across Kanpur District, AI-SCOS includes native tri-lingual support.

```json
// src/i18n/hinglish.json
{
  "app_title": "Smart City Command System",
  "ganga_warning": "Ganga Water Level Danger Line ke paas hai!",
  "dispatch_btn": "Action Approve Karein",
  "grievance_status_pending": "DM Approval Pending",
  "grievance_status_dispatched": "Field Team Rawana Ho Gayi"
}
```

```typescript
// src/stores/useI18nStore.ts
import { create } from 'zustand';
import en from '../i18n/en.json';
import hi from '../i18n/hi.json';
import hinglish from '../i18n/hinglish.json';

export type SupportedLocale = 'en' | 'hi' | 'hinglish';

const dictionaries = { en, hi, hinglish };

interface I18nState {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: (key: keyof typeof en) => string;
}

export const useI18nStore = create<I18nState>()((set, get) => ({
  locale: 'en',
  setLocale: (locale) => set({ locale }),
  t: (key) => {
    const activeDict = dictionaries[get().locale] || en;
    return activeDict[key] || en[key] || key;
  },
}));
```

---

## 8. Error Boundaries & Fallback UI

When an unexpected component exception occurs, the `CivicErrorBoundary` intercepts the failure, logs diagnostic details, and displays an RFC 7807 compliant recovery UI without crashing the entire command portal.

```tsx
// src/components/feedback/CivicErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class CivicErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('❌ UI Error Boundary Caught Exception:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 rounded-2xl bg-rose-950/20 border border-rose-500/30 text-rose-300 max-w-2xl mx-auto my-12 font-mono">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-rose-400 shrink-0" />
            <div>
              <h2 className="text-lg font-bold text-rose-200">Component Render Fault</h2>
              <p className="text-xs text-rose-400 mt-1">An unhandled exception was trapped in this workspace module.</p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-slate-950 rounded-lg text-xs border border-rose-950 overflow-x-auto text-slate-300">
            {this.state.error?.message || 'Unknown runtime error'}
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-6 flex items-center gap-2 bg-rose-500 text-black px-4 py-2 rounded-xl text-xs font-bold hover:bg-rose-400 transition-all"
          >
            <RefreshCw className="h-4 w-4" /> Reset Module Surface
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## 9. Accessibility & WCAG 2.1 AAA Compliance Rules

AI-SCOS mandates absolute accessibility compliance across all UI components:
1. **Unique HTML ID Attributes:** Every button, card, input, and modal features a unique `id` attribute matching domain naming rules (e.g., `id="btn-approve-dispatch-CPG-9041"`).
2. **Contrast Ratio:** Text on dark surfaces maintains a minimum contrast ratio of **7:1** (WCAG AAA).
3. **Keyboard Navigation:** Full focus trap support in modals, tabIndex rings (`focus:ring-2 focus:ring-emerald-400`), and `Escape` key listeners.
4. **ARIA Roles:** Explicit `aria-label`, `aria-expanded`, and `aria-live="polite"` annotations for live telemetry updates.

---

## 10. Key Decisions & Technical Justifications

| Decision | Chosen Technology | Rationale & Trade-off Analysis |
| :--- | :--- | :--- |
| **State Library** | Zustand | Zero-boilerplate, ultra-lightweight (1kB), non-invasive React state engine avoiding Redux overhead. |
| **Styling Engine** | Tailwind CSS v4 | Class-based mathematical utility styling eliminating separate CSS bundle bloat. |
| **Localization** | Custom Zustand Store | Direct synchronous dictionary lookups without massive i18next runtime bundle weight. |
| **Icons** | Lucide React | Clean, scalable vector SVG icon set matching modern command dashboard aesthetics. |
| **Color System** | Dark Slate Canvas | Prevents glare fatigue during 24/7 continuous monitoring shifts in UCCC command rooms. |

---
*This Frontend Foundation Architecture Specification establishes the structural layout, state topology, localization contracts, and accessibility standards for the Smart City Operating System.*
