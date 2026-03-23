# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Backend (`ecommerce-server/`)
```bash
pnpm run start:dev        # Dev server (port 3001)
pnpm run build            # Production build
pnpm run lint             # ESLint
pnpm test                 # Run all unit tests
pnpm test:watch           # Watch mode
pnpm test:cov             # Coverage report
# Run a single test file:
pnpm test -- src/modules/auth/auth.service.spec.ts
```

### Frontend (`ecommerce-web/`)
```bash
pnpm run dev              # Dev server (port 3000, Turbopack)
pnpm run build            # Production build
pnpm run lint             # ESLint
```

### Database (run from `ecommerce-server/`)
```bash
npx prisma migrate dev --name <migration_name>   # Create + apply migration
npx prisma migrate deploy                         # Apply pending migrations (prod)
npx prisma db seed                               # Seed with admin user + sample data
npx prisma generate                              # Regenerate Prisma Client
npx prisma studio                               # GUI browser for DB
```

## Architecture

### Multi-tenant SaaS model
The app is multi-tenant. Every resource (products, orders, customers, coupons, categories, branches) is scoped to a `Tenant`. JWT tokens carry `tenantId` and `tenantRole`. On the backend, `TenantContextService` (`src/common/context/tenant-context.service.ts`) uses `AsyncLocalStorage` to propagate tenant context per-request — every service injects it and calls `requireTenantId()` to scope all DB queries. The JWT guard (`JwtAuthGuard`) sets this context automatically.

### Backend (NestJS + Prisma)
- `src/modules/` — one folder per resource (auth, users, tenants, branches, categories, products, customers, orders, coupons, roles, permissions, dashboard, email)
- `src/common/guards/` — `JwtAuthGuard`, `RolesGuard`, `PermissionsGuard`, `RequirePlanGuard`
- `src/common/decorators/` — `@CurrentUser()`, `@Public()`, `@Roles()`, `@RequirePermissions()`
- `src/common/context/` — `TenantContextService` (tenant scoping), `AuditContextService`
- Prisma schema is at `prisma/schema.prisma`; all models have `tenantId` FK except global `User` and `TenantMembership`
- Default seed credentials: `admin@ecommerce.com` / `admin123`
- Swagger docs: `http://localhost:3001/api/docs`

### Frontend (Next.js 16 App Router)
- **All dashboard pages are `'use client'`** — there are no React Server Components in the dashboard
- Route groups: `app/(auth)/` for login, `app/(dashboard)/` for the admin panel, `app/pos/` for the POS terminal
- Auth state lives in Zustand: `lib/store/auth-store.ts` (`useAuthStore`) — token stored in `localStorage`
- Branch state: `lib/store/branch-store.ts` (`useBranchStore`)
- HTTP: `lib/api/client.ts` (axios instance with Bearer token interceptor + 401→redirect)
- API modules: `lib/api/{resource}.ts` each exporting `{resource}Api` object
- All types + DTOs: `lib/types/index.ts`
- UI: shadcn/ui components in `components/ui/`, layout in `components/layout/`
- Forms: react-hook-form + zod; schemas are `useMemo(() => z.object({...}), [t])` inside the component (because of i18n)

### i18n (next-intl, no URL routing)
- `LocaleProvider` wraps the root layout; locale is stored in `localStorage('app-locale')`
- Detection order: localStorage → `navigator.languages` → default `'es'`
- Messages: `messages/es.json` + `messages/en.json`
- Switcher: `components/ui/locale-switcher.tsx`
- i18n namespaces: `common`, `lang`, `nav`, `auth`, `dashboard`, `products`, `categories`, `orders`, `customers`, `coupons`, `users`

### Theming (dark mode)
- `ThemeProvider` (next-themes) applies `.dark` class to `<html>`; Tailwind 4 uses `@custom-variant dark (&:is(.dark *))`
- Dark mode uses Glassmorphism: `#020617` base + 3 mesh gradient orbs + glass cards (`dark:bg-[rgba(15,23,42,0.65)] dark:backdrop-blur-[20px]`)
- Glass utility classes are in `app/globals.css` (`@layer utilities`) and `lib/styles/glass.css`

### POS (`app/pos/`)
- Full-page POS terminal with its own sidebar (`components/ui/sidebar.tsx` via `SidebarProvider` + `POSSidebar`)
- Section components live in `app/pos/(components)/`; the active section is managed by state in `app/pos/page.tsx`
- POS sidebar background: `#FAFBFD` (light) / `#020617` (dark)

## Key conventions
- **UI text**: "Ventas" not "Órdenes" for orders in the UI
- **Currency**: MXN, `es-MX` locale for all date/currency formatting
- `PageHeader` accepts `{ title, description, action?: ReactNode }`
- New backend services must inject `TenantContextService` and scope every `prisma.*` query with `tenantId: tenantContext.requireTenantId()`
- New API client files follow the pattern: `export const {resource}Api = { getAll, getById, create, update, delete }` using `apiClient`
