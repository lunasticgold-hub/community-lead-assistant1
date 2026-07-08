# Changelog

## 2026-07-08 Production Audit Fixes

### Added

- Added app-level 404 page at `apps/web/app/not-found.tsx`.
- Added app-level error boundary at `apps/web/app/error.tsx`.
- Added `robots.txt` route at `apps/web/app/robots.ts`.
- Added `sitemap.xml` route at `apps/web/app/sitemap.ts`.
- Added audit documentation:
  - `audit-report.md`
  - `final-test-report.md`
  - `changelog.md`

### Changed

- Updated root metadata to use `NEXT_PUBLIC_APP_URL` via `getAppUrl()`.
- Improved Next.js 16 proxy matcher for production route handling.
- Added security headers to Supabase session proxy responses.
- Removed the standalone admin sidebar module for outreach sequences while preserving the user-facing sequence workflow.
- Removed dead admin action handling for the removed admin sequence module.
- Reworded CMS/admin database readiness messaging.
- Rebuilt extension popup lead rendering with safe DOM APIs instead of HTML strings.
- Rebuilt extension profile overlay rendering with safe DOM APIs instead of HTML strings.

### Verified

- `npm install`
- `npm run lint`
- `npm run build`
- `npm test`
- `npm run check:extension`
- Production smoke checks on port 3001 for public pages, protected redirects, 404, robots, and sitemap

### Known Vendor Advisory

- npm reports a moderate PostCSS advisory inside Next.js 16.2.10. The project is already on the latest Next release available from npm. npm's offered fix is a breaking downgrade to Next 9.3.3, so it was not applied.

