# EIGU Platform - AI Assistant Instructions & Core Rules

> **Root Customization Document for EIGU Platform Workspace**
> **File location:** `.agents/AGENTS.md`

All AI assistants (Antigravity, Claude, GPT, Gemini) working on this workspace MUST adhere strictly to the guidelines below.

---

## 1. System Architecture (Nx Monorepo)

- **Monorepo Management (`npx nx ...`)**:
  - `apps/api` (NestJS): Central Gateway (Port 3001). Provides REST API (Swagger at `/api/docs`) and WebSockets for real-time state.
  - `apps/web` (Next.js): Dashboard and Web Portal (Port 3000). React Flow, Dark/Light Mode, Socket.io.
  - `apps/desktop` (Electron + Node.js): Heavy processing worker (FFmpeg, Puppeteer).
  - `apps/mobile` (Flutter Native): Mobile app.
  - `packages/shared`: Shared types, DTOs, and interfaces across all apps.

---

## 2. Core Code Conventions & Guidelines

### A. Don't Repeat Yourself (DRY) & Shared Types
- Any data structure transmitted over the network (API / WebSocket / IPC) MUST be declared in `packages/shared` and imported across apps.

### B. UI/UX Aesthetics & Design Standards
- **NO RAW EMOJI ICONS AS UI ICONS**: Do not use raw emoji characters for UI navigation icons or action buttons.
  - Web: Use `lucide-react` icons.
  - Desktop: Use inline SVG icons (`js/ui/icons.js`).
  - Mobile: Use Material Icons (`Icons.*`).
- **No Raw `alert()` Calls**:
  - Web components MUST use `useToast()` from `@/contexts/ToastContext` (`showToast(title, description, type)`).
- **Soft UI & Modern Styling**:
  - NEVER use hard black borders (`border: 1px solid #000`).
  - Use soft theme-aware borders (`border: 1px solid var(--border-color)` or `rgba(99, 102, 241, 0.25)`).
  - Use rounded corners (`border-radius: 8px` to `24px`) with smooth hover transitions and soft shadows.
- **Theme Awareness (Dark & Light Mode)**:
  - NEVER hardcode dark colors (e.g. `background: #0f172a` or `color: #ffffff`).
  - Always use CSS variables: `var(--bg-primary)`, `var(--bg-card)`, `var(--bg-secondary)`, `var(--text-primary)`, `var(--text-secondary)`, `var(--border-color)`, `var(--tree-line-color)`.

### C. Responsive UI & Data Tables
- 100% responsive across Mobile (`< 640px`), Tablet (`< 900px`), and Desktop.
- Data tables with > 4 columns must have an `overflow-x: auto` wrapper or transform into Card Grid Layout on mobile screens.

### D. Production & Cross-Platform Readiness
- **Dual OS Compatibility (Windows & macOS)**:
  - NEVER hardcode Unix paths `/` or Windows paths `\` or `/tmp`.
  - Always use Node.js `path.join()`, `path.resolve()`, or `app.getPath('temp')`.
- **Environment Variables**:
  - NEVER hardcode API Keys, DB passwords, or URLs in code. Use `process.env`.
- **Logging**:
  - Backend: Use `@nestjs/common` `Logger`.
  - Frontend: Use `addLog()` (Desktop UI) or `debugPrint()` (Flutter). Avoid raw `console.log` in production code.

---

## 3. Special Technical Systems

### A. Comment Thread Architecture (`Measured SVG Overlay`)
- Spec file: [ThreadsLine_Comment_Docs.md](file:///Users/peggy2402/Projects/eigu-platform/docs/web/ThreadsLine_Comment_Docs.md).
- Measures real-DOM avatar centers using `getBoundingClientRect()`.
- Single `<svg>` overlay in `CommentTree.tsx` re-computes 90° bezier curves automatically on layout shifts via `ResizeObserver`.
- Uses `var(--tree-line-color)` for dynamic stroke color adaptation across Light/Dark modes.

### B. Notification System (`ToastContext.tsx`)
- Import `useToast` from `apps/web/src/contexts/ToastContext.tsx`.
- Call `showToast(title, description, 'success' | 'error' | 'warning' | 'info')`.
