export type CmsFieldType =
  | "text"
  | "slug"
  | "textarea"
  | "markdown"
  | "json"
  | "number"
  | "boolean"
  | "date"
  | "datetime"
  | "select"
  | "url"
  | "email";

export type CmsField = {
  key: string;
  label: string;
  type?: CmsFieldType;
  required?: boolean;
  options?: string[];
  placeholder?: string;
  helper?: string;
};

export type CmsModuleSlug =
  | "dashboard"
  | "website-content"
  | "homepage"
  | "about"
  | "contact"
  | "pricing"
  | "features"
  | "solutions"
  | "resources"
  | "blog-categories"
  | "blog-tags"
  | "authors"
  | "faq"
  | "testimonials"
  | "customers"
  | "careers"
  | "changelog"
  | "release-notes"
  | "media-library"
  | "media-folders"
  | "navigation"
  | "footer"
  | "announcements"
  | "newsletter"
  | "landing-pages"
  | "redirects"
  | "forms"
  | "form-submissions"
  | "tracking"
  | "integrations"
  | "case-studies"
  | "portfolio"
  | "team"
  | "roles"
  | "permissions"
  | "settings";

export type CmsModule = {
  slug: CmsModuleSlug;
  title: string;
  description: string;
  table: string;
  icon: string;
  category: "content" | "growth" | "system";
  defaultSort: string;
  searchable: string[];
  fields: CmsField[];
  createLabel: string;
};

export type CmsRow = Record<string, unknown> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type CmsListResult = {
  rows: CmsRow[];
  count: number;
  page: number;
  pageSize: number;
  tableMissing?: boolean;
};
