# SCOS DESIGN SYSTEM & DESIGN SPECIFICATION (CIVIC SLATE DESIGN SYSTEM)
## System: Smart City Operating System (SCOS) for Indian District Administration
### Academic Subtitle: A Unified UI Design Token System, Responsive Component Libraries, and Spatial Information Displays
**Institution:** Indian Institute of Technology Kanpur (IIT Kanpur)  
**Author:** M.Tech Thesis Research Sandbox  
**Role:** Senior Product Designer & Design System Lead  

---

## Executive Summary

At city scale, a Smart City Operating System is accessed by diverse user groups under varying conditions. The District Magistrate requires dense, high-contrast maps on multi-screen control panels. A municipal field engineer coordinates repairs on-site via mobile devices under bright sunlight. A citizen registers grievances using localized language text on low-cost smartphones.

If these visual interfaces are built with inconsistent, low-contrast, or overly decorated elements, the system's operational efficiency drops. SCOS rejects generic, over-decorated templates in favor of **The Civic Slate Design System (CSDS)**—a professional, high-contrast system inspired by the functional minimalism of **IBM Carbon** and the structure of **Material Design**.

This document establishes the official design guidelines, color codes, typography pairings, grid system rules, and standard visual patterns for all SCOS interfaces.

---

## 1. Core Design Principles

Our design choices are guided by four core principles to ensure the system is functional, accessible, and professional:

1.  **Aesthetic Honesty (No Clutter):** Avoid decorative borders, fake status lights, or unrequested telemetry logs. Every component must serve a functional purpose.
2.  **Clear Visual Hierarchy:** Primary actions must be instantly recognizable, utilizing size, color contrast, and spacing rather than generic decorations.
3.  **High Contrast & Readability First:** Every UI state must maintain clean contrast levels, ensuring legibility under direct sunlight or within dark control rooms.
4.  **Device-Responsive Layouts:** Components must scale gracefully from 30-inch command center monitors to 5-inch mobile displays.

---

## 2. Design Tokens: Colors, Typography, & Spacing

These tokens serve as the underlying visual building blocks of SCOS, mapped directly to Tailwind classes:

---

### A. Core Slate Color Palette

SCOS uses high-contrast light and dark themes based on a professional **Slate** palette:

#### Dark Slate Theme (Default for Command Dashboards & GIS Twin)
*   `background`: Slate-950 (`#020617`) - Pure dark canvas.
*   `surface`: Slate-900 (`#0f172a`) - Standard card container background.
*   `border`: Slate-800 (`#1e293b`) - Grid borders and line boundaries.
*   `text-primary`: Slate-50 (`#f8fafc`) - Title text and primary readouts.
*   `text-secondary`: Slate-400 (`#94a3b8`) - Descriptions and static labels.

#### Light Civic Theme (Default for Citizen Portal & Field Apps)
*   `background`: Gray-50 (`#f9fafb`) - Off-white canvas.
*   `surface`: White (`#ffffff`) - Standard card background.
*   `border`: Gray-200 (`#e5e7eb`) - Visual boundaries.
*   `text-primary`: Gray-900 (`#111827`) - Core titles and labels.
*   `text-secondary`: Gray-500 (`#6b7280`) - Auxiliary labels.

#### Standard Operational Status Colors
*   `primary` (Emerald-500: `#10b981`): Success, active sensors, and validated projects.
*   `danger` (Rose-500: `#f43f5e`): Tripped circuit breakers, critical incidents, and active alerts.
*   `warning` (Amber-500: `#f59e0b`): Pending approvals and moderate threshold warnings.
*   `info` (Blue-500: `#3b82f6`): System messages and scheduled updates.

---

### B. Typography Pairings
*   **Sans Font (General UI, Labels, and Forms):** **Inter** (sans-serif)
    *   Provides excellent legibility at small sizes ($12\text{px}$ to $14\text{px}$) with clean character rendering.
*   **Display Font (Headings, Metrics, and Titles):** **Space Grotesk** (sans-serif)
    *   Provides a modern, structured layout for major metrics and dashboard section titles.
