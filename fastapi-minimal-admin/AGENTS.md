<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-09 | Updated: 2026-04-09 -->

# vite-ts

## Purpose
Full-featured Vite 6 + React Router implementation of the Minimal UI Kit. Feature-equivalent to `next-ts` but uses client-side routing instead of Next.js App Router.

## Key Files
| File | Description |
|------|-------------|
| `package.json` | Dependencies and scripts |
| `vite.config.ts` | Vite build configuration |
| `index.html` | SPA entry point |
| `tsconfig.json` | TypeScript config |
| `tsconfig.node.json` | TypeScript config for Node/Vite tooling |
| `vercel.json` | Vercel deployment rewrite rules |
| `eslint.config.mjs` | ESLint flat config |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `src/` | All application source code (see `src/AGENTS.md`) |
| `public/` | Static assets — images, icons, fonts, logos |
| `.vscode/` | IDE settings |

## For AI Agents

### Working In This Directory
- Run `yarn dev` to start (default Vite port 5173).
- This is a **SPA** — all routing is client-side via React Router.
- Routes defined in `src/routes/sections/` (not filesystem-based like Next.js).
- Pages live in `src/pages/` — thin wrappers that import from `src/sections/`.
- Imports use path alias: `src/` configured in `vite.config.ts`.

### Key Difference from next-ts
- No server components, no server actions — everything is client-side.
- `src/pages/` replaces `src/app/` for route page definitions.
- `src/routes/sections/` contains React Router route config.

### Scripts
| Command | Action |
|---------|--------|
| `yarn dev` | Dev server (Vite) |
| `yarn build` | `tsc && vite build` |
| `yarn lint:fix` | Auto-fix lint issues |
| `yarn fm:fix` | Auto-fix formatting |

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
