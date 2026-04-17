<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-09 | Updated: 2026-04-09 -->

# auth/context

## Purpose
Authentication context providers — same as `next-ts/src/auth/context/`. Refer to that AGENTS.md for full documentation.

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `jwt/` | JWT token-based auth (default) |
| `auth0/` | Auth0 integration |
| `firebase/` | Firebase Auth |
| `supabase/` | Supabase Auth |
| `amplify/` | AWS Amplify Auth |

## For AI Agents

### Working In This Directory
- Same provider structure and interface as next-ts.
- Active provider selected in `src/global-config.ts`.
- Provider wraps app in `src/app.tsx` (not `layout.tsx`).

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
