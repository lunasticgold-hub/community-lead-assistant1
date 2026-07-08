create table if not exists cms_settings (
  id uuid primary key default gen_random_uuid(),
  group_name text not null,
  key text not null,
  value jsonb not null default '{}',
  updated_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(group_name, key)
);

alter table cms_settings enable row level security;

insert into cms_settings (group_name, key, value)
values (
  'website_editor',
  'live_site',
  '{
    "branding": {
      "companyName": "Community Lead Assistant",
      "shortName": "Community Lead",
      "tagline": "Find high-intent leads inside communities.",
      "slogan": "Lead intelligence, not spam automation.",
      "logoUrl": "",
      "faviconUrl": "",
      "primaryColor": "#2563eb",
      "secondaryColor": "#020617",
      "accentColor": "#10b981",
      "headingFont": "Inter",
      "bodyFont": "Inter",
      "brandGuidelines": "Premium blue/black SaaS style with clean spacing, high contrast, and manual-outreach safety language."
    },
    "navigation": {
      "headerMenu": [
        { "label": "Features", "href": "/features", "visible": true },
        { "label": "Solutions", "href": "/solutions", "visible": true },
        { "label": "Pricing", "href": "/pricing", "visible": true },
        { "label": "Resources", "href": "/resources", "visible": true },
        { "label": "Blog", "href": "/blog", "visible": true },
        { "label": "Documentation", "href": "/docs", "visible": true },
        { "label": "Extension", "href": "/extension", "visible": true },
        { "label": "Customers", "href": "/customers", "visible": true }
      ],
      "footerMenu": [
        { "label": "Privacy Policy", "href": "/privacy", "visible": true },
        { "label": "Terms", "href": "/terms", "visible": true },
        { "label": "Cookie Policy", "href": "/cookie-policy", "visible": true },
        { "label": "Security", "href": "/security", "visible": true }
      ],
      "ctaLabel": "Start Free Trial",
      "ctaHref": "/signup",
      "stickyHeader": true,
      "megaMenuEnabled": false,
      "mobileMenuEnabled": true,
      "breadcrumbsEnabled": false
    },
    "hero": {
      "headline": "Find high-intent leads inside communities.",
      "subheadline": "Lead intelligence, not spam automation",
      "description": "Community Lead Assistant helps freelancers, agencies, founders, and growth teams scan visible community posts, score buyer intent, generate reviewed outreach drafts, and manage follow-ups from one polished dashboard.",
      "primaryCtaLabel": "Start 7-day trial",
      "primaryCtaHref": "/signup",
      "secondaryCtaLabel": "Download extension",
      "secondaryCtaHref": "/download-extension",
      "trustBadges": ["Manual outreach only", "Visible content scanning", "Workspace sync"],
      "clientLogos": ["Freelancers", "Small agencies", "Founder-led teams", "Growth consultants", "SDR teams"],
      "ratingText": "Built for safe community lead discovery"
    },
    "footer": {
      "copyright": "Community Lead Assistant. All rights reserved.",
      "newsletterText": "Product updates, release notes, and safe community-growth guides.",
      "legalLinks": [
        { "label": "Privacy Policy", "href": "/privacy", "visible": true },
        { "label": "Terms", "href": "/terms", "visible": true },
        { "label": "Cookie Policy", "href": "/cookie-policy", "visible": true },
        { "label": "Security", "href": "/security", "visible": true }
      ]
    },
    "contact": {
      "email": "support@communityleadassistant.com",
      "workingHours": "Monday-Friday"
    },
    "seo": {
      "metaTitle": "Community Lead Assistant",
      "metaDescription": "Find high-intent leads inside communities and draft manual outreach safely.",
      "keywords": ["community leads", "lead generation", "manual outreach", "Chrome extension"],
      "robots": "index,follow",
      "sitemapEnabled": true
    }
  }'::jsonb
)
on conflict (group_name, key) do nothing;

create index if not exists cms_settings_group_key_idx on cms_settings(group_name, key);
