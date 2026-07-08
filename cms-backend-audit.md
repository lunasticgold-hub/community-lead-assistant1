# CMS Backend Audit

Audit date: 2026-07-08

## Executive Summary

The CMS warning was caused by a schema mismatch between the CMS module configuration and the active database schema. The app expected production CMS tables and fields for blog, media, SEO, navigation, landing pages, announcements, newsletter, redirects, and related modules, but the migration set was split across older partial migrations. The CMS data layer also treated several schema-cache and missing-column errors as a generic table-missing state, which produced the user-facing setup banner.

## Root Cause

1. CMS modules referenced tables that were only partially covered by earlier migrations.
2. Several production modules were not registered in the CMS module list: authors, tags, media folders, forms, tracking, integrations, case studies, portfolio, team, roles, and permissions.
3. Generic schema errors were surfaced as a CMS setup warning instead of being fixed by a complete repair migration.
4. The generic CMS API supported basic list/create/update/delete, but not production actions such as import, duplicate, archive, restore, and bulk operations.

## Fixes Applied

- Added `supabase/migrations/0015_cms_production_schema_repair.sql`.
- Added missing CMS production tables.
- Added missing audit fields, soft-delete fields, indexes, unique constraints, and seed data.
- Expanded the CMS module registry to include missing production modules.
- Added JSON import, duplicate, archive, restore, and bulk endpoints.
- Replaced the setup warning banner with real empty states and action buttons.
- Strengthened CMS validation for required fields.
- Converted destructive delete behavior into archive/soft delete behavior.

## Affected Modules

Repaired or connected:

- Website Pages
- Homepage
- About
- Contact
- Pricing
- Features
- Solutions
- Resources
- Customers
- Careers
- Changelog
- Release Notes
- Blog
- Blog Categories
- Blog Tags
- Authors
- FAQ
- Testimonials
- SEO
- Media Library
- Media Folders
- Navigation
- Footer
- Announcements
- Newsletter
- Landing Pages
- Redirects
- Forms
- Form Submissions
- Tracking
- Integrations
- Case Studies
- Portfolio
- Team
- CMS Roles
- CMS Permissions
- Settings

## Files Modified

- `apps/web/lib/cms/types.ts`
- `apps/web/lib/cms/config.ts`
- `apps/web/lib/cms/data.ts`
- `apps/web/components/cms/cms-resource-page.tsx`
- `apps/web/components/cms/cms-dashboard.tsx`
- `apps/web/app/api/cms/[module]/route.ts`
- `apps/web/app/api/cms/[module]/[id]/route.ts`

## Files Created

- `apps/web/components/cms/cms-resource-actions.tsx`
- `apps/web/app/api/cms/[module]/bulk/route.ts`
- `apps/web/app/api/cms/[module]/[id]/[action]/route.ts`
- `supabase/migrations/0015_cms_production_schema_repair.sql`
- `cms-backend-audit.md`
- `database-schema.md`
- `migration-report.md`
- `cms-test-report.md`

## Security Notes

- CMS APIs still require existing admin authentication.
- CMS APIs still use existing RBAC checks.
- Service role access remains server-only through the existing Supabase admin client.
- File uploads remain restricted to allowed media/document types.

## Remaining Manual Step

Apply `supabase/migrations/0015_cms_production_schema_repair.sql` to the active Supabase database. The Supabase CLI is not installed in this workspace, and there is no local `.env.local`, so the migration could not be pushed automatically from this machine.
