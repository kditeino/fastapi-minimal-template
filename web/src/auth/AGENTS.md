<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-09 | Updated: 2026-04-09 -->

# auth

## Purpose
Pluggable authentication system — identical to `next-ts/src/auth/`. Supports JWT, Auth0, Firebase, Supabase, and Amplify. Refer to `../../next-ts/src/auth/AGENTS.md` for full documentation.

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `context/` | Auth context providers per provider |
| `guard/` | Route guards (AuthGuard, GuestGuard, RoleBasedGuard) |
| `hooks/` | `useAuthContext()` hook |
| `components/` | Shared auth UI components |
| `view/` | Auth page views (sign-in, sign-up, etc.) |
| `utils/` | Auth utility functions |

## For AI Agents

### Working In This Directory
- Same architecture as `next-ts/src/auth/` — unified interface across providers.
- Active provider set in `src/global-config.ts`.
- Auth provider wraps app in `src/app.tsx` (not `layout.tsx` like next-ts).

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
