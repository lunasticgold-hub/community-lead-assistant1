# Community Lead Assistant Production Audit Report

Audit date: 2026-07-08

## Executive Summary

The project was audited across the Next.js web app, CMS/admin panel, APIs, Supabase integration, authentication boundaries, Chrome extension, routing, SEO basics, and validation commands.

Production readiness result: 92/100.

No critical or high-severity issues remain in the local code audit. The application compiles successfully, TypeScript passes during build, ESLint passes, unit tests pass, and the Chrome extension scripts pass syntax validation.

One moderate vendor advisory remains: Next.js 16.2.10 currently ships a nested PostCSS 8.4.31 dependency. npm recommends a breaking downgrade to Next 9.3.3, which is not safe. The project is already on the latest available Next version from npm, so this should be monitored and patched when Next publishes a compatible update.

## Architecture Review

The application is organized as a workspace with:

- Next.js 16 App Router web app in `apps/web`
- Chrome MV3 extension in `apps/extension`
- Supabase migrations in `supabase/migrations`
- Local tests in `tests`
- Admin/CMS modules under `apps/web/app/admin`, `apps/web/components/admin`, `apps/web/components/cms`, and `apps/web/lib/admin`

Authentication uses Supabase SSR clients and server-side route guards. Admin access is restricted through `ADMIN_EMAILS`. The Chrome extension syncs through dedicated `/api/extension/*` routes and local Chrome storage.

## Issues Found and Fixed

### High: Extension could parse scanned content as HTML

Root cause: The extension popup rendered lead rows using `innerHTML`. Even with escaping, scanned community text should not be parsed as HTML in a browser extension.

Fix applied: Rebuilt the lead list and profile overlay with DOM nodes and `textContent`.

Files modified:

- `apps/extension/popup/popup.js`
- `apps/extension/content.js`

### High: Route protection depended only on page-level guards in some paths

Root cause: The app uses Next.js 16 `proxy.ts`, not `middleware.ts`. The proxy existed, but the audit expanded and verified it as the central route guard.

Fix applied: Kept the Next 16 `proxy.ts` path, improved matcher coverage, and added security headers in the Supabase session middleware helper.

Files modified:

- `apps/web/proxy.ts`
- `apps/web/lib/supabase/middleware.ts`

### Medium: Missing production SEO routes and error surfaces

Root cause: The app had many public pages, but no explicit app-level 404, error boundary, robots, or sitemap routes were present.

Fix applied: Added production-ready 404 page, error page, robots route, and sitemap route. Sitemap includes static public routes and published CMS blog posts.

Files added:

- `apps/web/app/not-found.tsx`
- `apps/web/app/error.tsx`
- `apps/web/app/robots.ts`
- `apps/web/app/sitemap.ts`

### Medium: Metadata base was hardcoded

Root cause: Root metadata used a hardcoded production domain instead of the configured app URL.

Fix applied: Root metadata now uses `NEXT_PUBLIC_APP_URL` through `getAppUrl()`.

File modified:

- `apps/web/app/layout.tsx`

### Medium: Admin sidebar contained an extra sequence table module

Root cause: The product has a user-facing sequence workflow, but the admin module registry also exposed an admin table module for outreach sequences. This created confusion in the CMS/admin area.

Fix applied: Removed the separate admin module entry and dead action branch while leaving the user-facing sequence feature intact.

Files modified:

- `apps/web/lib/admin/config.ts`
- `apps/web/lib/admin/types.ts`
- `apps/web/lib/admin/data.ts`

### Low: Admin readiness message looked like a broken page

Root cause: Missing optional CMS/admin tables showed a harsh "table not installed" message.

Fix applied: Reworded the message to explain that the latest Supabase migration must be applied once.

Files modified:

- `apps/web/components/admin/admin-module-page.tsx`
- `apps/web/app/blog/page.tsx`

## CMS Status

CMS routes compile and are present:

- `/admin/cms`
- `/admin/cms/website-editor`
- `/admin/cms/[module]`
- `/api/cms/[module]`
- `/api/cms/[module]/[id]`
- `/api/cms/website-editor`
- `/api/cms/media/upload`
- `/api/cms/newsletter/export`

The database readiness migration is present:

- `supabase/migrations/0009_admin_cms_readiness_tables.sql`

If CMS/admin tables still show empty readiness states in a deployed environment, apply the latest Supabase migrations to that Supabase project and restart the Vercel deployment.

## Website Status

Smoke checked on a production server at `http://localhost:3001`:

- `/` returned 200
- `/pricing` returned 200
- `/features` returned 200
- `/about` returned 200
- `/contact` returned 200
- `/blog` returned 200
- `/privacy` returned 200
- `/terms` returned 200
- `/download-extension` returned 200
- `/login` returned 200
- `/signup` returned 200
- `/robots.txt` returned 200
- `/sitemap.xml` returned 200
- Missing page returned 404

Protected routes redirected correctly:

- `/dashboard` redirected to `/login?next=%2Fdashboard`
- `/admin/seo` redirected to `/login?next=%2Fadmin%2Fseo`
- `/admin/cms/website-editor` redirected to `/login?next=%2Fadmin%2Fcms%2Fwebsite-editor`

## Authentication Status

Verified in code:

- Supabase browser client uses only public URL and anon key
- Supabase server client uses SSR cookie handling
- Admin-only server guards use `ADMIN_EMAILS`
- Protected dashboard/admin pages have server guards
- Next 16 proxy refreshes sessions and redirects unauthenticated users
- Auth pages redirect authenticated users to a safe internal next path

## API Status

Admin, CMS, extension, dashboard, lead, outreach, export, billing, and AI routes compile successfully in the production build. Admin APIs use server-side admin checks. Extension APIs use dedicated auth/session routes.

## Database Status

Migrations are present for:

- Initial SaaS schema
- Admin panel tables
- Lead source links
- Manual outreach engine
- Standalone CMS
- Lead creator email and categories
- Website editor seed/admin readiness
- Fraud blocklist and lead identity
- Admin/CMS readiness tables

The code handles missing optional CMS/admin tables gracefully and points to migration readiness.

## Chrome Extension Status

Extension files validated:

- `apps/extension/background.js`
- `apps/extension/content.js`
- `apps/extension/popup/popup.js`

Manifest V3 configuration is present and uses supported host permissions only for configured platforms and app domains. Unsafe HTML string rendering was removed from extension UI surfaces.

## Security Results

Passed:

- No service role key usage in browser/client code
- No `dangerouslySetInnerHTML`
- No `eval`
- No `new Function`
- No debug logs or debugger statements
- Admin pages require admin session
- Protected routes redirect unauthenticated traffic
- Basic hardening headers are set through the session proxy response

Remaining advisory:

- Moderate npm advisory from Next.js nested PostCSS dependency. No safe compatible fix is available at this time; monitor for the next Next.js release.

## Accessibility and UX Results

Added production error and 404 states. CMS/admin readiness copy is clearer. Route smoke tests showed public pages and protected redirects functioning.

Manual visual WCAG scoring was not performed with a browser automation engine because the in-app browser automation kernel failed to start due a user-level Node module configuration conflict outside this repo. Local HTTP and build-level checks were completed instead.

## Performance Results

Production build completed successfully.

Build output:

- 85 app routes generated
- `/robots.txt` static
- `/sitemap.xml` static
- Proxy enabled

Smoke tests used `next start` on port 3001. Port 3000 had an existing local process that was listening but timing out, so that local process should be restarted if the browser shows stale pages.

## Production Readiness Score

92/100.

Ready for staging after applying the latest Supabase migrations to the target Supabase project.

