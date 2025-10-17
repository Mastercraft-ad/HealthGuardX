# HealthGuardX Design Guidelines

## Design Approach

**Reference-Based Approach**: Draw inspiration from **Stripe** (trust, clarity, security) + **Linear** (modern minimalism, dark UI excellence) + **Notion** (dashboard organization, information density). This healthcare platform requires establishing trust while projecting cutting-edge technology.

**Core Principles**:
- Security-first visual language: Every design decision reinforces trust and data protection
- Role clarity: Immediate visual differentiation between patient, provider, insurer, and admin contexts
- Audit transparency: Make governance visible without overwhelming users
- Emergency-optimized: Critical information must be scannable in seconds

---

## Core Design Elements

### A. Color Palette

**Dark Mode Foundation** (primary theme):
- Background Base: `222 15% 8%` (deep charcoal)
- Surface: `222 15% 12%` (elevated cards)
- Surface Elevated: `222 15% 16%` (modals, overlays)

**Brand & Trust Colors**:
- Primary Blue: `214 84% 56%` (healthcare trust, primary actions)
- Secondary Teal: `174 72% 56%` (success states, active records)
- Accent Orange: `25 95% 58%` (CTAs, urgent actions, alerts)
- Clinical White: `0 0% 98%` (high-contrast text)

**Semantic Colors**:
- Success (verified/approved): `142 76% 46%`
- Warning (pending KYC): `38 92% 60%`
- Error (rejected/emergency): `0 84% 60%`
- Info (audit logs): `214 84% 56%`

**Glassmorphism Accents**:
- Glass overlay: `rgba(255, 255, 255, 0.05)` with backdrop-blur-lg
- Glass border: `rgba(255, 255, 255, 0.1)` 
- Glow effects on interactive elements: `rgba(59, 130, 246, 0.3)` for primary, `rgba(251, 146, 60, 0.3)` for CTAs

### B. Typography

**Font Stack**:
- Primary (UI): Inter (Google Fonts) - weights 400, 500, 600, 700
- Accent (Headlines): Space Grotesk (Google Fonts) - weights 500, 600, 700
- Monospace (UIDs, hashes): JetBrains Mono (Google Fonts) - weight 400, 500

**Scale**:
- Hero Headline: `text-6xl md:text-7xl` (Space Grotesk 700)
- Section Headers: `text-4xl md:text-5xl` (Space Grotesk 600)
- Dashboard Titles: `text-2xl md:text-3xl` (Space Grotesk 600)
- Card Headers: `text-xl` (Inter 600)
- Body: `text-base` (Inter 400)
- Small/Meta: `text-sm` (Inter 400)
- UID/Hash Display: `text-xs md:text-sm` (JetBrains Mono 500)

### C. Layout System

**Spacing Primitives**: Use Tailwind units `2, 4, 6, 8, 12, 16, 20, 24, 32` for consistent rhythm

**Container Hierarchy**:
- Max-width sections: `max-w-7xl` (1280px)
- Dashboard content: `max-w-6xl` (1152px)
- Form containers: `max-w-2xl` (672px)
- Text content: `max-w-prose` (65ch)

