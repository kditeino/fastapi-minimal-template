<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-09 | Updated: 2026-04-09 -->

# vite-ts/src

## Purpose
Application source code for the Vite + React Router implementation. Mirrors the `next-ts/src` architecture but uses client-side routing instead of Next.js App Router.

## Key Files
| File | Description |
|------|-------------|
| `app.tsx` | Root React component — wraps app with providers |
| `main.tsx` | Vite entry point — renders `<App />` into DOM |
| `global-config.ts` | App-wide configuration (auth method, API URLs) |
| `global.css` | Global CSS styles |
| `vite-env.d.ts` | Vite environment type declarations |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `pages/` | Page components — thin wrappers that import from `sections/` |
| `routes/` | React Router config — path constants, route sections, hooks |
| `sections/` | Feature UI — each feature has its own subdirectory (same as next-ts) |
| `components/` | Shared reusable components (same as next-ts) |
| `auth/` | Authentication system (same as next-ts) |
| `layouts/` | Page layout shells (same as next-ts) |
| `theme/` | MUI theme customization (same as next-ts) |
| `assets/` | Static data, icons, illustrations |
| `locales/` | i18n translations |
| `lib/` | Third-party library wrappers |
| `utils/` | Pure utility functions |
| `types/` | Shared TypeScript types |
| `_mock/` | Mock data for development |
| `actions/` | API action functions (client-side, not server actions) |

## For AI Agents

### Architecture Overview
```
pages/        → Thin page components (import from sections/)
routes/       → React Router route definitions and path constants
sections/     → Feature UI (fat: actual page content)
components/   → Shared UI building blocks
layouts/      → Page shells wrapping routes
auth/         → Auth providers, guards, views
theme/        → MUI theme config
```

### Key Differences from next-ts
| Concern | next-ts | vite-ts |
|---------|---------|---------|
| Routing | `src/app/` (filesystem) | `src/pages/` + `src/routes/sections/` |
| Entry | `src/app/layout.tsx` | `src/main.tsx` + `src/app.tsx` |
| Server features | Server Components, Server Actions | None — fully client-side |
| Route config | Implicit (directory structure) | Explicit (React Router `createBrowserRouter`) |

### Working In This Directory
- **Adding a new page**: Create page in `pages/`, add route in `routes/sections/`, create section in `sections/`.
- **Components, auth, theme, layouts**: Same patterns as `next-ts/src` — refer to that AGENTS.md.
- `src/routes/sections/` contains route configuration split by feature area (dashboard, auth, main, components).

### Import Conventions
- Use `src/` path alias for all imports.
- Entry flow: `main.tsx` → `app.tsx` → Router → Layout → Page → Section.

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
