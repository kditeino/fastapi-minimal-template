<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-09 | Updated: 2026-04-09 -->

# layouts

## Purpose
Page layout shells — identical structure to `next-ts/src/layouts/`. Refer to that AGENTS.md for full documentation.

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `dashboard/` | Main app layout with sidebar + header |
| `auth-centered/` | Centered auth form layout |
| `auth-split/` | Split illustration + auth form layout |
| `main/` | Marketing/public layout |
| `simple/` | Minimal header-only layout |
| `core/` | Core layout utilities |
| `components/` | Shared layout components |

## For AI Agents

### Working In This Directory
- Same layout components as `next-ts`.
- Layouts use React Router `<Outlet />` instead of Next.js `{children}`.
- Layouts are assigned to routes in `src/routes/sections/`.

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
