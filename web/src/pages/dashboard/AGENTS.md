<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-09 | Updated: 2026-04-09 -->

# pages/dashboard

## Purpose
Dashboard page components for React Router. The vite-ts equivalent of `next-ts/src/app/dashboard/` — same 22+ feature modules.

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `analytics/` | Analytics overview |
| `banking/` | Banking overview |
| `booking/` | Booking overview |
| `course/` | Course overview |
| `ecommerce/` | E-commerce overview |
| `file/` | File manager overview |
| `invoice/` | Invoice CRUD pages |
| `product/` | Product CRUD pages |
| `order/` | Order pages |
| `user/` | User management pages |
| `job/` | Job listing pages |
| `tour/` | Tour pages |
| `post/` | Blog post pages |
| `chat/` | Chat page |
| `mail/` | Mail page |
| `calendar/` | Calendar page |
| `kanban/` | Kanban page |
| `file-manager/` | File browser page |
| `permission/` | Permission demo page |
| `blank/` | Empty page template |
| `params/` | Route params demo |
| `subpaths/` | Nested routing demo |

## For AI Agents

### Working In This Directory
- Same feature coverage as `next-ts/src/app/dashboard/`.
- Pages are thin: import `*View` from `src/sections/` and render.
- Routes are defined in `src/routes/sections/dashboard.tsx` (not filesystem-based).
- Dashboard layout is assigned in the route config, not per-page.

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
