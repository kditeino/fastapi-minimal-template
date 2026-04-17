# fastapi-minimal-template

## Project Overview
A full-stack admin dashboard template combining:
- **Frontend**: Minimal UI Kit (React 18 + TypeScript 5 + MUI v7 + Vite 6)
- **Backend**: FastAPI Best Architecture (FBA)
- **Database**: PostgreSQL (default) / MySQL + Redis

Use this repo as a starting point for new admin projects — it has JWT auth,
RBAC, dynamic menus, and a dozen pre-wired admin modules out of the box
(user / role / dept / menu / data-rule / data-scope / log / monitor / task / plugin / file / session).

## Layout

| Path | Purpose |
|------|---------|
| `fastapi-minimal-admin/` | React/Vite frontend (the admin UI) |
| `fastapi-backend/` | FastAPI backend (FBA) |
| `fba-seed/` | Custom SQL seed aligning the backend menu with the frontend routes |

## Dev workflow

### Frontend
```bash
cd fastapi-minimal-admin
corepack yarn install    # first time only
corepack yarn dev        # http://localhost:8080
corepack yarn build      # full type-check + bundle (no test suite)
corepack yarn lint       # eslint
```

### Backend
```bash
cd fastapi-backend
uv sync                                                    # first time only
cp backend/.env.example backend/.env                       # then edit DB/Redis/token
export PYTHONPATH=$(pwd)
.venv/bin/fba init                                         # creates tables + seeds default admin (y to confirm)
psql -h <host> -U <user> -d <db> -f ../fba-seed/minimal_menus.sql
.venv/bin/fba run --port 8001                              # http://127.0.0.1:8001
```

Default admin: `admin` / `123456` — change on first login.

MySQL users: replace the `psql` line with
`mysql -h <host> -u <user> -p <db> < ../fba-seed/minimal_menus.sql`
and set `DATABASE_TYPE=mysql` in `.env`.

## Key frontend conventions
- **Imports**: Always use the `src/` path alias — never relative imports above `src/`.
- **Components**: Each in its own directory with an `index.ts` barrel export.
- **Sections**: Export `*View` components (e.g. `UserListView`).
- **Auth**: FBA JWT provider in `src/auth/context/fba/`. Guards in `src/auth/guard/`.
- **Permission-gated actions**: Wrap destructive buttons with `<PermissionGuard permission="...">` — the perm code must exist as a BUTTON row under the matching MENU in `fba-seed/minimal_menus.sql`.
- **Dynamic menus**: `src/layouts/dashboard/nav-config-from-api.tsx` converts the FBA `/sys/menus/sidebar` (Vben5 shape) into nav sections. Title i18n keys resolve from `src/locales/langs/{cn,en}/common.json`.
- **No test suite**: Validate with `yarn build` and `yarn lint`.
- **Runtime**: Node >= 22.12.0, Yarn 1.22.22 (via corepack).

## Tech stack
React 18 · TypeScript 5 · MUI v7 · Emotion · Vite 6 · React Hook Form + Zod · dayjs · ApexCharts · Iconify
FastAPI · SQLAlchemy 2 · asyncpg / asyncmy · Pydantic v2 · granian · Celery · Redis

## Adding a new module (suggested flow)

1. **Backend**: add model → schema → CRUD → service → API under `backend/app/admin/` (or a new app package). Register the router in `backend/app/router.py`.
2. **Frontend**: add API client in `src/api/`, types in `src/types/`, page component in `src/pages/dashboard/<module>/`, section in `src/sections/<module>/`. Register the route in `src/routes/sections/dashboard.tsx`.
3. **Menu + permissions**: append MENU + BUTTON rows to `fba-seed/minimal_menus.sql` (see `fba-seed/README.md`), re-apply the seed, and reference the button perm code via `<PermissionGuard>` on the frontend.
4. **i18n**: add title keys to `src/locales/langs/{cn,en}/common.json`.

## Notes
- `fba-seed/README.md` documents the menu seeding process — read it before adding new pages.
- Celery schedules live in `backend/app/task/tasks/beat.py`; the template ships with log-cleanup and demo tasks only.
