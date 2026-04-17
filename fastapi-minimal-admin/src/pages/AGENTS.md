<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-09 | Updated: 2026-04-09 -->

# pages

## Purpose
Page components for React Router routes. The vite-ts equivalent of `next-ts/src/app/`. Each page is a thin wrapper that imports a view from `src/sections/`.

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `dashboard/` | All dashboard route pages |
| `auth/` | Real auth pages (jwt, auth0, firebase, supabase, amplify) |
| `auth-demo/` | Demo auth pages (centered, split layouts) |
| `components/` | Component gallery pages |
| `product/` | Public product pages |
| `post/` | Public blog pages |
| `about-us/` | About page |
| `contact-us/` | Contact page |
| `faqs/` | FAQ page |
| `pricing/` | Pricing page |
| `payment/` | Payment page |
| `error/` | Error pages |
| `coming-soon/` | Coming soon page |
| `maintenance/` | Maintenance page |
| `blank/` | Empty page template |

## For AI Agents

### Working In This Directory
- **Pages are thin**: import a `*View` from `src/sections/` and render it.
- Routes are defined in `src/routes/sections/` — pages are just the components rendered at those routes.
- Unlike next-ts, there are no `layout.tsx` files — layouts are assigned in route config.
- Dynamic params come from React Router's `useParams()`.

### Adding a New Page
1. Create page component in the appropriate subdirectory.
2. Add route entry in `src/routes/sections/`.
3. Add path constant in `src/routes/paths.ts`.

<!-- MANUAL: Any manually added notes below this line are preserved on regeneration -->