*   **Mono Font (Coordinates, Telemetry Arrays, and IDs):** **JetBrains Mono** (monospace)
    *   Enforces precise vertical character alignment, which is critical for reading numeric sensor streams and geospatial coordinate pairs.

---

### C. Spacing System
SCOS enforces a strict **8px grid system** to maintain visual rhythm:
*   `xs`: $4\text{px}$ — Inline element gaps (e.g., icons next to labels).
*   `sm`: $8\text{px}$ — Small card margins and badge paddings.
*   `md`: $16\text{px}$ — Standard card paddings, button heights, and element boundaries.
*   `lg`: $24\text{px}$ — Section gaps, layout spacing, and margins.
*   `xl`: $48\text{px}$ — Large header margins and structural separators.

---

### D. Responsive Grid System
*   **Desktop Dashboards (12-Column Grid):** Outer container with `w-full max-w-7xl mx-auto px-6`. Uses grid column mappings for complex bento-grid dashboards:
    *   Left side (GIS Map): `col-span-8`
    *   Right side (Activity Panel): `col-span-4`
*   **Mobile Portals (1-Column Flow):** Outer container styled with `w-full px-4`. Cards, inputs, and actions scale to full screen width.

---

## 3. Core Component Library

Every SCOS component is designed to be highly interactive, accessible, and clean:

---

### A. Card Systems
*   *Styling:* Card surfaces use a subtle boundary border (`border border-slate-800`), standard corner rounding (`rounded-lg`), and clean, inner paddings (`p-6`).
*   *Visual Rhythm:* Avoid deep box-shadows. Rhythm is established purely through border shifts (`hover:border-slate-700`) and slight background variations.

```
┌──────────────────────────────────────────────┐
│  Card Header: Space Grotesk Bold, 16px       │
│  Border separator: border-slate-800         │
├──────────────────────────────────────────────┤
│  Card Body: Inter 14px Text                  │
│  Metrics displayed in JetBrains Mono 24px    │
└──────────────────────────────────────────────┘
```

---

### B. Tables & Data Lists
*   *Headers:* Small caps, semi-bold text (`text-xs font-semibold tracking-wider text-slate-400`), wrapped in a Slate background bar.
*   *Rows:* Minimal horizontal dividers (`border-b border-slate-800`). Rows feature subtle hover highlights (`hover:bg-slate-900/40`) to make scanning large data tables comfortable.
*   *Data Density:* Fixed row heights (e.g., `h-12` for compact tables, `h-16` for tables with secondary description lines) to keep alignment consistent.

---

### C. Form Elements & Input States
Forms must clearly state input requirements, with clear visual feedback for every user interaction:
*   *Default Input:* Single border (`border-slate-800`), slate background (`bg-slate-950`), and Inter typography.
*   *Focus State:* Focus indicator uses an emerald border highlight (`focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500`) with no outline offsets.
*   *Disabled State:* Gray background (`bg-slate-900`), muted gray border (`border-slate-800`), and disabled cursor (`cursor-not-allowed`).
*   *Error State:* Bright rose-red boundary (`border-rose-500`) with a small error description line (`text-xs text-rose-500 mt-1`).

---

### D. Standard Action Buttons
SCOS supports three button variations:
1.  **Primary Button:** Highly visible action trigger. Deep emerald background (`bg-emerald-600 hover:bg-emerald-500 text-slate-50 font-medium rounded-md px-4 py-2`).
2.  **Secondary Button:** For supporting actions. Hollow, bordered layout (`border border-slate-700 hover:bg-slate-900 text-slate-200 rounded-md px-4 py-2`).
3.  **Destructive Button:** For critical, irreversible operations (e.g., system overrides). Dark rose background (`bg-rose-600 hover:bg-rose-500 text-slate-50 rounded-md px-4 py-2`).

---