**Grid Patterns**:
- Feature cards: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8`
- Dashboard stats: `grid-cols-2 lg:grid-cols-4 gap-4`
- Audit logs: Single column with timeline connector

**Vertical Rhythm**:
- Landing sections: `py-16 md:py-24 lg:py-32`
- Dashboard sections: `py-8 md:py-12`
- Card padding: `p-6 md:p-8`

### D. Component Library

**Navigation Header**:
- Fixed position, backdrop-blur-xl with `bg-[#0e0e10]/80`
- Logo left, nav center, "Connect Wallet" CTA right (orange accent)
- Admin badge (when admin wallet): Small pill `bg-teal-500/20 border border-teal-500/40 text-teal-400 text-xs` positioned near wallet address

**Buttons**:
- Primary CTA: Orange gradient `bg-gradient-to-r from-orange-500 to-orange-600` with glow on hover
- Secondary: Outlined blue `border-blue-500/50 text-blue-400 hover:bg-blue-500/10`
- Danger: Red `bg-red-500/20 border-red-500/40 hover:bg-red-500/30`
- Ghost: Transparent with white/60 text, hover shows blue tint

**Cards (Glassmorphism)**:
- Base: `bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6`
- Hover: `hover:bg-white/7 hover:border-white/20 transition-all duration-300`
- Active/Selected: `bg-white/10 border-blue-500/50 shadow-lg shadow-blue-500/20`

**UID/QR Display Cards**:
- Prominent card with QR code centered
- UID below in monospace font `JetBrains Mono`
- "Download QR" and "Share" buttons below QR
- Status badges (KYC status, insurance linked) positioned top-right as pills

**Data Tables** (Audit Logs, Claims, KYC Queue):
- Striped rows: `odd:bg-white/5 even:bg-transparent`
- Header: `bg-white/10 text-sm uppercase tracking-wide text-white/70`
- Hover row: `hover:bg-blue-500/10`
- Action buttons in final column

**Form Inputs**:
- Dark variant: `bg-white/5 border border-white/20 text-white placeholder:text-white/40`
- Focus: `focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20`
- Error state: `border-red-500/50 focus:ring-red-500/20`

**Status Badges**:
- Approved: `bg-green-500/20 text-green-400 border border-green-500/40`
- Pending: `bg-yellow-500/20 text-yellow-400 border border-yellow-500/40`
- Rejected: `bg-red-500/20 text-red-400 border border-red-500/40`
- Emergency: `bg-orange-500/30 text-orange-300 border border-orange-500/50 animate-pulse`

**Modals/Overlays**:
- Backdrop: `bg-black/80 backdrop-blur-sm`
- Modal card: Same glassmorphism as cards, centered, `max-w-2xl`
- Close button: Top-right, ghost style

### E. Landing Page Specifics

**Hero Section**:
- Full viewport height `min-h-screen`, gradient background from `#0a0a0f` to `#0e1420`
- Floating network lines: Subtle SVG animation of connecting dots in blue/teal
- Left: Headline + subheadline + CTA stack
- Right: Semi-transparent glass card mockup showing app dashboard (screenshot or illustrated preview) with looping micro-animation

**Features Section**:
- 6 cards in `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Each card: Icon (Font Awesome or Heroicons), title, 2-sentence description
- Icons use gradient fills `from-blue-400 to-teal-400`

**Workflow Timeline**:
- Horizontal stepper on desktop, vertical on mobile
- 5 steps: Onboarding → KYC → QR Generation → Emergency Scan → Claim Approval
- Each step expandable (accordion) with technical details
- Active step highlighted with blue glow

**Live Activity Feed**:
- Fixed-height scrollable container `h-96`
- Real-time event cards sliding in from top with fade animation
- Each event: timestamp, icon (based on type), human-readable text, link to relevant dashboard section
- Auto-scroll to newest event

### F. Dashboard Layout Framework

**Sidebar Navigation** (Persistent):
- Fixed left sidebar `w-64`, dark background `bg-[#0e0e10]`
- Logo at top, nav items below, wallet/profile at bottom
- Active nav item: Blue left border `border-l-4 border-blue-500`, blue background tint

**Main Content Area**:
- Top bar: Page title, breadcrumbs, action buttons (right-aligned)
- Stats cards row: 2-4 cards showing key metrics (e.g., "Total Records: 14", "Pending Approvals: 3")
- Main content sections below with clear section headers

**Patient Dashboard**:
- Top: UID card (QR + metadata) with prominent placement
- Grid below: Records list (left 2/3), Access Control panel (right 1/3)
- Audit log timeline at bottom, full-width

**Admin Dashboard**:
- Top: System health stats (4-card grid)
- KYC Queue table (main focus, full-width)
- Role Approvals below
- Audit log search with filters in collapsible panel

### G. Animations & Interactions

**Micro-Interactions** (Minimal, purposeful):
- Button hover: Subtle scale `scale-105`, glow intensify
- Card hover: Lift with shadow `shadow-xl shadow-blue-500/10`
- Loading states: Skeleton screens with shimmer gradient

**Page Transitions**:
- Dashboard route changes: Fade crossfade, no slide
- Modal open: Scale from 95% to 100% with fade

**Emergency Indicators**:
- Emergency access request: Red pulse animation on notification bell
- Active emergency session: Animated red border on active patient card

### H. Accessibility

- Minimum contrast ratio: 4.5:1 for body text, 7:1 for headings
- Focus indicators: 2px blue ring `ring-2 ring-blue-500` on all interactive elements
- Keyboard navigation: Tab order follows visual hierarchy
- ARIA labels on all icon-only buttons
- Screen reader announcements for real-time event updates

### I. Responsive Breakpoints

- Mobile: `< 768px` - Single column, stacked navigation, full-width cards
- Tablet: `768px - 1024px` - 2-column grids, collapsible sidebar
- Desktop: `> 1024px` - 3-column grids, persistent sidebar, full feature set

---

## Images

**Hero Section**: Large semi-transparent mockup image showing the HealthGuardX dashboard interface. The image should depict a dark-themed medical dashboard with visible QR code, patient records, and glassmorphic UI elements. Place this on the right side of the hero (60% width on desktop, full-width below hero text on mobile). The image should have a subtle glow effect and appear to float with `shadow-2xl shadow-blue-500/20`.

**Feature Icons**: Use Font Awesome or Heroicons for feature card icons (Emergency QR: `fa-qrcode`, Encrypted Records: `fa-lock-shield`, Dashboards: `fa-gauge`, Insurance: `fa-file-invoice-dollar`, Audit Logs: `fa-timeline`, QR/NFC: `fa-mobile`).

**No other images required** - rely on illustrations via SVG animations and icon libraries to maintain performance and consistency.