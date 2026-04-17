<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-09 | Updated: 2026-04-09 -->

# routes

## Purpose
React Router configuration — route definitions, path constants, and navigation hooks. This is the vite-ts equivalent of Next.js filesystem routing.

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `sections/` | Route configuration split by area — dashboard, auth, main, components |
| `hooks/` | Navigation hooks — `useRouter()`, `usePathname()`, `useSearchParams()` |
| `components/` | Route-related components (e.g., `RouterLink`) |

## For AI Agents

### Working In This Directory
- `sections/` defines all routes using React Router's `createBrowserRouter`.
- Route sections are lazy-loaded with `React.lazy()` and `Suspense`.
- Path constants are exported for use across the app — always use these instead of hardcoded strings.
- `hooks/` provides Next.js-like navigation hooks (`useRouter`, `usePathname`) for consistency with the `next-ts` variant.

### Adding a New Route
1. Add path constant to the paths file.
2. Create route entry in the appropriate `sections/` file.
3. Create page component in `src/pages/`.
4. Create section view in `src/sections/`.

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