### E. Alert Banners & Badges
*   **Alert Banners:** Framed elements spanning full containers (`p-4 rounded-md border`). The layout uses structural background shades with a left-aligned icon:
    *   *Critical Incident:* Rose border (`border-rose-500/20 bg-rose-500/10 text-rose-200`).
    *   *Warning Alert:* Amber border (`border-amber-500/20 bg-amber-500/10 text-amber-200`).
*   **Badges (Status Indicators):** Compact inline labels (`text-xs font-semibold uppercase px-2.5 py-0.5 rounded-full`):
    *   *Active Ticket status:* `bg-emerald-500/10 text-emerald-400 border border-emerald-500/20`.
    *   *Pending Ticket status:* `bg-amber-500/10 text-amber-400 border border-amber-500/20`.

---

## 4. UI Layout Containers

SCOS visual layers are structured using three distinct layout models:

---

### A. Sidebar Navigation Shell
Optimized for administrative control dashboards:
*   **Left Vertical Rail (Width 64):** Standard background (`bg-slate-900`), thin right-hand boundary line (`border-r border-slate-800`). Houses the organization branding, portal-selection list, user profile badge, and system status indicators.
*   **Top Header Bar (Height 16):** Houses secondary navigation components, breadcrumbs, search bars, notifications triggers, and quick settings selectors.
*   **Center Workspace:** Generous negative space padding (`p-8`), with content structured inside an auto-scaling grid system.

---

### B. Citizen Bottom Navigation bar
Designed specifically for mobile touchscreens:
*   A fixed, bottom-anchored horizontal bar (`h-16 bg-slate-900/95 backdrop-blur border-t border-slate-800`).
*   Splits the viewport width into equal-width action icons (Home, My Grievances, New Complaint, Profile), offering large, touch-safe targets ($>44\text{px}$).

---

### C. GIS Interactive Map Viewport
The primary interface for the SCOS-TWIN Digital Twin:
*   **Full Screen Map Canvas (`w-screen h-screen`):** Vector-rendered map layer stretching edge-to-edge.
*   **Floating Control Cards:** Floating, semi-transparent controls with standard corner rounding (`bg-slate-900/90 backdrop-blur border border-slate-800 p-4 absolute top-4 left-4 z-10`). Houses layer control switches, legends, and sensor filter buttons.
*   **Side Information Panel:** A slide-out drawer panel (`w-96 h-screen border-l border-slate-800 absolute top-0 right-0 z-10 bg-slate-950`) displaying detailed diagnostics when a map node or asset is selected.

---

## 5. UI Status Views (Loading, Empty, and Error States)

The SCOS design system guarantees clean, informative feedback even when operations fail or are loading:

---

### A. Loading Skeleton Overrides
During asynchronous data fetching, SCOS avoids loading spinners in favor of structural skeletons:
*   **Card Skeleton:** Placeholder blocks styled with simple backgrounds (`bg-slate-900 animate-pulse rounded-lg h-48`). 
*   **Sizing:** Skeletons mimic the exact visual dimensions of the content they replace, preventing annoying layout jumps once data hydrates.

---

### B. Empty State Illustrations
When a query returns zero results (e.g., "No Active Grievances in this Ward"):
*   **Visual Structure:** Centered layout with generous vertical paddings (`py-12 px-4 flex flex-col items-center text-center`).
*   **Content:** A muted, clean icon, a descriptive heading in Space Grotesk, a helpful explanation line in Inter, and a clear primary action button (e.g., "Submit New Complaint").

---

### C. Error Boundaries & Fallback Views
If a microservice fails to load, or an API error occurs, SCOS wraps the section inside a localized error boundary:
*   **Visual Structure:** Clean, Slate-styled card with a rose-red left accent bar.
*   **Details:** Displays a machine-readable error reference code in mono (`SCOS_ERR_NETWORK_TIMEOUT`) and provides a primary "Retry Connection" button, ensuring the user is never left with a blank or frozen screen.

---
*This design system specification establishes the visual guidelines, typography rules, color palettes, and interactive component libraries required to build highly accessible, responsive, and polished smart city interfaces across all portals.*
