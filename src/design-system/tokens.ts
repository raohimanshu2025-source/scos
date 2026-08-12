/**
 * SCOS Centralized Design Tokens
 * Smart City Operating System — IIT Kanpur Thesis & Urban Command Center
 */

export const SCOSTokens = {
  // Color Palette
  colors: {
    // Brand & Institutional
    brand: {
      primary: '#0f172a',      // Slate 900
      primaryHover: '#1e293b', // Slate 800
      accent: '#2563eb',       // Blue 600
      accentHover: '#1d4ed8',   // Blue 700
      lightAccent: '#eff6ff',  // Blue 50
    },

    // Background & Surfaces
    surface: {
      appBg: '#f8fafc',        // Slate 50
      cardBg: '#ffffff',       // White
      cardHover: '#f1f5f9',     // Slate 100
      sidebarBg: '#0f172a',    // Dark Command Slate
      topbarBg: '#0f172a',     // Top Navigation Slate
      mutedBg: '#f1f5f9',      // Slate 100
    },

    // Borders & Dividers
    border: {
      subtle: '#e2e8f0',       // Slate 200
      default: '#cbd5e1',      // Slate 300
      dark: '#334155',         // Slate 700
      focus: '#3b82f6',        // Blue 500
    },

    // Typography Colors
    text: {
      heading: '#0f172a',      // Slate 900
      body: '#334155',         // Slate 700
      muted: '#64748b',        // Slate 500
      subtle: '#94a3b8',       // Slate 400
      inverse: '#ffffff',      // White
      inverseMuted: '#cbd5e1', // Slate 300
    },

    // SCOS Operational Status Colors
    status: {
      NORMAL: {
        bg: '#ecfdf5',
        text: '#065f46',
        border: '#a7f3d0',
        badge: '#10b981',
      },
      WATCH: {
        bg: '#fffbe3',
        text: '#854d0e',
        border: '#fde68a',
        badge: '#f59e0b',
      },
      WARNING: {
        bg: '#fff7ed',
        text: '#9a3412',
        border: '#ffedd5',
        badge: '#f97316',
      },
      CRITICAL: {
        bg: '#fef2f2',
        text: '#991b1b',
        border: '#fecaca',
        badge: '#ef4444',
      },
      OFFLINE: {
        bg: '#f8fafc',
        text: '#475569',
        border: '#e2e8f0',
        badge: '#64748b',
      },
    },

    // AI Status Tokens
    ai: {
      ACTIVE: {
        bg: '#f0fdf4',
        text: '#166534',
        badge: '#22c55e',
      },
      RECOMMENDATION: {
        bg: '#f0f9ff',
        text: '#075985',
        badge: '#0284c7',
      },
      REVIEW_REQUIRED: {
        bg: '#fff7ed',
        text: '#9a3412',
        badge: '#ea580c',
      },
      CONFIDENCE_LOW: {
        bg: '#fef2f2',
        text: '#991b1b',
        badge: '#dc2626',
      },
    },

    // Department Operational Status
    department: {
      OPERATIONAL: { bg: '#dcfce7', text: '#15803d', border: '#86efac' },
      DEGRADED: { bg: '#fef9c3', text: '#a16207', border: '#fef08a' },
      DISRUPTED: { bg: '#ffedd5', text: '#c2410c', border: '#fed7aa' },
      OFFLINE: { bg: '#f1f5f9', text: '#64748b', border: '#cbd5e1' },
    },
  },

  // Typography Tokens
  typography: {
    fontFamily: {
      sans: 'Inter, ui-sans-serif, system-ui, sans-serif',
      mono: 'JetBrains Mono, ui-monospace, SFMono-Regular, monospace',
    },
    sizes: {
      display: { fontSize: '2rem', lineHeight: '2.5rem', fontWeight: '700' },      // 32px
      h1: { fontSize: '1.5rem', lineHeight: '2rem', fontWeight: '700' },          // 24px
      h2: { fontSize: '1.25rem', lineHeight: '1.75rem', fontWeight: '600' },       // 20px
      h3: { fontSize: '1.125rem', lineHeight: '1.5rem', fontWeight: '600' },        // 18px
      body: { fontSize: '0.875rem', lineHeight: '1.25rem', fontWeight: '400' },     // 14px
      small: { fontSize: '0.75rem', lineHeight: '1rem', fontWeight: '400' },        // 12px
      caption: { fontSize: '0.6875rem', lineHeight: '0.875rem', fontWeight: '500' },// 11px
      metric: { fontSize: '1.75rem', lineHeight: '2.25rem', fontWeight: '800' },   // 28px
    },
  },

  // Spacing Scale
  spacing: {
    xs: '0.25rem',  // 4px
    sm: '0.5rem',   // 8px
    md: '1rem',     // 16px
    lg: '1.5rem',   // 24px
    xl: '2rem',     // 32px
    '2xl': '3rem',  // 48px
  },

  // Border Radii
  radii: {
    none: '0px',
    sm: '0.375rem', // 6px
    md: '0.5rem',   // 8px
    lg: '0.75rem',  // 12px
    xl: '1rem',     // 16px
    full: '9999px',
  },

  // Elevation / Shadows
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },

  // Z-Index Levels
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },

  // Component Layout Heights
  heights: {
    topbar: '3.75rem', // 60px
    sidebarWidth: '16rem', // 256px
    sidebarCollapsedWidth: '4.5rem', // 72px
  },
} as const;

export type OperationalStatusType = 'NORMAL' | 'WATCH' | 'WARNING' | 'CRITICAL' | 'OFFLINE';
export type AiStatusType = 'ACTIVE' | 'RECOMMENDATION' | 'REVIEW_REQUIRED' | 'CONFIDENCE_LOW';
export type DepartmentStatusType = 'OPERATIONAL' | 'DEGRADED' | 'DISRUPTED' | 'OFFLINE';
