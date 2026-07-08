import type { CmsField, CmsModule, CmsModuleSlug } from "./types";

const pageFields = [
  { key: "title", label: "Title", type: "text", required: true },
  { key: "slug", label: "Slug", type: "slug", required: true },
  { key: "status", label: "Status", type: "select", options: ["draft", "published", "scheduled"] },
  { key: "content", label: "Content JSON", type: "json", helper: "Editable page content, section order, CTAs, logos, stats, testimonials, images, and toggles." },
  { key: "seo", label: "SEO JSON", type: "json", helper: "Meta title, description, canonical, keywords, OpenGraph, Twitter card, schema, robots." }
] satisfies CmsField[];

export const cmsModules: CmsModule[] = [
  {
    slug: "website-content",
    title: "Website Content",
    description: "Central editable website pages and section data.",
    table: "cms_pages",
    icon: "Layout",
    category: "content",
    defaultSort: "updated_at",
    searchable: ["title", "slug", "page_type", "status"],
    createLabel: "Create page",
    fields: [
      ...pageFields,
      { key: "page_type", label: "Page Type", type: "select", options: ["page", "homepage", "about", "pricing", "features", "solutions", "resources", "customers", "careers"] }
    ]
  },
  ...(["homepage", "about", "contact", "pricing", "features", "solutions", "resources", "customers", "careers", "changelog", "release-notes"] as const).map((slug): CmsModule => ({
    slug,
    title: titleCase(slug),
    description: `Edit the ${titleCase(slug)} page without touching code.`,
    table: "cms_pages",
    icon: "File",
    category: "content" as const,
    defaultSort: "updated_at",
    searchable: ["title", "slug", "status"],
    createLabel: `Create ${titleCase(slug)} page`,
    fields: [...pageFields, { key: "page_type", label: "Page Type", type: "text" as const }]
  })),
  {
    slug: "blog-categories",
    title: "Blog Categories",
    description: "Manage article categories, descriptions, ordering, and publishing visibility.",
    table: "cms_categories",
    icon: "FolderTree",
    category: "content",
    defaultSort: "sort_order",
    searchable: ["name", "slug", "description", "status"],
    createLabel: "Create category",
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      { key: "slug", label: "Slug", type: "slug", required: true },
      { key: "description", label: "Description", type: "textarea" },
      { key: "status", label: "Status", type: "select", options: ["draft", "published", "archived"] },
      { key: "sort_order", label: "Sort Order", type: "number" }
    ]
  },
  {
    slug: "blog-tags",
    title: "Blog Tags",
    description: "Create reusable post tags for search, filtering, and related content.",
    table: "cms_tags",
    icon: "Tags",
    category: "content",
    defaultSort: "name",
    searchable: ["name", "slug"],
    createLabel: "Create tag",
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      { key: "slug", label: "Slug", type: "slug", required: true },
      { key: "metadata", label: "Metadata JSON", type: "json" }
    ]
  },
  {
    slug: "authors",
    title: "Authors",
    description: "Manage blog authors, bios, avatars, and social profile metadata.",
    table: "cms_authors",
    icon: "UserPen",
    category: "content",
    defaultSort: "name",
    searchable: ["name", "email", "role", "bio"],
    createLabel: "Create author",
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      { key: "email", label: "Email", type: "email", required: true },
      { key: "role", label: "Role", type: "text" },
      { key: "bio", label: "Bio", type: "textarea" },
      { key: "avatar_url", label: "Avatar URL", type: "url" },
      { key: "social_links", label: "Social Links JSON", type: "json" },
      { key: "status", label: "Status", type: "select", options: ["active", "inactive", "archived"] }
    ]
  },
  {
    slug: "faq",
    title: "FAQ",
    description: "Create, edit, delete, categorize, and sort FAQ items.",
    table: "cms_faq",
    icon: "Help",
    category: "content",
    defaultSort: "sort_order",
    searchable: ["question", "answer", "category", "status"],
    createLabel: "Create FAQ",
    fields: [
      { key: "question", label: "Question", type: "text", required: true },
      { key: "answer", label: "Answer", type: "textarea", required: true },
      { key: "category", label: "Category", type: "text" },
      { key: "sort_order", label: "Sort Order", type: "number" },
      { key: "status", label: "Status", type: "select", options: ["draft", "published", "archived"] }
    ]
  },
  {
    slug: "testimonials",
    title: "Testimonials",
    description: "Manage reviews, photos, ratings, and featured customer proof.",
    table: "cms_testimonials",
    icon: "Star",
    category: "content",
    defaultSort: "sort_order",
    searchable: ["name", "company", "role", "review", "status"],
    createLabel: "Create testimonial",
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      { key: "company", label: "Company", type: "text" },
      { key: "role", label: "Role", type: "text" },
      { key: "rating", label: "Rating", type: "number" },
      { key: "review", label: "Review", type: "textarea", required: true },
      { key: "photo_url", label: "Photo URL", type: "url" },
      { key: "featured", label: "Featured", type: "boolean" },
      { key: "status", label: "Status", type: "select", options: ["draft", "published", "archived"] },
      { key: "sort_order", label: "Sort Order", type: "number" }
    ]
  },
  {
    slug: "media-library",
    title: "Media Library",
    description: "Upload, replace, search, organize, and delete media assets.",
    table: "cms_media",
    icon: "Image",
    category: "system",
    defaultSort: "created_at",
    searchable: ["file_name", "file_type", "folder", "alt_text"],
    createLabel: "Register media",
    fields: [
      { key: "folder", label: "Folder", type: "text" },
      { key: "file_name", label: "File Name", type: "text" },
      { key: "file_type", label: "File Type", type: "text" },
      { key: "public_url", label: "Public URL", type: "url" },
      { key: "alt_text", label: "Alt Text", type: "text" },
      { key: "metadata", label: "Metadata JSON", type: "json" }
    ]
  },
  {
    slug: "media-folders",
    title: "Media Folders",
    description: "Organize uploaded assets into folders with tags, descriptions, and storage metadata.",
    table: "cms_media_folders",
    icon: "Folder",
    category: "system",
    defaultSort: "sort_order",
    searchable: ["name", "slug", "description"],
    createLabel: "Create folder",
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      { key: "slug", label: "Slug", type: "slug", required: true },
      { key: "description", label: "Description", type: "textarea" },
      { key: "sort_order", label: "Sort Order", type: "number" },
      { key: "metadata", label: "Metadata JSON", type: "json" }
    ]
  },
  {
    slug: "navigation",
    title: "Navigation",
    description: "Edit header menus, dropdowns, order, icons, and visibility.",
    table: "cms_navigation",
    icon: "Menu",
    category: "system",
    defaultSort: "sort_order",
    searchable: ["location", "label", "href", "icon"],
    createLabel: "Create nav item",
    fields: [
      { key: "location", label: "Location", type: "select", options: ["header", "footer", "mobile"] },
      { key: "label", label: "Label", type: "text", required: true },
      { key: "href", label: "URL", type: "text", required: true },
      { key: "icon", label: "Icon", type: "text" },
      { key: "sort_order", label: "Order", type: "number" },
      { key: "visible", label: "Visible", type: "boolean" },
      { key: "metadata", label: "Metadata JSON", type: "json" }
    ]
  },
  {
    slug: "footer",
    title: "Footer",
    description: "Manage footer groups, legal links, product links, and resources.",
    table: "cms_footer",
    icon: "PanelBottom",
    category: "system",
    defaultSort: "sort_order",
    searchable: ["group_name", "label", "href"],
    createLabel: "Create footer link",
    fields: [
      { key: "group_name", label: "Group", type: "text" },
      { key: "label", label: "Label", type: "text" },
      { key: "href", label: "URL", type: "text" },
      { key: "sort_order", label: "Order", type: "number" },
      { key: "visible", label: "Visible", type: "boolean" }
    ]
  },
  {
    slug: "announcements",
    title: "Announcements",
    description: "Top banners, popups, maintenance notices, product updates, scheduling, and dismissible messages.",
    table: "cms_announcements",
    icon: "Megaphone",
    category: "growth",
    defaultSort: "updated_at",
    searchable: ["type", "title", "body", "status"],
    createLabel: "Create announcement",
    fields: [
      { key: "type", label: "Type", type: "select", options: ["top_banner", "popup", "maintenance", "product_update"] },
      { key: "title", label: "Title", type: "text" },
      { key: "body", label: "Body", type: "textarea" },
      { key: "cta_label", label: "CTA Label", type: "text" },
      { key: "cta_href", label: "CTA URL", type: "text" },
      { key: "dismissible", label: "Dismissible", type: "boolean" },
      { key: "status", label: "Status", type: "select", options: ["draft", "published", "scheduled", "archived"] },
      { key: "starts_at", label: "Starts", type: "datetime" },
      { key: "ends_at", label: "Ends", type: "datetime" }
    ]
  },
  {
    slug: "newsletter",
    title: "Newsletter",
    description: "Subscribers, import, export, status, and campaign readiness.",
    table: "cms_newsletter_subscribers",
    icon: "Mail",
    category: "growth",
    defaultSort: "created_at",
    searchable: ["email", "name", "status", "source"],
    createLabel: "Add subscriber",
    fields: [
      { key: "email", label: "Email", type: "email", required: true },
      { key: "name", label: "Name", type: "text" },
      { key: "status", label: "Status", type: "select", options: ["subscribed", "unsubscribed", "bounced"] },
      { key: "source", label: "Source", type: "text" },
      { key: "metadata", label: "Metadata JSON", type: "json" }
    ]
  },
  {
    slug: "landing-pages",
    title: "Landing Pages",
    description: "Create unlimited landing pages with editable hero, pricing, FAQ, testimonials, and SEO.",
    table: "cms_landing_pages",
    icon: "Rocket",
    category: "growth",
    defaultSort: "updated_at",
    searchable: ["title", "slug", "status"],
    createLabel: "Create landing page",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "slug", label: "Slug", type: "slug" },
      { key: "status", label: "Status", type: "select", options: ["draft", "published", "scheduled"] },
      { key: "sections", label: "Sections JSON", type: "json" },
      { key: "seo", label: "SEO JSON", type: "json" }
    ]
  },
  {
    slug: "redirects",
    title: "Redirects",
    description: "Manage old URLs, destination URLs, and redirect status codes.",
    table: "cms_redirects",
    icon: "Route",
    category: "system",
    defaultSort: "created_at",
    searchable: ["source_path", "destination_path"],
    createLabel: "Create redirect",
    fields: [
      { key: "source_path", label: "Source Path", type: "text" },
      { key: "destination_path", label: "Destination Path", type: "text" },
      { key: "status_code", label: "Status Code", type: "number" },
      { key: "enabled", label: "Enabled", type: "boolean" }
    ]
  },
  {
    slug: "forms",
    title: "Forms",
    description: "Build and manage contact, newsletter, lead, quote, popup, and booking forms.",
    table: "cms_forms",
    icon: "ClipboardList",
    category: "growth",
    defaultSort: "updated_at",
    searchable: ["name", "slug", "form_type", "status"],
    createLabel: "Create form",
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      { key: "slug", label: "Slug", type: "slug", required: true },
      { key: "form_type", label: "Type", type: "select", options: ["contact", "newsletter", "lead", "quote", "booking", "popup"] },
      { key: "fields", label: "Fields JSON", type: "json" },
      { key: "success_message", label: "Success Message", type: "textarea" },
      { key: "notification_email", label: "Notification Email", type: "email" },
      { key: "status", label: "Status", type: "select", options: ["draft", "published", "archived"] }
    ]
  },
  {
    slug: "form-submissions",
    title: "Form Submissions",
    description: "Review, search, export, and archive website form submissions.",
    table: "cms_form_submissions",
    icon: "Inbox",
    category: "growth",
    defaultSort: "created_at",
    searchable: ["submitter_email", "submitter_name", "status", "source_url"],
    createLabel: "Create submission",
    fields: [
      { key: "form_id", label: "Form ID", type: "text" },
      { key: "submitter_name", label: "Submitter Name", type: "text" },
      { key: "submitter_email", label: "Submitter Email", type: "email" },
      { key: "source_url", label: "Source URL", type: "url" },
      { key: "payload", label: "Payload JSON", type: "json" },
      { key: "status", label: "Status", type: "select", options: ["new", "reviewed", "spam", "archived"] }
    ]
  },
  {
    slug: "tracking",
    title: "Tracking",
    description: "Manage analytics pixels, tag manager snippets, conversion events, and consent settings.",
    table: "cms_tracking",
    icon: "Activity",
    category: "growth",
    defaultSort: "updated_at",
    searchable: ["provider", "tracking_id", "status"],
    createLabel: "Create tracking item",
    fields: [
      { key: "provider", label: "Provider", type: "select", options: ["google_analytics", "google_tag_manager", "meta_pixel", "linkedin_insight", "clarity", "custom"] },
      { key: "tracking_id", label: "Tracking ID", type: "text" },
      { key: "script", label: "Script / Config", type: "textarea" },
      { key: "status", label: "Status", type: "select", options: ["draft", "active", "paused", "archived"] },
      { key: "metadata", label: "Metadata JSON", type: "json" }
    ]
  },
  {
    slug: "integrations",
    title: "Integrations",
    description: "Configure CRM, email, chat, booking, automation, analytics, and payment integrations.",
    table: "cms_integrations",
    icon: "Plug",
    category: "system",
    defaultSort: "updated_at",
    searchable: ["name", "provider", "status"],
    createLabel: "Create integration",
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      { key: "provider", label: "Provider", type: "text" },
      { key: "status", label: "Status", type: "select", options: ["draft", "active", "paused", "archived"] },
      { key: "config", label: "Config JSON", type: "json" },
      { key: "notes", label: "Notes", type: "textarea" }
    ]
  },
  {
    slug: "case-studies",
    title: "Case Studies",
    description: "Manage customer stories, results, screenshots, technologies, and SEO metadata.",
    table: "cms_case_studies",
    icon: "BookOpen",
    category: "content",
    defaultSort: "updated_at",
    searchable: ["title", "slug", "client_name", "industry", "status"],
    createLabel: "Create case study",
    fields: [
      { key: "title", label: "Title", type: "text", required: true },
      { key: "slug", label: "Slug", type: "slug", required: true },
      { key: "client_name", label: "Client Name", type: "text" },
      { key: "industry", label: "Industry", type: "text" },
      { key: "summary", label: "Summary", type: "textarea" },
      { key: "results", label: "Results JSON", type: "json" },
      { key: "content", label: "Content JSON", type: "json" },
      { key: "seo", label: "SEO JSON", type: "json" },
      { key: "status", label: "Status", type: "select", options: ["draft", "published", "archived"] }
    ]
  },
  {
    slug: "portfolio",
    title: "Portfolio",
    description: "Manage portfolio projects, galleries, categories, technologies, and external links.",
    table: "cms_portfolio",
    icon: "Briefcase",
    category: "content",
    defaultSort: "updated_at",
    searchable: ["title", "slug", "category", "status"],
    createLabel: "Create project",
    fields: [
      { key: "title", label: "Title", type: "text", required: true },
      { key: "slug", label: "Slug", type: "slug", required: true },
      { key: "category", label: "Category", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "project_url", label: "Project URL", type: "url" },
      { key: "gallery", label: "Gallery JSON", type: "json" },
      { key: "status", label: "Status", type: "select", options: ["draft", "published", "archived"] }
    ]
  },
  {
    slug: "team",
    title: "Team",
    description: "Manage public team member profiles, photos, roles, biographies, and social links.",
    table: "cms_team",
    icon: "Users",
    category: "content",
    defaultSort: "sort_order",
    searchable: ["name", "role", "department", "status"],
    createLabel: "Create team member",
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      { key: "role", label: "Role", type: "text" },
      { key: "department", label: "Department", type: "text" },
      { key: "bio", label: "Bio", type: "textarea" },
      { key: "photo_url", label: "Photo URL", type: "url" },
      { key: "social_links", label: "Social Links JSON", type: "json" },
      { key: "sort_order", label: "Sort Order", type: "number" },
      { key: "status", label: "Status", type: "select", options: ["draft", "published", "archived"] }
    ]
  },
  {
    slug: "roles",
    title: "CMS Roles",
    description: "Manage reusable CMS roles for editors, marketers, SEO users, designers, and developers.",
    table: "cms_roles",
    icon: "Shield",
    category: "system",
    defaultSort: "name",
    searchable: ["name", "description", "status"],
    createLabel: "Create role",
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      { key: "slug", label: "Slug", type: "slug", required: true },
      { key: "description", label: "Description", type: "textarea" },
      { key: "permissions", label: "Permissions JSON", type: "json" },
      { key: "status", label: "Status", type: "select", options: ["active", "inactive", "archived"] }
    ]
  },
  {
    slug: "permissions",
    title: "CMS Permissions",
    description: "Audit module-level access grants and permission matrix records.",
    table: "cms_permissions",
    icon: "KeyRound",
    category: "system",
    defaultSort: "module",
    searchable: ["role_slug", "module", "action"],
    createLabel: "Create permission",
    fields: [
      { key: "role_slug", label: "Role Slug", type: "text", required: true },
      { key: "module", label: "Module", type: "text", required: true },
      { key: "action", label: "Action", type: "select", options: ["view", "create", "edit", "delete", "publish", "export", "import", "approve"] },
      { key: "allowed", label: "Allowed", type: "boolean" }
    ]
  },
  {
    slug: "settings",
    title: "Settings",
    description: "CMS-wide settings, homepage SEO, sitemap, robots, social cards, and content defaults.",
    table: "cms_settings",
    icon: "Settings",
    category: "system",
    defaultSort: "updated_at",
    searchable: ["group_name", "key"],
    createLabel: "Create setting",
    fields: [
      { key: "group_name", label: "Group", type: "text" },
      { key: "key", label: "Key", type: "text" },
      { key: "value", label: "Value JSON", type: "json" }
    ]
  }
];

export const cmsNav = [
  { href: "/admin/cms", label: "Dashboard" },
  { href: "/admin/cms/website-editor", label: "Website Editor" },
  ...cmsModules.map(module => ({ href: `/admin/cms/${module.slug}`, label: module.title }))
];

export function getCmsModule(slug: string): CmsModule | undefined {
  return cmsModules.find(module => module.slug === slug);
}

export function isCmsModuleSlug(slug: string): slug is CmsModuleSlug {
  return slug === "dashboard" || Boolean(getCmsModule(slug));
}

function titleCase(value: string) {
  return value.split("-").map(part => `${part.charAt(0).toUpperCase()}${part.slice(1)}`).join(" ");
}
