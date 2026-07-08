import {
  Activity,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  Cable,
  Chrome,
  Clock,
  Code2,
  FileQuestion,
  FileText,
  GraduationCap,
  LifeBuoy,
  Mail,
  Map,
  ShieldCheck,
  Sparkles,
  Users
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type MarketingPageSlug =
  | "features"
  | "solutions"
  | "resources"
  | "roadmap"
  | "changelog"
  | "integrations"
  | "api-docs"
  | "help-center"
  | "faqs"
  | "contact"
  | "about"
  | "careers"
  | "cookie-policy"
  | "security"
  | "status"
  | "release-notes"
  | "community"
  | "customers";

export type MarketingPage = {
  slug: MarketingPageSlug;
  title: string;
  eyebrow: string;
  description: string;
  icon: LucideIcon;
  sections: Array<{
    title: string;
    body: string;
    points: string[];
  }>;
  cta?: string;
};

export const marketingNav = [
  { label: "Features", href: "/features" },
  { label: "Solutions", href: "/solutions" },
  { label: "Pricing", href: "/pricing" },
  { label: "Resources", href: "/resources" },
  { label: "Blog", href: "/blog" },
  { label: "Documentation", href: "/docs" },
  { label: "Extension", href: "/download-extension" },
  { label: "Customers", href: "/customers" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" }
] as const;

export const footerGroups = [
  {
    title: "Product",
    links: [
      ["Features", "/features"],
      ["Pricing", "/pricing"],
      ["Extension", "/download-extension"],
      ["API", "/api-docs"],
      ["Integrations", "/integrations"],
      ["Release Notes", "/release-notes"]
    ]
  },
  {
    title: "Resources",
    links: [
      ["Blog", "/blog"],
      ["Documentation", "/docs"],
      ["Help Center", "/help-center"],
      ["FAQs", "/faqs"],
      ["Community", "/community"],
      ["Changelog", "/changelog"],
      ["Roadmap", "/roadmap"]
    ]
  },
  {
    title: "Company",
    links: [
      ["About", "/about"],
      ["Customers", "/customers"],
      ["Careers", "/careers"],
      ["Contact", "/contact"],
      ["Security", "/security"],
      ["Status Page", "/status"]
    ]
  },
  {
    title: "Legal",
    links: [
      ["Privacy Policy", "/privacy"],
      ["Terms", "/terms"],
      ["Cookie Policy", "/cookie-policy"],
      ["Security", "/security"]
    ]
  }
] as const;

export const supportedPlatforms = [
  { name: "Reddit", detail: "Subreddit posts and comment threads", status: "MVP" },
  { name: "LinkedIn", detail: "Visible feed and group discussions", status: "V2" },
  { name: "Facebook Groups", detail: "Visible group posts", status: "MVP" },
  { name: "Discord", detail: "Visible web channels", status: "MVP" },
  { name: "Slack", detail: "Visible web channels", status: "MVP" },
  { name: "Telegram", detail: "Visible web chats", status: "MVP" },
  { name: "WhatsApp Communities", detail: "Visible web chats", status: "MVP" },
  { name: "IndieHackers", detail: "Founder discussions and posts", status: "MVP" },
  { name: "Product Hunt", detail: "Launch and maker discussions", status: "V2" },
  { name: "X (Twitter)", detail: "Visible posts and search pages", status: "V2" }
] as const;

export const keywordRoles = [
  "Video Editor",
  "Graphic Designer",
  "Motion Designer",
  "Web Designer",
  "UI Designer",
  "UX Designer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "WordPress Developer",
  "Shopify Developer",
  "Agency",
  "Freelancer",
  "Startup Founder",
  "SaaS Founder",
  "Marketing Agency",
  "SEO Agency",
  "PPC Expert",
  "Copywriter",
  "Content Writer",
  "Growth Hacker",
  "Appointment Setter",
  "Sales Development Representative",
  "Cold Email Specialist",
  "Business Consultant",
  "Virtual Assistant",
  "Customer Support",
  "Recruiter",
  "Accountant",
  "Lawyer",
  "Architect",
  "Coach",
  "Fitness Trainer",
  "Doctor",
  "Dentist",
  "Photographer",
  "Videographer",
  "Real Estate Agent"
] as const;

export const keywordModifiers = [
  "freelance",
  "contract",
  "part time",
  "remote",
  "hybrid",
  "internship",
  "agency",
  "full time",
  "consulting",
  "project based",
  "commission",
  "volunteer",
  "apprenticeship"
] as const;

export const homepageSections = {
  trustSignals: ["Manual outreach only", "Visible content scanning", "Workspace sync", "7-day trial", "Gemini draft support"],
  features: [
    {
      title: "Lead discovery that respects communities",
      body: "Scan visible community posts, skip promoted content, and save only qualified opportunities."
    },
    {
      title: "Buyer-intent scoring",
      body: "Score posts by urgency, budget, hiring intent, founder pain, negative signals, and platform context."
    },
    {
      title: "Drafts without auto-sending",
      body: "Generate outreach openers from your knowledge base while keeping every message reviewed and sent manually."
    },
    {
      title: "CRM-ready follow-up workflow",
      body: "Assign owners, update statuses, export CSV, and keep follow-up dates visible across your workspace."
    }
  ],
  workflow: [
    ["Configure", "Set ICP, services, keywords, exclusions, scoring and campaigns in the dashboard."],
    ["Scan", "Open a supported community and scan visible posts with a clean Chrome extension."],
    ["Qualify", "Review score, temperature, matched signals, source URL, and duplicate checks."],
    ["Draft", "Generate a safe manual opener or follow-up using local templates or Gemini."],
    ["Track", "Save leads, update status, assign owner, export, and monitor performance."]
  ],
  metrics: [
    ["10", "supported platforms"],
    ["0", "auto-sent messages"],
    ["7 days", "trial period"],
    ["90 days", "default retention"]
  ]
};

export const marketingPages: Record<MarketingPageSlug, MarketingPage> = {
  features: {
    slug: "features",
    eyebrow: "Product",
    title: "A complete community lead workflow without spam automation",
    description: "Community Lead Assistant combines scanning, lead scoring, outreach drafting, CRM tracking, exports, analytics, and admin controls in one product.",
    icon: Sparkles,
    sections: [
      {
        title: "Discover high-intent conversations",
        body: "Find visible posts where founders, agencies, and operators ask for help with growth, sales, marketing, development, hiring, or specialist services.",
        points: ["Supported community adapters", "Promoted content detection", "Platform and community metadata", "Duplicate prevention"]
      },
      {
        title: "Qualify before contacting",
        body: "Lead scoring separates urgent buyer intent from job seekers, free work, warnings, and low-fit posts.",
        points: ["Hot, Warm, Review and Ignore temperature", "Custom score thresholds", "Negative keyword handling", "Saved filters and CSV exports"]
      },
      {
        title: "Draft responsibly",
        body: "The product can create helpful opener drafts, but the user must review and send manually from the source platform.",
        points: ["Knowledge base variables", "Blocked words", "Follow-up drafts", "No auto-send behavior"]
      }
    ],
    cta: "Start your 7-day trial"
  },
  solutions: {
    slug: "solutions",
    eyebrow: "Use cases",
    title: "Built for freelancers, agencies, founders, SDR teams, and growth consultants",
    description: "Create campaigns for the specific services you sell and the exact community signals that indicate a buyer is ready to talk.",
    icon: BriefcaseBusiness,
    sections: [
      {
        title: "Freelancers",
        body: "Track posts looking for designers, developers, editors, writers, virtual assistants, consultants, and niche service providers.",
        points: ["Role keyword suggestions", "Remote and contract filters", "Portfolio-safe outreach drafts"]
      },
      {
        title: "Agencies",
        body: "Monitor growth, SEO, PPC, outbound, web design, and appointment-setting conversations across multiple campaigns.",
        points: ["Workspace campaigns", "Owner assignment", "Bulk lead actions", "Performance analytics"]
      },
      {
        title: "Founder-led teams",
        body: "Find community conversations that reveal sales, marketing, demand generation, and GTM pain.",
        points: ["Founder pain signals", "Hot lead prioritization", "Follow-up reminders"]
      }
    ]
  },
  resources: {
    slug: "resources",
    eyebrow: "Learn",
    title: "Resources for safe community-led growth",
    description: "Guides, documentation, launch notes, FAQs, and product education for teams that want leads without blasting communities.",
    icon: BookOpen,
    sections: [
      {
        title: "Getting started",
        body: "Learn how to configure your workspace, campaigns, knowledge base, keyword rules, and extension.",
        points: ["Workspace setup", "Campaign setup", "Chrome extension install", "First scan checklist"]
      },
      {
        title: "Best practices",
        body: "Use precise intent signals, respectful drafts, and manual review to avoid low-quality outreach.",
        points: ["Community etiquette", "Signal quality", "Safe follow-ups", "Export hygiene"]
      }
    ]
  },
  roadmap: {
    slug: "roadmap",
    eyebrow: "Product direction",
    title: "Roadmap focused on safer, smarter lead intelligence",
    description: "The roadmap prioritizes maintainable platform adapters, richer qualification, workspace controls, and better reporting.",
    icon: Map,
    sections: [
      {
        title: "Now",
        body: "V2 focuses on polished UX, a stronger public site, admin controls, extension package clarity, and expanded platform adapters.",
        points: ["Premium marketing site", "Two-folder extension package", "Admin CRUD", "Public blog surface"]
      },
      {
        title: "Next",
        body: "Upcoming work should deepen analytics, AI drafting controls, and source-specific adapter reliability.",
        points: ["Advanced saved filters", "Team assignment rules", "More charting", "Adapter QA by platform"]
      }
    ]
  },
  changelog: {
    slug: "changelog",
    eyebrow: "Updates",
    title: "Product changelog",
    description: "Track major releases, extension updates, platform support changes, and dashboard improvements.",
    icon: Clock,
    sections: [
      {
        title: "Version 2 direction",
        body: "V2 upgrades the public website, extension packaging, platform support list, and admin system while preserving the existing app architecture.",
        points: ["Premium public pages", "Extension package structure", "Admin modules", "Safe outreach rules"]
      }
    ]
  },
  integrations: {
    slug: "integrations",
    eyebrow: "Connectors",
    title: "Integrations designed for export-first workflows",
    description: "Start with CSV and dashboard sync, then connect billing, AI, and future CRM integrations as the SaaS matures.",
    icon: Cable,
    sections: [
      {
        title: "Available now",
        body: "The product supports Supabase data sync, CSV exports, Gemini draft generation, and Stripe-ready billing architecture.",
        points: ["Supabase", "Gemini", "Stripe-ready", "CSV exports"]
      },
      {
        title: "Future-ready",
        body: "The API structure supports CRM and automation integrations without changing the extension scanning model.",
        points: ["CRM export hooks", "Webhook logs", "Feature flags", "API monitoring"]
      }
    ]
  },
  "api-docs": {
    slug: "api-docs",
    eyebrow: "Developers",
    title: "API documentation",
    description: "Use the existing route handlers for extension sync, lead ingestion, exports, admin operations, and dashboard data.",
    icon: Code2,
    sections: [
      {
        title: "Extension APIs",
        body: "The extension uses authenticated backend routes for bootstrap, lead sync, usage events, and error reporting.",
        points: ["/api/extension/bootstrap", "/api/extension/leads", "/api/extension/events", "/api/extension/errors"]
      },
      {
        title: "Dashboard APIs",
        body: "Authenticated app routes power leads, campaigns, keywords, knowledge base, templates, exports, and admin modules.",
        points: ["/api/leads", "/api/campaigns", "/api/exports/leads.csv", "/api/admin/[module]"]
      }
    ]
  },
  "help-center": {
    slug: "help-center",
    eyebrow: "Support",
    title: "Help center",
    description: "Clear setup and troubleshooting guidance for installing the extension, connecting a workspace, scanning pages, and exporting leads.",
    icon: LifeBuoy,
    sections: [
      {
        title: "Install support",
        body: "Chrome requires the extracted extension folder that contains manifest.json. The ZIP includes a dedicated folder for that.",
        points: ["Download ZIP", "Extract all", "Select Extension folder", "Reload after edits"]
      },
      {
        title: "Sync support",
        body: "The extension connects to your dashboard workspace and syncs leads, settings, campaigns, and local activity.",
        points: ["Check website URL", "Confirm login", "Retry sync", "Review local CSV"]
      }
    ]
  },
  faqs: {
    slug: "faqs",
    eyebrow: "Answers",
    title: "Frequently asked questions",
    description: "Straight answers about safety, supported platforms, extension install, AI drafts, billing, and data handling.",
    icon: FileQuestion,
    sections: [
      {
        title: "Does it auto-send messages?",
        body: "No. Community Lead Assistant does not auto-send DMs, comments, posts, replies, or follow-ups.",
        points: ["Manual review", "Manual send", "Scan Only mode", "Source links"]
      },
      {
        title: "What data is synced?",
        body: "Saved lead snippets, source metadata, score, status, notes, drafts, and workspace activity can sync to the dashboard.",
        points: ["No passwords collected", "Workspace ownership", "Local CSV export", "Data deletion support"]
      },
      {
        title: "Can I use it during the trial?",
        body: "Yes. The product is designed with a 7-day trial and default starter limits.",
        points: ["50 saved leads", "50 AI drafts", "One workspace", "Manual outreach only"]
      }
    ]
  },
  contact: {
    slug: "contact",
    eyebrow: "Contact",
    title: "Talk to the Community Lead Assistant team",
    description: "For product support, billing, security, partnerships, and platform support questions.",
    icon: Mail,
    sections: [
      {
        title: "Support",
        body: "Email support@communityleadassistant.com for account, extension, billing, and setup support.",
        points: ["Extension install help", "Billing questions", "Platform support", "Data requests"]
      }
    ]
  },
  about: {
    slug: "about",
    eyebrow: "Company",
    title: "A safer way to find community leads",
    description: "Community Lead Assistant is built around the belief that community-led growth should be useful, respectful, and manually reviewed.",
    icon: Building2,
    sections: [
      {
        title: "Principles",
        body: "The product prioritizes lead intelligence, source context, manual review, and transparent data handling.",
        points: ["No spam automation", "No stealth behavior", "No auto-send", "Clear user control"]
      }
    ]
  },
  careers: {
    slug: "careers",
    eyebrow: "Careers",
    title: "Build responsible growth software",
    description: "The company roadmap needs people who care about product quality, platform safety, privacy, and practical growth workflows.",
    icon: GraduationCap,
    sections: [
      {
        title: "What we value",
        body: "Strong product taste, careful engineering, thoughtful UX, and respect for platform communities.",
        points: ["Frontend craft", "Backend reliability", "Extension engineering", "Security-minded product work"]
      }
    ]
  },
  "cookie-policy": {
    slug: "cookie-policy",
    eyebrow: "Legal",
    title: "Cookie Policy",
    description: "Community Lead Assistant uses essential cookies for authentication and may use product analytics cookies where enabled.",
    icon: FileText,
    sections: [
      {
        title: "Cookie usage",
        body: "Cookies support login sessions, workspace access, security, preferences, and product analytics.",
        points: ["Authentication", "Security", "Preferences", "Analytics controls"]
      }
    ]
  },
  security: {
    slug: "security",
    eyebrow: "Trust",
    title: "Security and privacy by design",
    description: "The system avoids browser-side secrets, keeps service-role keys server-only, hashes extension sessions, and keeps outreach manual.",
    icon: ShieldCheck,
    sections: [
      {
        title: "Security posture",
        body: "Supabase authentication, server-side admin access, row-level security, hashed extension sessions, and explicit user controls protect the product surface.",
        points: ["No service-role key in browser", "Hashed extension sessions", "Admin-only routes", "Manual outreach requirement"]
      },
      {
        title: "Responsible automation boundary",
        body: "The extension can scan visible content and draft text, but it does not auto-send messages or bypass platform controls.",
        points: ["No DM blasting", "No stealth behavior", "No rate-limit evasion", "No automatic comments"]
      }
    ]
  },
  status: {
    slug: "status",
    eyebrow: "Reliability",
    title: "System status",
    description: "Core services include the web dashboard, Supabase database, extension sync APIs, Gemini draft generation, and Stripe billing readiness.",
    icon: Activity,
    sections: [
      {
        title: "Current status model",
        body: "The admin panel tracks API requests, sync failures, extension errors, AI failures, and system logs from connected production services.",
        points: ["Dashboard", "Extension sync", "AI drafting", "Billing routes"]
      }
    ]
  },
  "release-notes": {
    slug: "release-notes",
    eyebrow: "Extension",
    title: "Release notes",
    description: "Release notes document extension packaging, supported platforms, scanning changes, and dashboard sync improvements.",
    icon: Chrome,
    sections: [
      {
        title: "Current package",
        body: "The download ZIP contains an Extension folder, installation guide, README, and changelog for clearer user onboarding.",
        points: ["Extension folder", "Installation Guide PDF", "README", "Changelog"]
      }
    ]
  },
  community: {
    slug: "community",
    eyebrow: "Community",
    title: "Community-led growth without community abuse",
    description: "Use Community Lead Assistant to identify relevant conversations, then contribute thoughtfully and manually.",
    icon: Users,
    sections: [
      {
        title: "Community guidance",
        body: "Good outreach starts by understanding the post, respecting rules, and only contacting people when your service is relevant.",
        points: ["Read context", "Respect rules", "Avoid blasts", "Be useful first"]
      }
    ]
  },
  customers: {
    slug: "customers",
    eyebrow: "Customers",
    title: "Built for teams that sell services through trust",
    description: "The customer story system is managed from the admin marketing and blog modules, so verified stories can be published without editing code.",
    icon: Users,
    sections: [
      {
        title: "Who it serves",
        body: "Freelancers, small agencies, SDR teams, founder-led startups, SEO teams, web design studios, and growth consultants.",
        points: ["Freelancers", "Agencies", "Founders", "Growth teams"]
      },
      {
        title: "Publishing customer stories",
        body: "Use Admin > Marketing or Admin > Blogs to publish verified customer stories, case studies, and testimonials when they are available.",
        points: ["Verified stories", "Case studies", "Testimonials", "SEO metadata"]
      }
    ]
  }
};

export function getMarketingPage(slug: string): MarketingPage | undefined {
  return marketingPages[slug as MarketingPageSlug];
}

export function buildKeywordSuggestions(role: string) {
  const normalized = role.trim();
  if (!normalized) return [];
  return keywordModifiers.map(modifier => `${modifier} ${normalized}`.toLowerCase());
}
