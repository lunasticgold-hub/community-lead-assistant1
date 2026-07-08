# Community Lead Assistant Deployment Guide

## Current Project

- Framework: Next.js 16 App Router
- App directory: `apps/web`
- Package manager: npm workspaces
- Database/Auth: Supabase
- Hosting target: Vercel
- GitHub remote: `https://github.com/lunasticgold-hub/community-lead-assistant1.git`
- Production domain: replace with your custom domain when ready

## Verified Commands

Run these before every production deploy:

```bash
npm install
npm run lint
npm run build
npm test
npm run check:extension
```

## Vercel Project Settings

Recommended settings:

- Framework Preset: Next.js
- Root Directory: repository root
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: leave empty / framework default
- Node.js Version: 20.x or newer

`vercel.json` pins the install and build commands for this monorepo.

## Environment Variables

Add these in Vercel for Production and Preview. Local development uses `apps/web/.env.local`.

### Public

```bash
NEXT_PUBLIC_APP_URL=https://your-production-domain.com
NEXT_PUBLIC_SITE_DOMAIN=your-production-domain.com
NEXT_PUBLIC_SUPPORT_EMAIL=support@your-production-domain.com
NEXT_PUBLIC_EXTENSION_ID=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### Server Only

```bash
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_EMAILS=lunasticgold@gmail.com
EXTENSION_SHARED_SECRET=
AI_PROVIDER=gemini
GEMINI_API_KEY=
AI_DEFAULT_MODEL=gemini-2.5-flash
AI_DRAFTS_ENABLED=true
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_STARTER_PRICE_ID=
STRIPE_PRO_PRICE_ID=
STRIPE_AGENCY_PRICE_ID=
TRIAL_DAYS=7
TRIAL_LEAD_LIMIT=50
TRIAL_AI_DRAFT_LIMIT=50
DATA_RETENTION_DAYS=90
MAX_KNOWLEDGE_FILE_MB=10
ALLOWED_KNOWLEDGE_FILE_TYPES=pdf,docx,txt
```

Never place `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, or `EXTENSION_SHARED_SECRET` in client-side code.

## Supabase Setup

Execute SQL migrations in order from:

`supabase/migrations`

For the latest admin/CMS production tables, execute:

`supabase/migrations/0016_admin_cms_feature_completion.sql`

Verify after migration:

- Tables exist.
- RLS is enabled.
- Server-side app APIs can read/write through the service role key.
- Storage bucket `knowledge-documents` exists for knowledge uploads.
- Google OAuth is enabled in Supabase Auth if Google login is required.
- Production callback URL is added in Supabase Auth settings:
  - `https://your-production-domain.com/auth/callback`
  - Vercel preview callback URL if preview OAuth testing is needed.

## GitHub Deployment

The repository already has this origin:

```bash
git remote -v
```

Push with:

```bash
git push origin main
```

If Git asks you to authenticate, sign in with GitHub in your terminal or Git Credential Manager and rerun the push.

## Vercel Deployment

Because the Vercel CLI is not installed locally, use the Vercel dashboard:

1. Open Vercel.
2. Click Add New Project.
3. Import `lunasticgold-hub/community-lead-assistant1`.
4. Confirm Framework Preset is Next.js.
5. Confirm build settings from this guide.
6. Add all environment variables.
7. Deploy.

Official Vercel docs note that Vercel auto-detects framework build settings, and for Next.js uses the `build` script when present. See:

- https://vercel.com/docs/builds/configure-a-build
- https://vercel.com/docs/frameworks/full-stack/nextjs

## Custom Domain

In Vercel:

1. Open Project Settings.
2. Open Domains.
3. Add your apex domain, for example `example.com`.
4. Add `www.example.com`.
5. Copy the exact DNS records shown by Vercel.

Typical DNS pattern:

| Host | Type | Value |
| --- | --- | --- |
| `@` | `A` | `76.76.21.21` |
| `www` | `CNAME` | copy the exact Vercel CNAME shown in the dashboard |

Do not add a CNAME at the apex unless your DNS provider supports ALIAS/ANAME flattening. Vercel's docs state apex domains use A records and subdomains use CNAME records.

After DNS propagation, Vercel will provision SSL automatically. DNS can take 24-48 hours to fully propagate.

Official references:

- https://vercel.com/docs/domains/working-with-domains/add-a-domain
- https://vercel.com/docs/domains/working-with-dns

## Production Verification

After deployment, verify:

- Homepage loads.
- `/login` and `/signup` work.
- Google OAuth redirects back to `/auth/callback`.
- `/dashboard` is protected.
- `/admin` is protected.
- `/cms/login` works for employee IAM.
- `/admin/cms/website-editor` loads.
- `/blog` loads.
- `/api/dashboard/stats` returns authenticated data.
- `/api/extension/bootstrap` works from the Chrome extension.
- `/sitemap.xml` and `/robots.txt` load.
- 404 page renders for unknown routes.
- Extension ZIP downloads from `/downloads/CommunityLeadAssistant.zip`.

## Rollback Procedure

1. In Vercel, open Deployments.
2. Select the last healthy deployment.
3. Click Promote to Production.
4. If database migration caused the issue, restore from Supabase backup or run a reviewed rollback SQL script.

## Future Deployments

1. Make code changes.
2. Run the verified commands.
3. Commit changes.
4. Push to GitHub.
5. Vercel deploys automatically from GitHub.
6. Apply any new Supabase migrations before enabling affected features.
