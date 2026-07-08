# CMS Database Schema

Updated: 2026-07-08

## Core CMS Tables

| Table | Purpose |
| --- | --- |
| `cms_pages` | Editable website pages, homepage data, page content JSON, SEO JSON, publish state. |
| `cms_sections` | Page sections and block-level content for the website editor. |
| `cms_page_revisions` | Page version snapshots for rollback and audit history. |
| `cms_posts` | Blog posts with markdown, SEO, schedule, author, tags, and publish state. |
| `cms_post_revisions` | Blog post version snapshots. |
| `cms_categories` | Blog/category taxonomy records. |
| `cms_tags` | Reusable tags for posts and content grouping. |
| `cms_authors` | Blog authors and public author profiles. |

## Media And Assets

| Table | Purpose |
| --- | --- |
| `cms_media` | Uploaded assets, file metadata, storage path, public URL, alt text, captions, tags. |
| `cms_media_folders` | Media library folder structure and organization metadata. |

## Website Structure

| Table | Purpose |
| --- | --- |
| `cms_navigation` | Header, footer, mobile, dropdown, and menu links. |
| `cms_footer` | Footer groups, legal links, product links, resource links, and footer metadata. |
| `cms_landing_pages` | Landing page builder records with sections JSON and SEO JSON. |
| `cms_redirects` | 301/302 redirects and enabled state. |
| `cms_settings` | Global CMS settings, branding, SEO, robots, sitemap, newsletter, tracking defaults. |

## Marketing And Content

| Table | Purpose |
| --- | --- |
| `cms_announcements` | Top banners, popups, product updates, and scheduled announcements. |
| `cms_newsletter_subscribers` | Newsletter subscribers, status, source, and metadata. |
| `cms_testimonials` | Customer testimonials, ratings, photos, featured state. |
| `cms_faq` | FAQ questions, answers, categories, status, and ordering. |
| `cms_case_studies` | Customer stories, results JSON, case study content, SEO. |
| `cms_portfolio` | Portfolio projects, galleries, categories, and public links. |
| `cms_team` | Public team profiles, bios, photos, social links, and ordering. |

## Forms And Integrations

| Table | Purpose |
| --- | --- |
| `cms_forms` | Website form definitions, fields JSON, notification email, webhook settings. |
| `cms_form_submissions` | Form submissions, payload JSON, source URL, submitter identity, review status. |
| `cms_tracking` | Analytics and pixel configuration records. |
| `cms_integrations` | CRM, email, automation, chat, booking, and analytics integration settings. |

## Access And Operations

| Table | Purpose |
| --- | --- |
| `cms_roles` | Reusable CMS role definitions and permission templates. |
| `cms_permissions` | Role/module/action permission matrix. |
| `cms_versions` | Generic resource version snapshots for future rollback support. |
| `cms_import_jobs` | Import job state for future large-file import tracking. |

## Standard Columns

Production CMS tables include:

- `id`
- `status`
- `created_at`
- `updated_at`
- `deleted_at`
- `created_by`
- `updated_by`

Content tables that support public URLs include `slug` with unique indexes.

## Indexes And Constraints

The repair migration adds unique indexes for:

- Page slug
- Post slug
- Category slug
- Tag slug
- Author email
- Media folder slug
- Navigation location plus label plus href
- Settings group plus key
- Redirect source path
- Landing page slug
- Form slug
- Case study slug
- Portfolio slug
- Role slug
- Permission role plus module plus action

It also adds query indexes for common admin filters such as `status`, `created_at`, `updated_at`, `provider`, `folder`, `sort_order`, and resource version history.
