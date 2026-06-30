# Community Lead Assistant

Community Lead Assistant is a safe SaaS + Chrome Extension MV3 product for freelancers, agencies, founders, and growth teams.

Positioning: find high-intent leads inside communities, qualify them, generate personalized manual outreach drafts, and manage follow-ups from one dashboard.

Placeholder domain/legal name: `communityleadassistant.com`  
Support email: `support@communityleadassistant.com`

This is not a spam tool. It does not auto-send DMs, comments, replies, posts, or follow-ups.

## Product Decisions

- Brand: premium blue/black SaaS.
- Trial: 7 days.
- Trial lead limit: 50 saved lead credits.
- Trial AI limit: 50 Gemini draft credits.
- No free plan after trial.
- AI provider: Google Gemini using the SaaS-owned key.
- Supabase region: US East.
- Data retention: 90 days by default.
- Knowledge base: structured form plus PDF, DOCX, TXT uploads up to 10 MB per file.
- Billing: Stripe-ready stubs, not active until keys and price IDs are added.

## Folder Structure

```text
apps/
  web/                       Next.js + TypeScript SaaS app
    app/                     Public pages, app pages, API routes
    components/              UI and brand components
    lib/                     Scoring, dedupe, drafts, CSV, Supabase helpers
  extension/                 Chrome Extension MV3
    adapters/                Platform adapters
    popup/                   Compact popup UI
    background.js            Service worker, sync queue, CSV, outreach actions
    content.js               Visible scanning, scoring, highlighting
    manifest.json
supabase/
  migrations/0001_initial_schema.sql
  seed.sql
tests/scoring-dedupe.test.mjs
.env.example
package.json
```

## Included

- Public pages: landing, pricing, login, signup, privacy, terms, docs, download extension.
- App pages: dashboard, leads, lead detail, campaigns, knowledge base, keywords, templates, follow-ups, platforms, team, analytics, exports, billing, extension instructions.
- Admin pages: users, workspaces, errors.
- Supabase schema for users, workspaces, members, extension tokens, campaigns, knowledge bases, knowledge documents, keyword groups, templates, leads, events, usage, errors, and billing fields.
- Extension token login using a bearer token flow.
- Extension bootstrap API for workspace/campaign/settings sync.
- Extension lead sync, event sync, error sync, and offline queue behavior.
- CSV export from dashboard and extension.
- Platform adapters for Reddit, Indie Hackers, Facebook Groups, Slack Web, Discord Web, Telegram Web, and WhatsApp Web.
- Basic tests for scoring and duplicate detection.

## Safety Rules

- No automatic DM sending.
- No automatic comments, replies, posts, or follow-up blasting.
- No anti-detection, rate-limit evasion, fake human behavior, stealth, or shadowban bypass.
- The extension scans visible page content only after the user starts a scan.
- Outreach actions copy a draft or open a source/profile/manual draft URL for human review.
- Scan Only Mode hides outreach actions.

## Environment Variables

Copy `.env.example` to `apps/web/.env.local`.

Do not paste secrets into chat. Add real values locally and in Vercel later.

Important keys:

```text
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SITE_DOMAIN=communityleadassistant.com
NEXT_PUBLIC_SUPPORT_EMAIL=support@communityleadassistant.com
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_REGION=us-east-1
SUPABASE_AUTH_GOOGLE_CLIENT_ID=
SUPABASE_AUTH_GOOGLE_CLIENT_SECRET=
AI_PROVIDER=gemini
GEMINI_API_KEY=
AI_DEFAULT_MODEL=gemini-2.5-flash
EXTENSION_SHARED_SECRET=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_STARTER_PRICE_ID=
STRIPE_PRO_PRICE_ID=
STRIPE_AGENCY_PRICE_ID=
TRIAL_DAYS=7
TRIAL_LEAD_LIMIT=50
TRIAL_AI_DRAFT_LIMIT=50
MAX_KNOWLEDGE_FILE_MB=10
DATA_RETENTION_DAYS=90
```

Without Supabase env vars, the web app runs with demo data.

## Supabase Setup

1. Create a Supabase project in US East.
2. Run `supabase/migrations/0001_initial_schema.sql` in the SQL editor.
3. Run `supabase/seed.sql`.
4. Create a Storage bucket named `knowledge-documents`.
5. Enable email/password auth.
6. Enable Google auth in Supabase Auth Providers after you create Google OAuth credentials.
7. Set Google redirect URLs in Google Cloud and Supabase based on your final domain.

## Gemini Setup

1. Create a Gemini API key in Google AI Studio.
2. Add it to `GEMINI_API_KEY` in `apps/web/.env.local`.
3. Add the same key to Vercel environment variables for production.

Trial users receive 50 Gemini draft credits.

## Stripe Setup Later

Stripe is intentionally stubbed for now.

When ready, add:

```text
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_STARTER_PRICE_ID
STRIPE_PRO_PRICE_ID
STRIPE_AGENCY_PRICE_ID
```

Prepared routes:

```text
POST /api/billing/checkout
POST /api/billing/webhook
```

## Running Web App Locally

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

## Loading Chrome Extension Locally

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Click Load unpacked.
4. Select `apps/extension`.

## Extension Token

For MVP local testing:

```text
demo-token
```

For production, generate a random token in the dashboard, store only the SHA-256 hash in `extension_tokens.token_hash`, and show the raw token once.

## Testing On Reddit

1. Open `https://www.reddit.com/r/SaaS/`.
2. Open the extension popup.
3. Use Scan Visible first.
4. Use Start Scan for ongoing visible scanning.
5. Use Scan Only Mode when you only want to save leads.

Matched leads are highlighted:

- Green: Hot
- Orange: matched
- Grey: checked/no match
- Purple: promoted/skipped

## Validation

```bash
npm run test
npm run check:extension
npm --workspace apps/web run build
```
