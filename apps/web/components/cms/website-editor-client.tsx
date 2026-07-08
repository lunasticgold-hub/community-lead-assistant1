"use client";

import { useMemo, useState } from "react";
import type { MenuItem, WebsiteEditorContent } from "@/lib/cms/website-editor-defaults";

type WebsiteEditorClientProps = {
  initialContent: WebsiteEditorContent;
};

type EditorTab =
  | "branding"
  | "navigation"
  | "hero"
  | "contact"
  | "content"
  | "services"
  | "seo"
  | "tracking"
  | "technical"
  | "qa";

const tabs: Array<{ id: EditorTab; label: string }> = [
  { id: "branding", label: "Branding" },
  { id: "navigation", label: "Navigation" },
  { id: "hero", label: "Hero" },
  { id: "contact", label: "Contact & Socials" },
  { id: "content", label: "Content & Media" },
  { id: "services", label: "Services" },
  { id: "seo", label: "SEO" },
  { id: "tracking", label: "Tracking" },
  { id: "technical", label: "Technical" },
  { id: "qa", label: "QA" }
];

export function WebsiteEditorClient({ initialContent }: WebsiteEditorClientProps) {
  const [content, setContent] = useState(initialContent);
  const [activeTab, setActiveTab] = useState<EditorTab>("branding");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  const headerMenuText = useMemo(() => menuToText(content.navigation.headerMenu), [content.navigation.headerMenu]);
  const footerMenuText = useMemo(() => menuToText(content.navigation.footerMenu), [content.navigation.footerMenu]);

  function updateSection<Section extends keyof WebsiteEditorContent, Key extends keyof WebsiteEditorContent[Section]>(
    section: Section,
    key: Key,
    value: WebsiteEditorContent[Section][Key]
  ) {
    setContent(current => ({
      ...current,
      [section]: {
        ...current[section],
        [key]: value
      }
    }));
  }

  function updateJsonSection<Section extends keyof WebsiteEditorContent>(section: Section, value: string) {
    try {
      const parsed = JSON.parse(value) as WebsiteEditorContent[Section];
      setContent(current => ({ ...current, [section]: parsed }));
      setStatus("");
    } catch {
      setStatus(`Invalid JSON in ${String(section)}.`);
    }
  }

  async function save() {
    setSaving(true);
    setStatus("");
    const response = await fetch("/api/cms/website-editor", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ content })
    });
    const json = await response.json().catch(() => ({}));
    setSaving(false);

    if (!response.ok || json.ok === false) {
      setStatus(String(json.error || "Could not publish website edits."));
      return;
    }

    setStatus("Saved and published. Refresh the public website to see changes.");
  }

  return (
    <div className="space-y-5">
      <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-blue-500/20 via-white/[0.04] to-cyan-400/10 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">Live Website Editor</div>
            <h1 className="mt-3 text-3xl font-semibold text-white">Edit the current website from one CMS portal.</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
              Update branding, menus, hero text, content, media references, contact info, social links, services, SEO, tracking, integrations, legal, technical, and QA notes.
            </p>
          </div>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Publishing..." : "Save & Publish"}
          </button>
        </div>
        {status ? <div className="mt-4 rounded-xl border border-white/10 bg-slate-950/60 p-3 text-sm text-slate-200">{status}</div> : null}
      </div>

      <div className="flex gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.04] p-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={[
              "whitespace-nowrap rounded-xl px-3 py-2 text-sm transition",
              activeTab === tab.id ? "bg-blue-500 text-white" : "text-slate-300 hover:bg-white/10 hover:text-white"
            ].join(" ")}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "branding" ? (
        <EditorCard title="Branding">
          <InputGrid>
            <TextField label="Company Name" value={content.branding.companyName} onChange={value => updateSection("branding", "companyName", value)} />
            <TextField label="Short Name" value={content.branding.shortName} onChange={value => updateSection("branding", "shortName", value)} />
            <TextField label="Tagline" value={content.branding.tagline} onChange={value => updateSection("branding", "tagline", value)} />
            <TextField label="Slogan" value={content.branding.slogan} onChange={value => updateSection("branding", "slogan", value)} />
            <TextField label="Logo URL" value={content.branding.logoUrl} onChange={value => updateSection("branding", "logoUrl", value)} />
            <TextField label="Favicon URL" value={content.branding.faviconUrl} onChange={value => updateSection("branding", "faviconUrl", value)} />
            <TextField label="Primary Color" type="color" value={content.branding.primaryColor} onChange={value => updateSection("branding", "primaryColor", value)} />
            <TextField label="Secondary Color" type="color" value={content.branding.secondaryColor} onChange={value => updateSection("branding", "secondaryColor", value)} />
            <TextField label="Accent Color" type="color" value={content.branding.accentColor} onChange={value => updateSection("branding", "accentColor", value)} />
            <TextField label="Heading Font" value={content.branding.headingFont} onChange={value => updateSection("branding", "headingFont", value)} />
            <TextField label="Body Font" value={content.branding.bodyFont} onChange={value => updateSection("branding", "bodyFont", value)} />
          </InputGrid>
          <TextAreaField label="Brand Guidelines" value={content.branding.brandGuidelines} onChange={value => updateSection("branding", "brandGuidelines", value)} />
        </EditorCard>
      ) : null}

      {activeTab === "navigation" ? (
        <EditorCard title="Navigation">
          <InputGrid>
            <TextField label="CTA Button Text" value={content.navigation.ctaLabel} onChange={value => updateSection("navigation", "ctaLabel", value)} />
            <TextField label="CTA Link" value={content.navigation.ctaHref} onChange={value => updateSection("navigation", "ctaHref", value)} />
            <ToggleField label="Sticky Header" value={content.navigation.stickyHeader} onChange={value => updateSection("navigation", "stickyHeader", value)} />
            <ToggleField label="Mega Menu" value={content.navigation.megaMenuEnabled} onChange={value => updateSection("navigation", "megaMenuEnabled", value)} />
            <ToggleField label="Mobile Menu" value={content.navigation.mobileMenuEnabled} onChange={value => updateSection("navigation", "mobileMenuEnabled", value)} />
            <ToggleField label="Breadcrumbs" value={content.navigation.breadcrumbsEnabled} onChange={value => updateSection("navigation", "breadcrumbsEnabled", value)} />
          </InputGrid>
          <TextAreaField label="Header Menu: one item per line as Label|/url" value={headerMenuText} onChange={value => updateSection("navigation", "headerMenu", textToMenu(value))} />
          <TextAreaField label="Footer Menu: one item per line as Label|/url" value={footerMenuText} onChange={value => updateSection("navigation", "footerMenu", textToMenu(value))} />
        </EditorCard>
      ) : null}

      {activeTab === "hero" ? (
        <EditorCard title="Hero Section">
          <InputGrid>
            <TextField label="Headline" value={content.hero.headline} onChange={value => updateSection("hero", "headline", value)} />
            <TextField label="Subheadline" value={content.hero.subheadline} onChange={value => updateSection("hero", "subheadline", value)} />
            <TextField label="Primary CTA Text" value={content.hero.primaryCtaLabel} onChange={value => updateSection("hero", "primaryCtaLabel", value)} />
            <TextField label="Primary CTA Link" value={content.hero.primaryCtaHref} onChange={value => updateSection("hero", "primaryCtaHref", value)} />
            <TextField label="Secondary CTA Text" value={content.hero.secondaryCtaLabel} onChange={value => updateSection("hero", "secondaryCtaLabel", value)} />
            <TextField label="Secondary CTA Link" value={content.hero.secondaryCtaHref} onChange={value => updateSection("hero", "secondaryCtaHref", value)} />
            <TextField label="Background Image/Video URL" value={content.hero.backgroundMediaUrl} onChange={value => updateSection("hero", "backgroundMediaUrl", value)} />
            <TextField label="Hero Illustration URL" value={content.hero.illustrationUrl} onChange={value => updateSection("hero", "illustrationUrl", value)} />
            <TextField label="Ratings Text" value={content.hero.ratingText} onChange={value => updateSection("hero", "ratingText", value)} />
            <ToggleField label="Animation" value={content.hero.animationEnabled} onChange={value => updateSection("hero", "animationEnabled", value)} />
          </InputGrid>
          <TextAreaField label="Description" value={content.hero.description} onChange={value => updateSection("hero", "description", value)} />
          <TextAreaField label="Trust Badges, one per line" value={content.hero.trustBadges.join("\n")} onChange={value => updateSection("hero", "trustBadges", lines(value))} />
          <TextAreaField label="Client Logos / Trust Names, one per line" value={content.hero.clientLogos.join("\n")} onChange={value => updateSection("hero", "clientLogos", lines(value))} />
        </EditorCard>
      ) : null}

      {activeTab === "contact" ? (
        <EditorCard title="Contact, Forms, and Social Media">
          <InputGrid>
            <TextField label="Email" value={content.contact.email} onChange={value => updateSection("contact", "email", value)} />
            <TextField label="Phone" value={content.contact.phone} onChange={value => updateSection("contact", "phone", value)} />
            <TextField label="WhatsApp" value={content.contact.whatsapp} onChange={value => updateSection("contact", "whatsapp", value)} />
            <TextField label="Address" value={content.contact.address} onChange={value => updateSection("contact", "address", value)} />
            <TextField label="Google Maps URL" value={content.contact.googleMapsUrl} onChange={value => updateSection("contact", "googleMapsUrl", value)} />
            <TextField label="Working Hours" value={content.contact.workingHours} onChange={value => updateSection("contact", "workingHours", value)} />
            <TextField label="Emergency Contact" value={content.contact.emergencyContact} onChange={value => updateSection("contact", "emergencyContact", value)} />
            <TextField label="Email Notifications To" value={content.forms.emailNotificationsTo} onChange={value => updateSection("forms", "emailNotificationsTo", value)} />
            <ToggleField label="CAPTCHA" value={content.forms.captchaEnabled} onChange={value => updateSection("forms", "captchaEnabled", value)} />
          </InputGrid>
          <JsonField label="Social Media Links JSON" value={content.socials} onChange={value => updateJsonSection("socials", value)} />
          <JsonField label="Forms JSON" value={content.forms} onChange={value => updateJsonSection("forms", value)} />
        </EditorCard>
      ) : null}

      {activeTab === "content" ? (
        <EditorCard title="Content, Images, Videos, Team, Testimonials, Blog, Footer, Legal">
          <TextAreaField label="About Us" value={content.content.aboutUs} onChange={value => updateSection("content", "aboutUs", value)} />
          <TextAreaField label="Mission" value={content.content.mission} onChange={value => updateSection("content", "mission", value)} />
          <TextAreaField label="Vision" value={content.content.vision} onChange={value => updateSection("content", "vision", value)} />
          <TextAreaField label="Company Story" value={content.content.companyStory} onChange={value => updateSection("content", "companyStory", value)} />
          <JsonField label="Editable Sections JSON" value={content.content.editableSections} onChange={value => {
            try {
              const parsed = JSON.parse(value) as Record<string, unknown>;
              updateSection("content", "editableSections", parsed);
              setStatus("");
            } catch {
              setStatus("Invalid JSON in editable sections.");
            }
          }} />
          <JsonField label="Media Library References JSON" value={content.media} onChange={value => updateJsonSection("media", value)} />
          <JsonField label="Footer JSON" value={content.footer} onChange={value => updateJsonSection("footer", value)} />
          <JsonField label="Blog JSON" value={content.blog} onChange={value => updateJsonSection("blog", value)} />
          <JsonField label="Testimonials JSON" value={content.testimonials} onChange={value => updateJsonSection("testimonials", value)} />
          <JsonField label="Team JSON" value={content.team} onChange={value => updateJsonSection("team", value)} />
          <JsonField label="Legal JSON" value={content.legal} onChange={value => updateJsonSection("legal", value)} />
        </EditorCard>
      ) : null}

      {activeTab === "services" ? (
        <EditorCard title="Services, Products, Portfolio, Ecommerce">
          <JsonField label="Services JSON" value={content.services} onChange={value => updateJsonSection("services", value)} />
          <JsonField label="Portfolio JSON" value={content.portfolio} onChange={value => updateJsonSection("portfolio", value)} />
        </EditorCard>
      ) : null}

      {activeTab === "seo" ? (
        <EditorCard title="SEO Manager">
          <InputGrid>
            <TextField label="Meta Title" value={content.seo.metaTitle} onChange={value => updateSection("seo", "metaTitle", value)} />
            <TextField label="Canonical URL" value={content.seo.canonicalUrl} onChange={value => updateSection("seo", "canonicalUrl", value)} />
            <TextField label="OpenGraph Image" value={content.seo.openGraphImage} onChange={value => updateSection("seo", "openGraphImage", value)} />
            <TextField label="Twitter Card Image" value={content.seo.twitterCardImage} onChange={value => updateSection("seo", "twitterCardImage", value)} />
            <TextField label="Robots" value={content.seo.robots} onChange={value => updateSection("seo", "robots", value)} />
            <ToggleField label="Sitemap Enabled" value={content.seo.sitemapEnabled} onChange={value => updateSection("seo", "sitemapEnabled", value)} />
          </InputGrid>
          <TextAreaField label="Meta Description" value={content.seo.metaDescription} onChange={value => updateSection("seo", "metaDescription", value)} />
          <TextAreaField label="Keywords, one per line" value={content.seo.keywords.join("\n")} onChange={value => updateSection("seo", "keywords", lines(value))} />
          <JsonField label="Schema Markup JSON" value={content.seo.schemaMarkup} onChange={value => {
            try {
              updateSection("seo", "schemaMarkup", JSON.parse(value) as Record<string, unknown>);
              setStatus("");
            } catch {
              setStatus("Invalid schema JSON.");
            }
          }} />
        </EditorCard>
      ) : null}

      {activeTab === "tracking" ? (
        <EditorCard title="Analytics, Tracking, Integrations, Security">
          <JsonField label="Analytics & Tracking JSON" value={content.analytics} onChange={value => updateJsonSection("analytics", value)} />
          <JsonField label="Integrations JSON" value={content.integrations} onChange={value => updateJsonSection("integrations", value)} />
          <JsonField label="Security JSON" value={content.security} onChange={value => updateJsonSection("security", value)} />
        </EditorCard>
      ) : null}

      {activeTab === "technical" ? (
        <EditorCard title="Performance, Responsiveness, Animations, Accessibility, Technical">
          <JsonField label="Performance JSON" value={content.performance} onChange={value => updateJsonSection("performance", value)} />
          <JsonField label="Responsiveness JSON" value={content.responsiveness} onChange={value => updateJsonSection("responsiveness", value)} />
          <JsonField label="Animations JSON" value={content.animations} onChange={value => updateJsonSection("animations", value)} />
          <JsonField label="Accessibility JSON" value={content.accessibility} onChange={value => updateJsonSection("accessibility", value)} />
          <JsonField label="Technical JSON" value={content.technical} onChange={value => updateJsonSection("technical", value)} />
        </EditorCard>
      ) : null}

      {activeTab === "qa" ? (
        <EditorCard title="Quality Assurance Checklist">
          <JsonField label="QA JSON" value={content.qa} onChange={value => updateJsonSection("qa", value)} />
        </EditorCard>
      ) : null}
    </div>
  );
}

function EditorCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      {children}
    </section>
  );
}

function InputGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{children}</div>;
}

function TextField({ label, value, onChange, type = "text" }: { label: string; value: string; type?: "text" | "color"; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2 text-sm text-slate-300">
      <span>{label}</span>
      <input
        type={type}
        value={value}
        onChange={event => onChange(event.target.value)}
        className="min-h-11 rounded-xl border border-white/10 bg-slate-950 px-3 text-sm text-white outline-none focus:border-blue-400"
      />
    </label>
  );
}

function TextAreaField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2 text-sm text-slate-300">
      <span>{label}</span>
      <textarea
        value={value}
        onChange={event => onChange(event.target.value)}
        rows={5}
        className="rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-sm leading-6 text-white outline-none focus:border-blue-400"
      />
    </label>
  );
}

function JsonField({ label, value, onChange }: { label: string; value: unknown; onChange: (value: string) => void }) {
  return <TextAreaField label={label} value={JSON.stringify(value, null, 2)} onChange={onChange} />;
}

function ToggleField({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex min-h-11 items-center justify-between rounded-xl border border-white/10 bg-slate-950 px-3 text-sm text-slate-300">
      <span>{label}</span>
      <input type="checkbox" checked={value} onChange={event => onChange(event.target.checked)} />
    </label>
  );
}

function lines(value: string) {
  return value.split("\n").map(line => line.trim()).filter(Boolean);
}

function menuToText(items: MenuItem[]) {
  return items.filter(item => item.visible !== false).map(item => `${item.label}|${item.href}`).join("\n");
}

function textToMenu(value: string): MenuItem[] {
  return lines(value).map(line => {
    const [label, href] = line.split("|");
    return {
      label: (label || "").trim(),
      href: (href || "/").trim(),
      visible: true
    };
  }).filter(item => item.label && item.href);
}
