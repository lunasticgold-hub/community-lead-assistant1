"use client";

import { useEffect, useMemo, useRef, useState, type DragEvent, type ReactNode } from "react";
import {
  Accessibility,
  AlertTriangle,
  Archive,
  BarChart3,
  Bell,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Eye,
  EyeOff,
  FileText,
  Folder,
  Gauge,
  Globe2,
  GripVertical,
  History,
  ImageIcon,
  Layers,
  LayoutDashboard,
  Link2Off,
  Menu,
  Monitor,
  MoreHorizontal,
  Newspaper,
  Package,
  Palette,
  PenLine,
  Plug,
  Plus,
  Rocket,
  Save,
  Search,
  Settings2,
  Smartphone,
  Sparkles,
  Tablet,
  Trash2,
  Undo2,
  UploadCloud,
  UserCircle,
  Wand2
} from "lucide-react";
import { cn } from "@/components/ui";
import type { MenuItem, WebsiteEditorContent } from "@/lib/cms/website-editor-defaults";

type EnterpriseWebsiteContent = WebsiteEditorContent & {
  studio?: WebsiteStudio;
};

type StudioModule =
  | "dashboard"
  | "builder"
  | "media"
  | "navigation"
  | "design"
  | "components"
  | "seo"
  | "forms"
  | "blog"
  | "analytics"
  | "integrations"
  | "publishing"
  | "activity"
  | "settings";

type PageStatus = "draft" | "review" | "approved" | "published" | "scheduled" | "archived";
type ViewportMode = "desktop" | "tablet" | "mobile";

type StudioSection = {
  id: string;
  type: string;
  title: string;
  hidden: boolean;
  locked?: boolean;
  content: {
    eyebrow?: string;
    headline?: string;
    body?: string;
    ctaLabel?: string;
    ctaHref?: string;
    imageUrl?: string;
    videoUrl?: string;
    items?: string[];
  };
  settings: {
    layout: string;
    background: string;
    padding: string;
    animation: string;
  };
  updatedAt: string;
};

type StudioPage = {
  id: string;
  title: string;
  slug: string;
  parentId: string | null;
  status: PageStatus;
  hidden: boolean;
  scheduledAt: string;
  sections: StudioSection[];
  seo: {
    title: string;
    description: string;
    canonical: string;
    keywords: string[];
    noindex: boolean;
    ogImage: string;
    schema: string;
  };
  updatedAt: string;
  publishedAt: string;
};

type StudioMedia = {
  id: string;
  name: string;
  type: "image" | "video" | "pdf" | "zip" | "svg" | "icon";
  url: string;
  folder: string;
  tags: string[];
  alt: string;
  caption: string;
  sizeKb: number;
  usedOn: string[];
  createdAt: string;
};

type StudioComponent = {
  id: string;
  name: string;
  type: string;
  usedOn: string[];
  updatedAt: string;
};

type StudioForm = {
  id: string;
  name: string;
  type: "contact" | "newsletter" | "lead" | "popup" | "booking" | "application";
  status: "active" | "draft" | "archived";
  submissions: number;
  webhook: string;
  emailTo: string;
};

type StudioBlogPost = {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "scheduled" | "published";
  category: string;
  tags: string[];
  author: string;
  excerpt: string;
  readingTime: number;
  scheduledAt: string;
  updatedAt: string;
};

type WebsiteStudio = {
  pages: StudioPage[];
  media: StudioMedia[];
  components: StudioComponent[];
  forms: StudioForm[];
  blogPosts: StudioBlogPost[];
  designSystem: {
    colors: {
      primary: string;
      ink: string;
      surface: string;
      accent: string;
    };
    typography: {
      headingFont: string;
      bodyFont: string;
      baseSize: string;
      scale: string;
    };
    buttons: {
      radius: string;
      shadow: string;
      hover: string;
    };
    layout: {
      containerWidth: string;
      sectionSpacing: string;
      cardRadius: string;
    };
    theme: "light" | "dark" | "system";
    customCss: string;
    customJs: string;
  };
  analytics: {
    traffic: number;
    conversions: number;
    topPages: Array<{ path: string; views: number }>;
    events: number;
  };
  integrations: Array<{ name: string; connected: boolean; description: string }>;
  activity: Array<{ id: string; label: string; user: string; createdAt: string }>;
  versions: Array<{ id: string; label: string; createdAt: string; pageId: string; snapshot: StudioPage }>;
  settings: {
    autosave: boolean;
    globalSearchEnabled: boolean;
    maintenanceMode: boolean;
    publishingWorkflow: "simple" | "review";
  };
};

type EnterpriseWebsiteEditorProps = {
  initialContent: WebsiteEditorContent;
};

const modules: Array<{ id: StudioModule; label: string; icon: ReactNode }> = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
  { id: "builder", label: "Page Builder", icon: <Layers size={16} /> },
  { id: "media", label: "Media Library", icon: <ImageIcon size={16} /> },
  { id: "navigation", label: "Navigation", icon: <Menu size={16} /> },
  { id: "design", label: "Design System", icon: <Palette size={16} /> },
  { id: "components", label: "Components", icon: <Package size={16} /> },
  { id: "seo", label: "SEO Manager", icon: <Globe2 size={16} /> },
  { id: "forms", label: "Forms", icon: <FileText size={16} /> },
  { id: "blog", label: "Blog CMS", icon: <Newspaper size={16} /> },
  { id: "analytics", label: "Analytics", icon: <BarChart3 size={16} /> },
  { id: "integrations", label: "Integrations", icon: <Plug size={16} /> },
  { id: "publishing", label: "Publishing", icon: <Rocket size={16} /> },
  { id: "activity", label: "Activity Log", icon: <History size={16} /> },
  { id: "settings", label: "Settings", icon: <Settings2 size={16} /> }
];

const blockLibrary = [
  "Hero",
  "Cards",
  "Gallery",
  "FAQ",
  "Pricing",
  "Timeline",
  "Team",
  "Contact Form",
  "Map",
  "Testimonials",
  "Comparison Table",
  "Logos",
  "Video",
  "Call To Action",
  "Blog Grid",
  "Newsletter",
  "Image + Text",
  "Features",
  "Accordion",
  "Tabs",
  "Countdown",
  "Stats",
  "Portfolio",
  "Custom HTML",
  "Embed",
  "Code Block",
  "Buttons",
  "Forms",
  "Social Feed",
  "Popup",
  "Announcement Bar"
];

export function EnterpriseWebsiteEditor({ initialContent }: EnterpriseWebsiteEditorProps) {
  const initial = useMemo(() => ensureStudio(initialContent), [initialContent]);
  const [content, setContent] = useState<EnterpriseWebsiteContent>(initial);
  const [activeModule, setActiveModule] = useState<StudioModule>("dashboard");
  const [selectedPageId, setSelectedPageId] = useState(initial.studio?.pages[0]?.id || "");
  const [selectedSectionId, setSelectedSectionId] = useState(initial.studio?.pages[0]?.sections[0]?.id || "");
  const [viewport, setViewport] = useState<ViewportMode>("desktop");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("Saved");
  const [toast, setToast] = useState("");
  const [draggedSectionId, setDraggedSectionId] = useState("");
  const [mediaDraft, setMediaDraft] = useState({ name: "", url: "", folder: "General", alt: "" });
  const [commandOpen, setCommandOpen] = useState(false);
  const hasMounted = useRef(false);

  const studio = content.studio as WebsiteStudio;
  const selectedPage = studio.pages.find(page => page.id === selectedPageId) || studio.pages[0];
  const selectedSection = selectedPage?.sections.find(section => section.id === selectedSectionId) || selectedPage?.sections[0];
  const health = useMemo(() => computeHealth(studio), [studio]);
  const searchResults = useMemo(() => globalSearch(studio, search), [studio, search]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen(current => !current);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!studio.settings.autosave) return;
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    setSaveStatus("Unsaved changes");
    const timer = window.setTimeout(() => {
      void persist(content, "Autosaved");
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [content, studio.settings.autosave]);

  function updateStudio(updater: (studio: WebsiteStudio) => WebsiteStudio) {
    setContent(current => {
      const nextStudio = updater(current.studio as WebsiteStudio);
      return syncPublicContent({ ...current, studio: nextStudio });
    });
  }

  async function persist(snapshot = content, successMessage = "Saved and published") {
    setSaving(true);
    setSaveStatus("Saving...");
    const response = await fetch("/api/cms/website-editor", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ content: snapshot })
    });
    const json = await response.json().catch(() => ({}));
    setSaving(false);

    if (!response.ok || json.ok === false) {
      setSaveStatus("Save failed");
      showToast(String(json.error || "Could not save website edits."));
      return;
    }

    setSaveStatus(successMessage);
    showToast(successMessage);
  }

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }

  function selectPage(pageId: string) {
    const page = studio.pages.find(item => item.id === pageId);
    setSelectedPageId(pageId);
    setSelectedSectionId(page?.sections[0]?.id || "");
    setActiveModule("builder");
  }

  function createPage(parentId: string | null = null) {
    const page = createStudioPage("New Page", "/new-page", parentId);
    updateStudio(current => ({ ...current, pages: [...current.pages, page], activity: activity(current, `Created ${page.title}`) }));
    setSelectedPageId(page.id);
    setSelectedSectionId(page.sections[0]?.id || "");
    setActiveModule("builder");
  }

  function duplicatePage(pageId: string) {
    const page = studio.pages.find(item => item.id === pageId);
    if (!page) return;
    const copyPage = {
      ...page,
      id: uid("page"),
      title: `${page.title} Copy`,
      slug: `${page.slug.replace(/\/$/, "")}-copy`,
      status: "draft" as PageStatus,
      sections: page.sections.map(section => ({ ...section, id: uid("section") })),
      updatedAt: now()
    };
    updateStudio(current => ({ ...current, pages: [...current.pages, copyPage], activity: activity(current, `Duplicated ${page.title}`) }));
  }

  function deletePage(pageId: string) {
    const page = studio.pages.find(item => item.id === pageId);
    if (!page || page.slug === "/") return;
    updateStudio(current => {
      const pages = current.pages.filter(item => item.id !== pageId && item.parentId !== pageId);
      return { ...current, pages, activity: activity(current, `Deleted ${page.title}`) };
    });
    const fallback = studio.pages.find(item => item.id !== pageId);
    if (fallback) selectPage(fallback.id);
  }

  function updatePage(pageId: string, patch: Partial<StudioPage>) {
    updateStudio(current => ({
      ...current,
      pages: current.pages.map(page => page.id === pageId ? { ...page, ...patch, updatedAt: now() } : page),
      activity: activity(current, `Updated ${patch.title || selectedPage?.title || "page"}`)
    }));
  }

  function updatePageSeo(key: keyof StudioPage["seo"], value: string | boolean | string[]) {
    if (!selectedPage) return;
    updatePage(selectedPage.id, { seo: { ...selectedPage.seo, [key]: value } });
  }

  function addSection(type: string) {
    if (!selectedPage) return;
    const section = createSection(type);
    updateStudio(current => ({
      ...current,
      pages: current.pages.map(page => page.id === selectedPage.id ? { ...page, sections: [...page.sections, section], updatedAt: now() } : page),
      activity: activity(current, `Added ${section.title} to ${selectedPage.title}`)
    }));
    setSelectedSectionId(section.id);
    setActiveModule("builder");
  }

  function updateSection(sectionId: string, patch: Partial<StudioSection>) {
    if (!selectedPage) return;
    updateStudio(current => ({
      ...current,
      pages: current.pages.map(page => page.id === selectedPage.id ? {
        ...page,
        sections: page.sections.map(section => section.id === sectionId ? { ...section, ...patch, updatedAt: now() } : section),
        updatedAt: now()
      } : page)
    }));
  }

  function updateSectionContent(sectionId: string, key: keyof StudioSection["content"], value: string | string[]) {
    const section = selectedPage?.sections.find(item => item.id === sectionId);
    if (!section) return;
    updateSection(sectionId, { content: { ...section.content, [key]: value } });
  }

  function duplicateSection(sectionId: string) {
    if (!selectedPage) return;
    updateStudio(current => ({
      ...current,
      pages: current.pages.map(page => {
        if (page.id !== selectedPage.id) return page;
        const index = page.sections.findIndex(section => section.id === sectionId);
        const original = page.sections[index];
        if (!original) return page;
        const copySection = { ...original, id: uid("section"), title: `${original.title} Copy`, updatedAt: now() };
        const sections = [...page.sections];
        sections.splice(index + 1, 0, copySection);
        return { ...page, sections, updatedAt: now() };
      }),
      activity: activity(current, "Duplicated section")
    }));
  }

  function deleteSection(sectionId: string) {
    if (!selectedPage) return;
    updateStudio(current => ({
      ...current,
      pages: current.pages.map(page => page.id === selectedPage.id ? { ...page, sections: page.sections.filter(section => section.id !== sectionId), updatedAt: now() } : page),
      activity: activity(current, "Deleted section")
    }));
    setSelectedSectionId(selectedPage.sections.find(section => section.id !== sectionId)?.id || "");
  }

  function moveSection(sectionId: string, direction: -1 | 1) {
    if (!selectedPage) return;
    updateStudio(current => ({
      ...current,
      pages: current.pages.map(page => {
        if (page.id !== selectedPage.id) return page;
        const index = page.sections.findIndex(section => section.id === sectionId);
        const nextIndex = index + direction;
        if (index < 0 || nextIndex < 0 || nextIndex >= page.sections.length) return page;
        const sections = [...page.sections];
        const [section] = sections.splice(index, 1);
        sections.splice(nextIndex, 0, section);
        return { ...page, sections, updatedAt: now() };
      })
    }));
  }

  function dropSection(targetSectionId: string) {
    if (!selectedPage || !draggedSectionId || draggedSectionId === targetSectionId) return;
    updateStudio(current => ({
      ...current,
      pages: current.pages.map(page => {
        if (page.id !== selectedPage.id) return page;
        const sections = [...page.sections];
        const from = sections.findIndex(section => section.id === draggedSectionId);
        const to = sections.findIndex(section => section.id === targetSectionId);
        if (from < 0 || to < 0) return page;
        const [moved] = sections.splice(from, 1);
        sections.splice(to, 0, moved);
        return { ...page, sections, updatedAt: now() };
      })
    }));
    setDraggedSectionId("");
  }

  function publishPage(pageId: string) {
    updateStudio(current => ({
      ...current,
      pages: current.pages.map(page => page.id === pageId ? { ...page, status: "published", publishedAt: now(), updatedAt: now() } : page),
      versions: addVersion(current, pageId, "Published page"),
      activity: activity(current, "Published page")
    }));
  }

  function addMedia() {
    if (!mediaDraft.name || !mediaDraft.url) return;
    const asset: StudioMedia = {
      id: uid("media"),
      name: mediaDraft.name,
      url: mediaDraft.url,
      folder: mediaDraft.folder || "General",
      type: mediaType(mediaDraft.url),
      tags: [],
      alt: mediaDraft.alt,
      caption: "",
      sizeKb: 0,
      usedOn: selectedPage ? [selectedPage.title] : [],
      createdAt: now()
    };
    updateStudio(current => ({ ...current, media: [asset, ...current.media], activity: activity(current, `Uploaded ${asset.name}`) }));
    setMediaDraft({ name: "", url: "", folder: "General", alt: "" });
  }

  function updateDesign(path: "colors" | "typography" | "buttons" | "layout", key: string, value: string) {
    updateStudio(current => ({
      ...current,
      designSystem: {
        ...current.designSystem,
        [path]: {
          ...current.designSystem[path],
          [key]: value
        }
      }
    }));
  }

  function runAiAction(actionName: string) {
    if (!selectedSection) return;
    const copy = aiCopy(actionName, selectedSection, selectedPage);
    updateSectionContent(selectedSection.id, "body", copy);
    showToast(`${actionName} added to selected section`);
  }

  const canvasWidth = viewport === "desktop" ? "max-w-5xl" : viewport === "tablet" ? "max-w-2xl" : "max-w-sm";

  return (
    <div className="min-h-[calc(100vh-9rem)] overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#060b18] text-slate-100 shadow-2xl">
      <div className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/[0.03] px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarCollapsed(value => !value)}
            className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/10"
            aria-label="Toggle editor sidebar"
          >
            {sidebarCollapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
          </button>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span>CMS</span>
              <span>/</span>
              <span>{moduleLabel(activeModule)}</span>
              {selectedPage ? <><span>/</span><span className="text-slate-200">{selectedPage.title}</span></> : null}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-sm font-semibold">Website Studio</span>
              <StatusPill status={selectedPage?.status || "draft"} />
              <span className="text-xs text-slate-500">Last edited {formatTime(selectedPage?.updatedAt)}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-end gap-2">
          <div className="relative hidden min-w-[220px] max-w-md flex-1 lg:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              value={search}
              onChange={event => setSearch(event.target.value)}
              onFocus={() => setCommandOpen(true)}
              placeholder="Search pages, sections, media, SEO..."
              className="h-10 w-full rounded-xl border border-white/10 bg-slate-950 pl-9 pr-3 text-sm outline-none focus:border-blue-400"
            />
          </div>
          <button className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300"><Bell size={16} /></button>
          <button className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300"><UserCircle size={17} /></button>
          <button
            type="button"
            onClick={() => void persist(content, "Saved draft")}
            disabled={saving}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3 text-sm font-semibold hover:bg-white/10 disabled:opacity-60"
          >
            <Save size={15} />
            {saving ? "Saving" : saveStatus}
          </button>
          <button
            type="button"
            onClick={() => selectedPage && publishPage(selectedPage.id)}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-500 px-3 text-sm font-semibold text-white hover:bg-blue-400"
          >
            <Rocket size={15} />
            Publish
          </button>
        </div>
      </div>

      <div className={cn("grid min-h-[calc(100vh-13rem)]", sidebarCollapsed ? "lg:grid-cols-[76px_1fr_340px]" : "lg:grid-cols-[292px_1fr_340px]")}>
        <aside className="border-r border-white/10 bg-slate-950/70">
          <div className="space-y-1 p-3">
            {modules.map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveModule(item.id)}
                className={cn(
                  "flex h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-sm transition",
                  activeModule === item.id ? "bg-blue-500 text-white" : "text-slate-300 hover:bg-white/10",
                  sidebarCollapsed && "justify-center px-0"
                )}
                title={item.label}
              >
                {item.icon}
                {!sidebarCollapsed ? <span>{item.label}</span> : null}
              </button>
            ))}
          </div>

          {!sidebarCollapsed ? (
            <div className="border-t border-white/10 p-3">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-200">Website Explorer</div>
                  <div className="text-xs text-slate-500">{studio.pages.length} pages</div>
                </div>
                <button onClick={() => createPage()} className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 hover:bg-white/15" aria-label="Create page">
                  <Plus size={15} />
                </button>
              </div>
              <PageTree
                pages={studio.pages}
                activeId={selectedPageId}
                onSelect={selectPage}
                onDuplicate={duplicatePage}
                onDelete={deletePage}
                onCreateChild={createPage}
              />
            </div>
          ) : null}
        </aside>

        <main className="min-w-0 bg-[radial-gradient(circle_at_top,#13203d_0%,#07101f_34%,#050816_100%)] p-4">
          {commandOpen && search ? (
            <CommandPalette results={searchResults} onClose={() => setCommandOpen(false)} onSelectPage={selectPage} />
          ) : null}

          {activeModule === "dashboard" ? <DashboardView studio={studio} health={health} onModule={setActiveModule} /> : null}
          {activeModule === "builder" ? (
            <BuilderView
              page={selectedPage}
              selectedSectionId={selectedSectionId}
              canvasWidth={canvasWidth}
              viewport={viewport}
              onViewport={setViewport}
              onSelectSection={setSelectedSectionId}
              onSectionContent={updateSectionContent}
              onDuplicateSection={duplicateSection}
              onDeleteSection={deleteSection}
              onMoveSection={moveSection}
              onDragStart={setDraggedSectionId}
              onDrop={dropSection}
              onAddSection={addSection}
            />
          ) : null}
          {activeModule === "media" ? <MediaView studio={studio} draft={mediaDraft} setDraft={setMediaDraft} onAdd={addMedia} onUpdate={updateStudio} /> : null}
          {activeModule === "navigation" ? <NavigationView content={content} setContent={setContent} /> : null}
          {activeModule === "design" ? <DesignSystemView studio={studio} onDesign={updateDesign} onUpdate={updateStudio} /> : null}
          {activeModule === "components" ? <ComponentsView studio={studio} onUpdate={updateStudio} /> : null}
          {activeModule === "seo" ? <SeoView page={selectedPage} health={health} onSeo={updatePageSeo} /> : null}
          {activeModule === "forms" ? <FormsView studio={studio} onUpdate={updateStudio} /> : null}
          {activeModule === "blog" ? <BlogView studio={studio} onUpdate={updateStudio} /> : null}
          {activeModule === "analytics" ? <AnalyticsView studio={studio} /> : null}
          {activeModule === "integrations" ? <IntegrationsView studio={studio} onUpdate={updateStudio} /> : null}
          {activeModule === "publishing" ? <PublishingView studio={studio} onPublish={publishPage} onRestore={(page) => updatePage(page.id, page)} /> : null}
          {activeModule === "activity" ? <ActivityView studio={studio} /> : null}
          {activeModule === "settings" ? <SettingsView studio={studio} onUpdate={updateStudio} /> : null}
        </main>

        <Inspector
          page={selectedPage}
          section={selectedSection}
          content={content}
          health={health}
          onPage={updatePage}
          onSection={updateSection}
          onSectionContent={updateSectionContent}
          onAddSection={addSection}
          onAi={runAiAction}
        />
      </div>

      {toast ? (
        <div className="fixed bottom-5 right-5 z-50 rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white shadow-2xl">
          {toast}
        </div>
      ) : null}
    </div>
  );
}

function DashboardView({ studio, health, onModule }: { studio: WebsiteStudio; health: StudioHealth; onModule: (module: StudioModule) => void }) {
  const published = studio.pages.filter(page => page.status === "published").length;
  const drafts = studio.pages.filter(page => page.status === "draft").length;
  const storage = studio.media.reduce((sum, asset) => sum + asset.sizeKb, 0);
  const cards = [
    ["Website Status", health.status, <Globe2 key="status" size={18} />],
    ["Pages", studio.pages.length, <FileText key="pages" size={18} />],
    ["Published Pages", published, <CheckCircle2 key="published" size={18} />],
    ["Draft Pages", drafts, <PenLine key="drafts" size={18} />],
    ["Forms", studio.forms.length, <FileText key="forms" size={18} />],
    ["Blogs", studio.blogPosts.length, <Newspaper key="blogs" size={18} />],
    ["Media", studio.media.length, <ImageIcon key="media" size={18} />],
    ["SEO Score", `${health.seoScore}%`, <Gauge key="seo" size={18} />],
    ["Performance", `${health.performanceScore}%`, <Gauge key="perf" size={18} />],
    ["Accessibility", `${health.accessibilityScore}%`, <Accessibility key="a11y" size={18} />],
    ["Broken Links", health.brokenLinks, <Link2Off key="links" size={18} />],
    ["Storage", `${storage} KB`, <Folder key="storage" size={18} />]
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-4">
        {cards.map(([label, value, icon]) => (
          <Panel key={String(label)} className="min-h-28">
            <div className="flex items-center justify-between gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500/15 text-blue-200">{icon}</div>
              <MoreHorizontal size={15} className="text-slate-500" />
            </div>
            <div className="mt-4 text-2xl font-semibold">{value}</div>
            <div className="mt-1 text-xs text-slate-400">{label}</div>
          </Panel>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
        <Panel>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Analytics Snapshot</h2>
              <p className="mt-1 text-sm text-slate-400">Traffic, conversions, and top pages from the CMS view.</p>
            </div>
            <button onClick={() => onModule("analytics")} className="rounded-xl border border-white/10 px-3 py-2 text-sm hover:bg-white/10">Open analytics</button>
          </div>
          <div className="mt-6 flex h-52 items-end gap-3">
            {[42, 58, 36, 76, 61, 82, 92, 68, 73, 88].map((height, index) => (
              <div key={index} className="flex-1 rounded-t-xl bg-gradient-to-t from-blue-600 to-emerald-400" style={{ height: `${height}%` }} />
            ))}
          </div>
        </Panel>
        <Panel>
          <h2 className="text-lg font-semibold">Website Health</h2>
          <div className="mt-5 space-y-4">
            <HealthRow label="SEO" value={health.seoScore} />
            <HealthRow label="Performance" value={health.performanceScore} />
            <HealthRow label="Accessibility" value={health.accessibilityScore} />
            <HealthRow label="Content readiness" value={health.contentScore} />
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Panel className="xl:col-span-2">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          <div className="mt-4 space-y-3">
            {studio.activity.slice(0, 6).map(item => (
              <div key={item.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <div>
                  <div className="text-sm font-medium">{item.label}</div>
                  <div className="mt-1 text-xs text-slate-500">{item.user}</div>
                </div>
                <span className="text-xs text-slate-500">{formatTime(item.createdAt)}</span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel>
          <h2 className="text-lg font-semibold">Top Pages</h2>
          <div className="mt-4 space-y-3">
            {studio.analytics.topPages.map(page => (
              <div key={page.path}>
                <div className="mb-1 flex justify-between text-sm"><span>{page.path}</span><span>{page.views}</span></div>
                <div className="h-2 rounded-full bg-white/10"><div className="h-2 rounded-full bg-blue-500" style={{ width: `${Math.min(100, page.views / 12)}%` }} /></div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function BuilderView({
  page,
  selectedSectionId,
  canvasWidth,
  viewport,
  onViewport,
  onSelectSection,
  onSectionContent,
  onDuplicateSection,
  onDeleteSection,
  onMoveSection,
  onDragStart,
  onDrop,
  onAddSection
}: {
  page: StudioPage | undefined;
  selectedSectionId: string;
  canvasWidth: string;
  viewport: ViewportMode;
  onViewport: (viewport: ViewportMode) => void;
  onSelectSection: (id: string) => void;
  onSectionContent: (sectionId: string, key: keyof StudioSection["content"], value: string | string[]) => void;
  onDuplicateSection: (sectionId: string) => void;
  onDeleteSection: (sectionId: string) => void;
  onMoveSection: (sectionId: string, direction: -1 | 1) => void;
  onDragStart: (sectionId: string) => void;
  onDrop: (sectionId: string) => void;
  onAddSection: (type: string) => void;
}) {
  if (!page) return <EmptyState title="No page selected" body="Create or select a page from the Website Explorer." />;

  return (
    <div className="space-y-4">
      <Panel className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-200">Visual Builder</div>
          <h1 className="mt-1 text-xl font-semibold">{page.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          {[
            ["desktop", <Monitor key="desktop" size={15} />],
            ["tablet", <Tablet key="tablet" size={15} />],
            ["mobile", <Smartphone key="mobile" size={15} />]
          ].map(([mode, icon]) => (
            <button
              key={String(mode)}
              type="button"
              onClick={() => onViewport(mode as ViewportMode)}
              className={cn("grid h-9 w-9 place-items-center rounded-xl border border-white/10", viewport === mode ? "bg-blue-500 text-white" : "bg-white/[0.04] text-slate-300 hover:bg-white/10")}
            >
              {icon}
            </button>
          ))}
          <button className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/10 px-3 text-sm hover:bg-white/10"><Eye size={15} /> Preview</button>
        </div>
      </Panel>

      <div className={cn("mx-auto rounded-[1.5rem] border border-white/10 bg-white p-4 text-slate-950 shadow-2xl transition-all", canvasWidth)}>
        <div className="mb-4 flex items-center justify-between rounded-xl bg-slate-100 px-4 py-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{page.slug}</div>
            <div className="font-semibold">{page.title}</div>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{page.status}</span>
        </div>
        <div className="space-y-3">
          {page.sections.map((section, index) => (
            <VisualSection
              key={section.id}
              section={section}
              index={index}
              selected={selectedSectionId === section.id}
              onSelect={() => onSelectSection(section.id)}
              onContent={onSectionContent}
              onDuplicate={() => onDuplicateSection(section.id)}
              onDelete={() => onDeleteSection(section.id)}
              onMove={direction => onMoveSection(section.id, direction)}
              onDragStart={() => onDragStart(section.id)}
              onDrop={() => onDrop(section.id)}
            />
          ))}
          <button
            type="button"
            onClick={() => onAddSection("Call To Action")}
            className="flex min-h-20 w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 text-sm font-semibold text-slate-500 hover:border-blue-400 hover:text-blue-600"
          >
            <Plus size={16} />
            Add section
          </button>
        </div>
      </div>
    </div>
  );
}

function VisualSection({
  section,
  index,
  selected,
  onSelect,
  onContent,
  onDuplicate,
  onDelete,
  onMove,
  onDragStart,
  onDrop
}: {
  section: StudioSection;
  index: number;
  selected: boolean;
  onSelect: () => void;
  onContent: (sectionId: string, key: keyof StudioSection["content"], value: string | string[]) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMove: (direction: -1 | 1) => void;
  onDragStart: () => void;
  onDrop: () => void;
}) {
  return (
    <section
      draggable
      onDragStart={onDragStart}
      onDragOver={(event: DragEvent<HTMLElement>) => event.preventDefault()}
      onDrop={onDrop}
      onClick={onSelect}
      className={cn(
        "group relative rounded-2xl border p-5 transition",
        selected ? "border-blue-500 ring-4 ring-blue-100" : "border-slate-200 hover:border-slate-300",
        section.hidden && "opacity-45"
      )}
      style={{ background: section.settings.background || "#ffffff" }}
    >
      <div className="absolute right-3 top-3 hidden items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-lg group-hover:flex">
        <button className="grid h-7 w-7 place-items-center rounded-lg hover:bg-slate-100" onClick={event => { event.stopPropagation(); onMove(-1); }}><ChevronLeft size={14} /></button>
        <button className="grid h-7 w-7 place-items-center rounded-lg hover:bg-slate-100" onClick={event => { event.stopPropagation(); onMove(1); }}><ChevronRight size={14} /></button>
        <button className="grid h-7 w-7 place-items-center rounded-lg hover:bg-slate-100" onClick={event => { event.stopPropagation(); onDuplicate(); }}><Copy size={14} /></button>
        <button className="grid h-7 w-7 place-items-center rounded-lg text-red-500 hover:bg-red-50" onClick={event => { event.stopPropagation(); onDelete(); }}><Trash2 size={14} /></button>
      </div>
      <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
        <GripVertical size={14} />
        Section {index + 1} / {section.type}
      </div>
      {section.content.eyebrow ? (
        <div
          contentEditable
          suppressContentEditableWarning
          onBlur={event => onContent(section.id, "eyebrow", event.currentTarget.innerText)}
          className="mb-2 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 outline-none"
        >
          {section.content.eyebrow}
        </div>
      ) : null}
      <h2
        contentEditable
        suppressContentEditableWarning
        onBlur={event => onContent(section.id, "headline", event.currentTarget.innerText)}
        className="max-w-3xl text-3xl font-semibold tracking-tight outline-none"
      >
        {section.content.headline || section.title}
      </h2>
      <p
        contentEditable
        suppressContentEditableWarning
        onBlur={event => onContent(section.id, "body", event.currentTarget.innerText)}
        className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 outline-none"
      >
        {section.content.body || "Click to edit this section copy."}
      </p>
      {section.content.items?.length ? (
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {section.content.items.slice(0, 6).map(item => (
            <div key={item} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium">{item}</div>
          ))}
        </div>
      ) : null}
      {section.content.ctaLabel ? (
        <a href={section.content.ctaHref || "#"} className="mt-5 inline-flex rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
          {section.content.ctaLabel}
        </a>
      ) : null}
    </section>
  );
}

function Inspector({
  page,
  section,
  content,
  health,
  onPage,
  onSection,
  onSectionContent,
  onAddSection,
  onAi
}: {
  page: StudioPage | undefined;
  section: StudioSection | undefined;
  content: EnterpriseWebsiteContent;
  health: StudioHealth;
  onPage: (pageId: string, patch: Partial<StudioPage>) => void;
  onSection: (sectionId: string, patch: Partial<StudioSection>) => void;
  onSectionContent: (sectionId: string, key: keyof StudioSection["content"], value: string | string[]) => void;
  onAddSection: (type: string) => void;
  onAi: (actionName: string) => void;
}) {
  return (
    <aside className="overflow-y-auto border-l border-white/10 bg-slate-950/86 p-4">
      <div className="space-y-4">
        <Panel>
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold">Inspector</h2>
            <StatusPill status={page?.status || "draft"} />
          </div>
          {page ? (
            <div className="mt-4 space-y-3">
              <Field label="Page title">
                <input value={page.title} onChange={event => onPage(page.id, { title: event.target.value })} className="studio-input" />
              </Field>
              <Field label="Slug">
                <input value={page.slug} onChange={event => onPage(page.id, { slug: event.target.value })} className="studio-input" />
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => onPage(page.id, { hidden: !page.hidden })} className="studio-button">{page.hidden ? <Eye size={14} /> : <EyeOff size={14} />} {page.hidden ? "Show" : "Hide"}</button>
                <button onClick={() => onPage(page.id, { status: "archived" })} className="studio-button"><Archive size={14} /> Archive</button>
              </div>
            </div>
          ) : <p className="mt-3 text-sm text-slate-400">Select a page to edit settings.</p>}
        </Panel>

        {section ? (
          <Panel>
            <h2 className="font-semibold">Selected Section</h2>
            <div className="mt-4 space-y-3">
              <Field label="Section name"><input value={section.title} onChange={event => onSection(section.id, { title: event.target.value })} className="studio-input" /></Field>
              <Field label="Layout"><input value={section.settings.layout} onChange={event => onSection(section.id, { settings: { ...section.settings, layout: event.target.value } })} className="studio-input" /></Field>
              <Field label="Background"><input value={section.settings.background} onChange={event => onSection(section.id, { settings: { ...section.settings, background: event.target.value } })} className="studio-input" /></Field>
              <Field label="CTA label"><input value={section.content.ctaLabel || ""} onChange={event => onSectionContent(section.id, "ctaLabel", event.target.value)} className="studio-input" /></Field>
              <Field label="CTA link"><input value={section.content.ctaHref || ""} onChange={event => onSectionContent(section.id, "ctaHref", event.target.value)} className="studio-input" /></Field>
              <Field label="Image or video URL"><input value={section.content.imageUrl || section.content.videoUrl || ""} onChange={event => onSectionContent(section.id, "imageUrl", event.target.value)} className="studio-input" /></Field>
              <Field label="Items, one per line">
                <textarea value={(section.content.items || []).join("\n")} onChange={event => onSectionContent(section.id, "items", lines(event.target.value))} className="studio-textarea" rows={4} />
              </Field>
              <button onClick={() => onSection(section.id, { hidden: !section.hidden })} className="studio-button w-full">{section.hidden ? <Eye size={14} /> : <EyeOff size={14} />} {section.hidden ? "Show section" : "Hide section"}</button>
            </div>
          </Panel>
        ) : null}

        <Panel>
          <h2 className="font-semibold">Block Library</h2>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {blockLibrary.slice(0, 16).map(block => (
              <button key={block} onClick={() => onAddSection(block)} className="rounded-xl border border-white/10 bg-white/[0.04] px-2 py-2 text-left text-xs hover:bg-white/10">
                {block}
              </button>
            ))}
          </div>
        </Panel>

        <Panel>
          <div className="flex items-center gap-2">
            <Sparkles className="text-blue-300" size={16} />
            <h2 className="font-semibold">AI Assistant</h2>
          </div>
          <div className="mt-3 grid gap-2">
            {["Rewrite Copy", "Improve SEO", "Generate FAQ", "Generate CTA", "Suggest CRO"].map(action => (
              <button key={action} onClick={() => onAi(action)} className="studio-button justify-start"><Wand2 size={14} /> {action}</button>
            ))}
          </div>
        </Panel>

        <Panel>
          <h2 className="font-semibold">Live Quality</h2>
          <div className="mt-4 space-y-3">
            <HealthRow label="SEO" value={health.seoScore} />
            <HealthRow label="Accessibility" value={health.accessibilityScore} />
            <HealthRow label="Performance" value={health.performanceScore} />
          </div>
          <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-slate-400">
            Brand: {content.branding.companyName}
          </div>
        </Panel>
      </div>
    </aside>
  );
}

function MediaView({ studio, draft, setDraft, onAdd, onUpdate }: { studio: WebsiteStudio; draft: { name: string; url: string; folder: string; alt: string }; setDraft: (value: { name: string; url: string; folder: string; alt: string }) => void; onAdd: () => void; onUpdate: (updater: (studio: WebsiteStudio) => WebsiteStudio) => void }) {
  const folders = Array.from(new Set(studio.media.map(asset => asset.folder)));
  return (
    <div className="space-y-4">
      <Panel>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-200">Media Library</div>
            <h1 className="mt-1 text-xl font-semibold">Assets, folders, alt text, and usage</h1>
          </div>
          <div className="grid gap-2 sm:grid-cols-4">
            <input value={draft.name} onChange={event => setDraft({ ...draft, name: event.target.value })} placeholder="Name" className="studio-input" />
            <input value={draft.url} onChange={event => setDraft({ ...draft, url: event.target.value })} placeholder="URL" className="studio-input" />
            <input value={draft.alt} onChange={event => setDraft({ ...draft, alt: event.target.value })} placeholder="Alt text" className="studio-input" />
            <button onClick={onAdd} className="studio-button bg-blue-500 text-white hover:bg-blue-400"><UploadCloud size={14} /> Add asset</button>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {folders.map(folder => <span key={folder} className="rounded-full bg-white/10 px-3 py-1 text-xs">{folder}</span>)}
        </div>
      </Panel>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {studio.media.map(asset => (
          <Panel key={asset.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/10 text-blue-200"><ImageIcon size={20} /></div>
              <button onClick={() => onUpdate(current => ({ ...current, media: current.media.filter(item => item.id !== asset.id) }))} className="text-red-300"><Trash2 size={16} /></button>
            </div>
            <h3 className="mt-4 font-semibold">{asset.name}</h3>
            <p className="mt-1 truncate text-xs text-slate-500">{asset.url}</p>
            <div className="mt-3 grid gap-2">
              <input value={asset.alt} onChange={event => onUpdate(current => ({ ...current, media: current.media.map(item => item.id === asset.id ? { ...item, alt: event.target.value } : item) }))} className="studio-input" />
              <div className="text-xs text-slate-400">{asset.type} / {asset.folder} / used on {asset.usedOn.join(", ") || "none"}</div>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}

function NavigationView({ content, setContent }: { content: EnterpriseWebsiteContent; setContent: (updater: (value: EnterpriseWebsiteContent) => EnterpriseWebsiteContent) => void }) {
  function updateNavigation(key: keyof WebsiteEditorContent["navigation"], value: WebsiteEditorContent["navigation"][keyof WebsiteEditorContent["navigation"]]) {
    setContent(current => syncPublicContent({ ...current, navigation: { ...current.navigation, [key]: value } }));
  }

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Panel>
        <h1 className="text-xl font-semibold">Header Navigation</h1>
        <MenuEditor items={content.navigation.headerMenu} onChange={items => updateNavigation("headerMenu", items)} />
      </Panel>
      <Panel>
        <h1 className="text-xl font-semibold">Footer Navigation</h1>
        <MenuEditor items={content.navigation.footerMenu} onChange={items => updateNavigation("footerMenu", items)} />
      </Panel>
      <Panel className="xl:col-span-2">
        <h2 className="font-semibold">Menu Settings</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <Field label="CTA label"><input className="studio-input" value={content.navigation.ctaLabel} onChange={event => updateNavigation("ctaLabel", event.target.value)} /></Field>
          <Field label="CTA link"><input className="studio-input" value={content.navigation.ctaHref} onChange={event => updateNavigation("ctaHref", event.target.value)} /></Field>
          {(["stickyHeader", "megaMenuEnabled", "mobileMenuEnabled", "breadcrumbsEnabled"] as const).map(key => (
            <label key={key} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm">
              {labelize(key)}
              <input type="checkbox" checked={Boolean(content.navigation[key])} onChange={event => updateNavigation(key, event.target.checked)} />
            </label>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function DesignSystemView({ studio, onDesign, onUpdate }: { studio: WebsiteStudio; onDesign: (path: "colors" | "typography" | "buttons" | "layout", key: string, value: string) => void; onUpdate: (updater: (studio: WebsiteStudio) => WebsiteStudio) => void }) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Panel>
        <h1 className="text-xl font-semibold">Brand Colors</h1>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {Object.entries(studio.designSystem.colors).map(([key, value]) => (
            <Field key={key} label={labelize(key)}>
              <div className="flex gap-2">
                <input type="color" value={value} onChange={event => onDesign("colors", key, event.target.value)} className="h-10 w-12 rounded-lg border border-white/10 bg-transparent" />
                <input value={value} onChange={event => onDesign("colors", key, event.target.value)} className="studio-input" />
              </div>
            </Field>
          ))}
        </div>
      </Panel>
      <Panel>
        <h1 className="text-xl font-semibold">Typography</h1>
        <div className="mt-4 grid gap-3">
          {Object.entries(studio.designSystem.typography).map(([key, value]) => (
            <Field key={key} label={labelize(key)}><input value={value} onChange={event => onDesign("typography", key, event.target.value)} className="studio-input" /></Field>
          ))}
        </div>
      </Panel>
      <Panel>
        <h1 className="text-xl font-semibold">Buttons, Cards, Spacing</h1>
        <div className="mt-4 grid gap-3">
          {Object.entries(studio.designSystem.buttons).map(([key, value]) => (
            <Field key={key} label={labelize(key)}><input value={value} onChange={event => onDesign("buttons", key, event.target.value)} className="studio-input" /></Field>
          ))}
          {Object.entries(studio.designSystem.layout).map(([key, value]) => (
            <Field key={key} label={labelize(key)}><input value={value} onChange={event => onDesign("layout", key, event.target.value)} className="studio-input" /></Field>
          ))}
        </div>
      </Panel>
      <Panel>
        <h1 className="text-xl font-semibold">Theme & Developer Settings</h1>
        <div className="mt-4 space-y-3">
          <select value={studio.designSystem.theme} onChange={event => onUpdate(current => ({ ...current, designSystem: { ...current.designSystem, theme: event.target.value as WebsiteStudio["designSystem"]["theme"] } }))} className="studio-input">
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
          <Field label="Custom CSS"><textarea value={studio.designSystem.customCss} onChange={event => onUpdate(current => ({ ...current, designSystem: { ...current.designSystem, customCss: event.target.value } }))} className="studio-textarea" rows={5} /></Field>
          <Field label="Custom JS"><textarea value={studio.designSystem.customJs} onChange={event => onUpdate(current => ({ ...current, designSystem: { ...current.designSystem, customJs: event.target.value } }))} className="studio-textarea" rows={5} /></Field>
        </div>
      </Panel>
    </div>
  );
}

function ComponentsView({ studio, onUpdate }: { studio: WebsiteStudio; onUpdate: (updater: (studio: WebsiteStudio) => WebsiteStudio) => void }) {
  return (
    <div className="space-y-4">
      <Panel className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Reusable Components</h1>
          <p className="mt-1 text-sm text-slate-400">Navbar, footer, CTAs, cards, testimonials, forms, and pricing blocks.</p>
        </div>
        <button onClick={() => onUpdate(current => ({ ...current, components: [{ id: uid("component"), name: "New Component", type: "CTA", usedOn: [], updatedAt: now() }, ...current.components] }))} className="studio-button bg-blue-500 text-white"><Plus size={14} /> Component</button>
      </Panel>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {studio.components.map(component => (
          <Panel key={component.id}>
            <Package className="text-blue-300" size={20} />
            <input value={component.name} onChange={event => onUpdate(current => ({ ...current, components: current.components.map(item => item.id === component.id ? { ...item, name: event.target.value, updatedAt: now() } : item) }))} className="studio-input mt-4" />
            <div className="mt-2 text-xs text-slate-400">{component.type} / used on {component.usedOn.join(", ") || "no pages yet"}</div>
          </Panel>
        ))}
      </div>
    </div>
  );
}

function SeoView({ page, health, onSeo }: { page: StudioPage | undefined; health: StudioHealth; onSeo: (key: keyof StudioPage["seo"], value: string | boolean | string[]) => void }) {
  if (!page) return <EmptyState title="No page selected" body="Select a page to manage SEO." />;
  return (
    <div className="grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
      <Panel>
        <h1 className="text-xl font-semibold">Per Page SEO</h1>
        <div className="mt-4 grid gap-3">
          <Field label="Meta title"><input className="studio-input" value={page.seo.title} onChange={event => onSeo("title", event.target.value)} /></Field>
          <Field label="Meta description"><textarea className="studio-textarea" value={page.seo.description} onChange={event => onSeo("description", event.target.value)} rows={4} /></Field>
          <Field label="Canonical"><input className="studio-input" value={page.seo.canonical} onChange={event => onSeo("canonical", event.target.value)} /></Field>
          <Field label="Keywords"><textarea className="studio-textarea" value={page.seo.keywords.join("\n")} onChange={event => onSeo("keywords", lines(event.target.value))} rows={4} /></Field>
          <Field label="Open Graph image"><input className="studio-input" value={page.seo.ogImage} onChange={event => onSeo("ogImage", event.target.value)} /></Field>
          <label className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm">
            Noindex
            <input type="checkbox" checked={page.seo.noindex} onChange={event => onSeo("noindex", event.target.checked)} />
          </label>
        </div>
      </Panel>
      <div className="space-y-4">
        <Panel>
          <h2 className="font-semibold">Live SEO Score</h2>
          <div className="mt-4 text-5xl font-semibold text-emerald-300">{health.seoScore}%</div>
          <div className="mt-4 rounded-xl bg-white p-4 text-slate-950">
            <div className="text-lg text-blue-700">{page.seo.title || page.title}</div>
            <div className="mt-1 text-sm text-emerald-700">communityleadassistant.com{page.slug}</div>
            <p className="mt-2 text-sm text-slate-600">{page.seo.description || "Add a search description for this page."}</p>
          </div>
        </Panel>
        <Panel>
          <h2 className="font-semibold">SEO Actions</h2>
          <div className="mt-3 grid gap-2">
            {["Generate meta tags", "Find missing alt text", "Create schema", "Preview Twitter card", "Regenerate sitemap"].map(item => (
              <button key={item} className="studio-button justify-start"><Sparkles size={14} /> {item}</button>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function FormsView({ studio, onUpdate }: { studio: WebsiteStudio; onUpdate: (updater: (studio: WebsiteStudio) => WebsiteStudio) => void }) {
  return (
    <div className="space-y-4">
      <Panel className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Forms</h1>
          <p className="mt-1 text-sm text-slate-400">Contact, newsletter, lead, popup, application, and booking forms.</p>
        </div>
        <button onClick={() => onUpdate(current => ({ ...current, forms: [{ id: uid("form"), name: "New Form", type: "lead", status: "draft", submissions: 0, webhook: "", emailTo: "" }, ...current.forms] }))} className="studio-button bg-blue-500 text-white"><Plus size={14} /> Form</button>
      </Panel>
      <DataTable
        columns={["Name", "Type", "Status", "Submissions", "Webhook"]}
        rows={studio.forms.map(form => [form.name, form.type, form.status, String(form.submissions), form.webhook || "-"])}
      />
    </div>
  );
}

function BlogView({ studio, onUpdate }: { studio: WebsiteStudio; onUpdate: (updater: (studio: WebsiteStudio) => WebsiteStudio) => void }) {
  return (
    <div className="space-y-4">
      <Panel className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Blog CMS</h1>
          <p className="mt-1 text-sm text-slate-400">Draft, schedule, publish, tag, and optimize articles.</p>
        </div>
        <button onClick={() => onUpdate(current => ({ ...current, blogPosts: [{ id: uid("post"), title: "Untitled Article", slug: "untitled-article", status: "draft", category: "Growth", tags: [], author: "Community Lead Assistant", excerpt: "", readingTime: 4, scheduledAt: "", updatedAt: now() }, ...current.blogPosts] }))} className="studio-button bg-blue-500 text-white"><Plus size={14} /> Blog</button>
      </Panel>
      <div className="grid gap-4">
        {studio.blogPosts.map(post => (
          <Panel key={post.id}>
            <div className="grid gap-3 md:grid-cols-[1fr_180px_140px]">
              <input value={post.title} onChange={event => onUpdate(current => ({ ...current, blogPosts: current.blogPosts.map(item => item.id === post.id ? { ...item, title: event.target.value, updatedAt: now() } : item) }))} className="studio-input" />
              <select value={post.status} onChange={event => onUpdate(current => ({ ...current, blogPosts: current.blogPosts.map(item => item.id === post.id ? { ...item, status: event.target.value as StudioBlogPost["status"], updatedAt: now() } : item) }))} className="studio-input">
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Published</option>
              </select>
              <div className="rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-400">{post.readingTime} min read</div>
            </div>
            <textarea value={post.excerpt} onChange={event => onUpdate(current => ({ ...current, blogPosts: current.blogPosts.map(item => item.id === post.id ? { ...item, excerpt: event.target.value, updatedAt: now() } : item) }))} className="studio-textarea mt-3" rows={3} />
          </Panel>
        ))}
      </div>
    </div>
  );
}

function AnalyticsView({ studio }: { studio: WebsiteStudio }) {
  return (
    <div className="grid gap-4 xl:grid-cols-[.8fr_1.2fr]">
      <Panel>
        <h1 className="text-xl font-semibold">Analytics Overview</h1>
        <div className="mt-5 grid gap-3">
          <Metric label="Traffic" value={studio.analytics.traffic} />
          <Metric label="Conversions" value={studio.analytics.conversions} />
          <Metric label="Events" value={studio.analytics.events} />
        </div>
      </Panel>
      <Panel>
        <h2 className="font-semibold">Top Landing Pages</h2>
        <div className="mt-6 space-y-4">
          {studio.analytics.topPages.map(page => (
            <div key={page.path}>
              <div className="mb-1 flex justify-between text-sm"><span>{page.path}</span><span>{page.views} views</span></div>
              <div className="h-2 rounded-full bg-white/10"><div className="h-2 rounded-full bg-blue-500" style={{ width: `${Math.min(100, page.views / 12)}%` }} /></div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function IntegrationsView({ studio, onUpdate }: { studio: WebsiteStudio; onUpdate: (updater: (studio: WebsiteStudio) => WebsiteStudio) => void }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {studio.integrations.map(integration => (
        <Panel key={integration.name}>
          <div className="flex items-start justify-between gap-3">
            <Plug className="text-blue-300" size={20} />
            <button
              onClick={() => onUpdate(current => ({ ...current, integrations: current.integrations.map(item => item.name === integration.name ? { ...item, connected: !item.connected } : item) }))}
              className={cn("rounded-full px-3 py-1 text-xs font-semibold", integration.connected ? "bg-emerald-500/15 text-emerald-200" : "bg-white/10 text-slate-300")}
            >
              {integration.connected ? "Connected" : "Connect"}
            </button>
          </div>
          <h3 className="mt-4 font-semibold">{integration.name}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">{integration.description}</p>
        </Panel>
      ))}
    </div>
  );
}

function PublishingView({ studio, onPublish, onRestore }: { studio: WebsiteStudio; onPublish: (pageId: string) => void; onRestore: (page: StudioPage) => void }) {
  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_.8fr]">
      <Panel>
        <h1 className="text-xl font-semibold">Publishing Workflow</h1>
        <div className="mt-4 space-y-3">
          {studio.pages.map(page => (
            <div key={page.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <div>
                <div className="font-medium">{page.title}</div>
                <div className="mt-1 text-xs text-slate-500">{page.slug} / updated {formatTime(page.updatedAt)}</div>
              </div>
              <div className="flex items-center gap-2">
                <StatusPill status={page.status} />
                <button onClick={() => onPublish(page.id)} className="studio-button"><Rocket size={14} /> Publish</button>
              </div>
            </div>
          ))}
        </div>
      </Panel>
      <Panel>
        <h2 className="font-semibold">Version History</h2>
        <div className="mt-4 space-y-3">
          {studio.versions.slice(0, 8).map(version => (
            <div key={version.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium">{version.label}</div>
                  <div className="mt-1 text-xs text-slate-500">{formatTime(version.createdAt)}</div>
                </div>
                <button onClick={() => onRestore(version.snapshot)} className="studio-button"><Undo2 size={14} /> Restore</button>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function ActivityView({ studio }: { studio: WebsiteStudio }) {
  return (
    <Panel>
      <h1 className="text-xl font-semibold">Activity Log</h1>
      <div className="mt-4 space-y-3">
        {studio.activity.map(item => (
          <div key={item.id} className="grid gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-3 md:grid-cols-[1fr_160px]">
            <div>
              <div className="font-medium">{item.label}</div>
              <div className="mt-1 text-xs text-slate-500">{item.user}</div>
            </div>
            <div className="text-xs text-slate-500">{formatTime(item.createdAt)}</div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function SettingsView({ studio, onUpdate }: { studio: WebsiteStudio; onUpdate: (updater: (studio: WebsiteStudio) => WebsiteStudio) => void }) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Panel>
        <h1 className="text-xl font-semibold">CMS Settings</h1>
        <div className="mt-4 space-y-3">
          {(["autosave", "globalSearchEnabled", "maintenanceMode"] as const).map(key => (
            <label key={key} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 text-sm">
              {labelize(key)}
              <input type="checkbox" checked={studio.settings[key]} onChange={event => onUpdate(current => ({ ...current, settings: { ...current.settings, [key]: event.target.checked } }))} />
            </label>
          ))}
          <select value={studio.settings.publishingWorkflow} onChange={event => onUpdate(current => ({ ...current, settings: { ...current.settings, publishingWorkflow: event.target.value as WebsiteStudio["settings"]["publishingWorkflow"] } }))} className="studio-input">
            <option value="simple">Simple publishing</option>
            <option value="review">Review approval workflow</option>
          </select>
        </div>
      </Panel>
      <Panel>
        <h1 className="text-xl font-semibold">Permissions Matrix</h1>
        <DataTable columns={["Role", "Pages", "SEO", "Publish"]} rows={[
          ["Super Admin", "Full", "Full", "Yes"],
          ["Admin", "Full", "Full", "Yes"],
          ["Editor", "Edit", "Limited", "Review"],
          ["Author", "Blog", "Limited", "No"],
          ["Marketing", "Landing pages", "Full", "Review"],
          ["Viewer", "Read", "Read", "No"]
        ]} />
      </Panel>
    </div>
  );
}

function PageTree({ pages, activeId, onSelect, onDuplicate, onDelete, onCreateChild }: { pages: StudioPage[]; activeId: string; onSelect: (id: string) => void; onDuplicate: (id: string) => void; onDelete: (id: string) => void; onCreateChild: (parentId: string) => void }) {
  const roots = pages.filter(page => !page.parentId);
  return (
    <div className="space-y-1">
      {roots.map(page => (
        <PageTreeItem key={page.id} page={page} pages={pages} activeId={activeId} depth={0} onSelect={onSelect} onDuplicate={onDuplicate} onDelete={onDelete} onCreateChild={onCreateChild} />
      ))}
    </div>
  );
}

function PageTreeItem({ page, pages, activeId, depth, onSelect, onDuplicate, onDelete, onCreateChild }: { page: StudioPage; pages: StudioPage[]; activeId: string; depth: number; onSelect: (id: string) => void; onDuplicate: (id: string) => void; onDelete: (id: string) => void; onCreateChild: (parentId: string) => void }) {
  const children = pages.filter(item => item.parentId === page.id);
  return (
    <div>
      <div className="group flex items-center gap-1" style={{ paddingLeft: depth * 14 }}>
        <button
          onClick={() => onSelect(page.id)}
          className={cn("flex min-h-9 flex-1 items-center gap-2 rounded-lg px-2 text-left text-sm", activeId === page.id ? "bg-blue-500 text-white" : "text-slate-300 hover:bg-white/10")}
        >
          <FileText size={14} />
          <span className="min-w-0 flex-1 truncate">{page.title}</span>
          {page.hidden ? <EyeOff size={13} /> : null}
        </button>
        <button onClick={() => onCreateChild(page.id)} className="hidden h-8 w-8 place-items-center rounded-lg hover:bg-white/10 group-hover:grid"><Plus size={13} /></button>
        <button onClick={() => onDuplicate(page.id)} className="hidden h-8 w-8 place-items-center rounded-lg hover:bg-white/10 group-hover:grid"><Copy size={13} /></button>
        {page.slug !== "/" ? <button onClick={() => onDelete(page.id)} className="hidden h-8 w-8 place-items-center rounded-lg text-red-300 hover:bg-red-500/10 group-hover:grid"><Trash2 size={13} /></button> : null}
      </div>
      {children.map(child => (
        <PageTreeItem key={child.id} page={child} pages={pages} activeId={activeId} depth={depth + 1} onSelect={onSelect} onDuplicate={onDuplicate} onDelete={onDelete} onCreateChild={onCreateChild} />
      ))}
    </div>
  );
}

function MenuEditor({ items, onChange }: { items: MenuItem[]; onChange: (items: MenuItem[]) => void }) {
  function update(index: number, patch: Partial<MenuItem>) {
    onChange(items.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
  }

  return (
    <div className="mt-4 space-y-3">
      {items.map((item, index) => (
        <div key={`${item.href}-${index}`} className="grid gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-3 md:grid-cols-[1fr_1fr_auto]">
          <input value={item.label} onChange={event => update(index, { label: event.target.value })} className="studio-input" />
          <input value={item.href} onChange={event => update(index, { href: event.target.value })} className="studio-input" />
          <button onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))} className="studio-button text-red-200"><Trash2 size={14} /></button>
        </div>
      ))}
      <button onClick={() => onChange([...items, { label: "New Link", href: "/", visible: true }])} className="studio-button"><Plus size={14} /> Add menu item</button>
    </div>
  );
}

function CommandPalette({ results, onClose, onSelectPage }: { results: Array<{ type: string; label: string; id: string }>; onClose: () => void; onSelectPage: (pageId: string) => void }) {
  return (
    <div className="absolute left-1/2 top-24 z-40 w-[min(720px,calc(100%-2rem))] -translate-x-1/2 rounded-2xl border border-white/10 bg-slate-950 p-3 shadow-2xl">
      <div className="mb-2 flex items-center justify-between px-2 py-1">
        <span className="text-sm font-semibold">Search Results</span>
        <button onClick={onClose} className="text-sm text-slate-400">Close</button>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {results.map(result => (
          <button key={`${result.type}-${result.id}`} onClick={() => { if (result.type === "page") onSelectPage(result.id); onClose(); }} className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm hover:bg-white/10">
            <span>{result.label}</span>
            <span className="text-xs text-slate-500">{result.type}</span>
          </button>
        ))}
        {!results.length ? <div className="p-4 text-sm text-slate-400">No results found.</div> : null}
      </div>
    </div>
  );
}

function DataTable({ columns, rows }: { columns: string[]; rows: string[][] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10">
      <table className="w-full text-left text-sm">
        <thead className="bg-white/[0.05] text-xs uppercase tracking-wide text-slate-400">
          <tr>{columns.map(column => <th key={column} className="px-4 py-3">{column}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {rows.map((row, index) => (
            <tr key={index} className="hover:bg-white/[0.03]">{row.map((cell, cellIndex) => <td key={`${cell}-${cellIndex}`} className="px-4 py-3">{cell}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn("rounded-2xl border border-white/10 bg-white/[0.055] p-4 shadow-xl shadow-black/10 backdrop-blur", className)}>{children}</section>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="grid gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{label}{children}</label>;
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <Panel className="grid min-h-80 place-items-center text-center">
      <div>
        <AlertTriangle className="mx-auto text-amber-300" />
        <h2 className="mt-4 text-lg font-semibold">{title}</h2>
        <p className="mt-2 text-sm text-slate-400">{body}</p>
      </div>
    </Panel>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <div className="text-2xl font-semibold">{value}</div>
      <div className="mt-1 text-xs text-slate-400">{label}</div>
    </div>
  );
}

function HealthRow({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm"><span>{label}</span><span>{value}%</span></div>
      <div className="h-2 rounded-full bg-white/10"><div className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-emerald-400" style={{ width: `${value}%` }} /></div>
    </div>
  );
}

function StatusPill({ status }: { status: PageStatus }) {
  const styles: Record<PageStatus, string> = {
    draft: "bg-slate-500/20 text-slate-200",
    review: "bg-amber-500/20 text-amber-200",
    approved: "bg-blue-500/20 text-blue-200",
    published: "bg-emerald-500/20 text-emerald-200",
    scheduled: "bg-purple-500/20 text-purple-200",
    archived: "bg-red-500/20 text-red-200"
  };
  return <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold capitalize", styles[status])}>{status}</span>;
}

type StudioHealth = {
  status: string;
  seoScore: number;
  performanceScore: number;
  accessibilityScore: number;
  contentScore: number;
  brokenLinks: number;
};

function ensureStudio(content: WebsiteEditorContent): EnterpriseWebsiteContent {
  const incoming = content as EnterpriseWebsiteContent;
  const baseStudio = defaultStudio(content);
  return {
    ...incoming,
    studio: {
      ...baseStudio,
      ...(incoming.studio || {}),
      designSystem: { ...baseStudio.designSystem, ...(incoming.studio?.designSystem || {}) },
      settings: { ...baseStudio.settings, ...(incoming.studio?.settings || {}) }
    }
  };
}

function defaultStudio(content: WebsiteEditorContent): WebsiteStudio {
  const home = createStudioPage("Home", "/", null, [
    createSection("Hero", {
      eyebrow: content.hero.subheadline,
      headline: content.hero.headline,
      body: content.hero.description,
      ctaLabel: content.hero.primaryCtaLabel,
      ctaHref: content.hero.primaryCtaHref,
      items: content.hero.trustBadges
    }),
    createSection("Features", { headline: "Everything needed to manage community leads", body: "A focused workflow for scanning, qualifying, drafting, and follow-up review.", items: content.services.features }),
    createSection("Testimonials", { headline: "Built for service teams", body: "Show customer proof, ratings, and case studies from the CMS.", items: ["Freelancers", "Agencies", "Growth teams"] }),
    createSection("Pricing", { headline: "Start with a 7-day trial", body: content.services.pricingSummary, ctaLabel: "View pricing", ctaHref: "/pricing" }),
    createSection("FAQ", { headline: "Common questions", body: "Manage FAQs, structured data, and page content from one editor.", items: ["Manual outreach only", "Visible scanning", "Workspace sync"] }),
    createSection("Call To Action", { headline: "Turn community conversations into a lead pipeline", body: "Install the extension and manage every lead from your dashboard.", ctaLabel: "Start free trial", ctaHref: "/signup" })
  ]);
  const services = createStudioPage("Services", "/solutions");

  return {
    pages: [
      home,
      createStudioPage("About", "/about"),
      services,
      createStudioPage("Web Design", "/solutions/web-design", services.id),
      createStudioPage("SEO", "/solutions/seo", services.id),
      createStudioPage("CRO", "/solutions/cro", services.id),
      createStudioPage("PPC", "/solutions/ppc", services.id),
      createStudioPage("Pricing", "/pricing"),
      createStudioPage("Blog", "/blog"),
      createStudioPage("Resources", "/resources"),
      createStudioPage("Careers", "/careers"),
      createStudioPage("Contact", "/contact"),
      createStudioPage("FAQ", "/faqs"),
      createStudioPage("Privacy Policy", "/privacy"),
      createStudioPage("Terms", "/terms")
    ],
    media: [
      {
        id: uid("media"),
        name: "Dashboard mockup",
        type: "image",
        url: content.hero.illustrationUrl || "/preview.html",
        folder: "Product",
        tags: ["dashboard", "hero"],
        alt: "Community Lead Assistant dashboard preview",
        caption: "",
        sizeKb: 180,
        usedOn: ["Home"],
        createdAt: now()
      }
    ],
    components: [
      { id: uid("component"), name: "Global Navbar", type: "Navbar", usedOn: ["All pages"], updatedAt: now() },
      { id: uid("component"), name: "Global Footer", type: "Footer", usedOn: ["All pages"], updatedAt: now() },
      { id: uid("component"), name: "Primary CTA", type: "CTA", usedOn: ["Home", "Pricing"], updatedAt: now() }
    ],
    forms: [
      { id: uid("form"), name: "Contact Form", type: "contact", status: "active", submissions: 0, webhook: "", emailTo: content.contact.email },
      { id: uid("form"), name: "Newsletter", type: "newsletter", status: "active", submissions: 0, webhook: "", emailTo: content.contact.email }
    ],
    blogPosts: [
      { id: uid("post"), title: "How to find community leads without spam", slug: "find-community-leads-without-spam", status: "draft", category: "Growth", tags: ["community", "lead generation"], author: content.blog.defaultAuthor, excerpt: "A practical guide to safe community lead discovery.", readingTime: 6, scheduledAt: "", updatedAt: now() }
    ],
    designSystem: {
      colors: {
        primary: content.branding.primaryColor,
        ink: content.branding.secondaryColor,
        surface: "#ffffff",
        accent: content.branding.accentColor
      },
      typography: {
        headingFont: content.branding.headingFont,
        bodyFont: content.branding.bodyFont,
        baseSize: "16px",
        scale: "1.2"
      },
      buttons: {
        radius: content.buttons.borderRadius,
        shadow: "soft",
        hover: content.buttons.hoverEffect
      },
      layout: {
        containerWidth: "1280px",
        sectionSpacing: "96px",
        cardRadius: "16px"
      },
      theme: "system",
      customCss: "",
      customJs: ""
    },
    analytics: {
      traffic: 1840,
      conversions: 47,
      events: 389,
      topPages: [
        { path: "/", views: 840 },
        { path: "/pricing", views: 390 },
        { path: "/download-extension", views: 288 },
        { path: "/blog", views: 214 }
      ]
    },
    integrations: [
      { name: "Google Analytics", connected: Boolean(content.analytics.googleAnalyticsId), description: "Traffic, events, conversions, and landing page performance." },
      { name: "Google Tag Manager", connected: Boolean(content.analytics.googleTagManagerId), description: "Marketing tags and conversion pixels." },
      { name: "Meta Pixel", connected: Boolean(content.analytics.metaPixelId), description: "Paid social conversion tracking." },
      { name: "Microsoft Clarity", connected: Boolean(content.analytics.microsoftClarityId), description: "Session insights and heatmap readiness." },
      { name: "HubSpot", connected: Boolean(content.integrations.crm), description: "CRM and lead handoff integration." },
      { name: "Zapier", connected: Boolean(content.integrations.zapier), description: "Automation workflows and webhook connections." },
      { name: "Stripe", connected: content.integrations.paymentGateway.toLowerCase().includes("stripe"), description: "Billing and paid plan readiness." },
      { name: "Calendly", connected: Boolean(content.integrations.calendly), description: "Booking and demo scheduling." }
    ],
    activity: [
      { id: uid("activity"), label: "Website editor opened", user: "Owner", createdAt: now() },
      { id: uid("activity"), label: "Home page content synced", user: "System", createdAt: now() }
    ],
    versions: [],
    settings: {
      autosave: true,
      globalSearchEnabled: true,
      maintenanceMode: false,
      publishingWorkflow: "review"
    }
  };
}

function createStudioPage(title: string, slug: string, parentId: string | null = null, sections?: StudioSection[]): StudioPage {
  return {
    id: uid("page"),
    title,
    slug,
    parentId,
    status: slug === "/" ? "published" : "draft",
    hidden: false,
    scheduledAt: "",
    sections: sections || [
      createSection("Hero", { headline: title, body: `Manage the ${title.toLowerCase()} page from the CMS visual editor.`, ctaLabel: "Get started", ctaHref: "/signup" }),
      createSection("Content", { headline: `${title} content`, body: "Click any text in the visual canvas to edit it inline.", items: ["Editable sections", "SEO controls", "Publishing workflow"] })
    ],
    seo: {
      title: `${title} | Community Lead Assistant`,
      description: `Manage ${title.toLowerCase()} content, SEO, media, and publishing from Community Lead Assistant CMS.`,
      canonical: slug,
      keywords: [title.toLowerCase(), "community lead assistant"],
      noindex: false,
      ogImage: "",
      schema: "{}"
    },
    updatedAt: now(),
    publishedAt: slug === "/" ? now() : ""
  };
}

function createSection(type: string, content: StudioSection["content"] = {}): StudioSection {
  return {
    id: uid("section"),
    type,
    title: type,
    hidden: false,
    content: {
      eyebrow: type === "Hero" ? "Live page section" : "",
      headline: content.headline || `${type} section`,
      body: content.body || "Click to edit this content directly on the page canvas.",
      ctaLabel: content.ctaLabel || "",
      ctaHref: content.ctaHref || "",
      imageUrl: content.imageUrl || "",
      videoUrl: content.videoUrl || "",
      items: content.items || []
    },
    settings: {
      layout: type === "Hero" ? "split hero" : "contained",
      background: "#ffffff",
      padding: "64px",
      animation: "fade-up"
    },
    updatedAt: now()
  };
}

function syncPublicContent(content: EnterpriseWebsiteContent): EnterpriseWebsiteContent {
  const studio = content.studio;
  if (!studio) return content;
  const home = studio.pages.find(page => page.slug === "/");
  const hero = home?.sections.find(section => section.type === "Hero");
  const next = { ...content };
  if (hero) {
    next.hero = {
      ...next.hero,
      subheadline: hero.content.eyebrow || next.hero.subheadline,
      headline: hero.content.headline || next.hero.headline,
      description: hero.content.body || next.hero.description,
      primaryCtaLabel: hero.content.ctaLabel || next.hero.primaryCtaLabel,
      primaryCtaHref: hero.content.ctaHref || next.hero.primaryCtaHref,
      trustBadges: hero.content.items?.length ? hero.content.items : next.hero.trustBadges
    };
  }
  next.branding = {
    ...next.branding,
    primaryColor: studio.designSystem.colors.primary,
    secondaryColor: studio.designSystem.colors.ink,
    accentColor: studio.designSystem.colors.accent,
    headingFont: studio.designSystem.typography.headingFont,
    bodyFont: studio.designSystem.typography.bodyFont
  };
  return next;
}

function computeHealth(studio: WebsiteStudio): StudioHealth {
  const pages = Math.max(1, studio.pages.length);
  const seoReady = studio.pages.filter(page => page.seo.title && page.seo.description && !page.seo.noindex).length;
  const missingAlt = studio.media.filter(asset => ["image", "svg", "icon"].includes(asset.type) && !asset.alt).length;
  const brokenLinks = studio.pages.flatMap(page => page.sections).filter(section => section.content.ctaHref === "#").length;
  const published = studio.pages.filter(page => page.status === "published").length;
  return {
    status: brokenLinks ? "Needs review" : "Operational",
    seoScore: Math.min(100, Math.round((seoReady / pages) * 100)),
    performanceScore: Math.max(72, 98 - studio.media.length * 2),
    accessibilityScore: Math.max(65, 100 - missingAlt * 8),
    contentScore: Math.round((published / pages) * 100),
    brokenLinks
  };
}

function globalSearch(studio: WebsiteStudio, query: string) {
  const value = query.trim().toLowerCase();
  if (!value) return [];
  const pageResults = studio.pages
    .filter(page => `${page.title} ${page.slug}`.toLowerCase().includes(value))
    .map(page => ({ type: "page", label: page.title, id: page.id }));
  const sectionResults = studio.pages.flatMap(page => page.sections
    .filter(section => `${section.title} ${section.content.headline || ""} ${section.content.body || ""}`.toLowerCase().includes(value))
    .map(section => ({ type: "section", label: `${page.title} / ${section.title}`, id: page.id })));
  const mediaResults = studio.media
    .filter(asset => `${asset.name} ${asset.alt} ${asset.tags.join(" ")}`.toLowerCase().includes(value))
    .map(asset => ({ type: "media", label: asset.name, id: asset.id }));
  return [...pageResults, ...sectionResults, ...mediaResults].slice(0, 12);
}

function addVersion(studio: WebsiteStudio, pageId: string, label: string) {
  const page = studio.pages.find(item => item.id === pageId);
  if (!page) return studio.versions;
  return [{ id: uid("version"), label, createdAt: now(), pageId, snapshot: page }, ...studio.versions].slice(0, 25);
}

function activity(studio: WebsiteStudio, label: string) {
  return [{ id: uid("activity"), label, user: "Owner", createdAt: now() }, ...studio.activity].slice(0, 50);
}

function aiCopy(actionName: string, section: StudioSection, page?: StudioPage) {
  const pageName = page?.title || "this page";
  const base = section.content.body || "";
  if (actionName === "Rewrite Copy") return `${base} Clearer version: ${section.content.headline || section.title} helps visitors understand the value quickly and take the next step with confidence.`;
  if (actionName === "Improve SEO") return `${base} Optimized for intent, clarity, and conversion on ${pageName}.`;
  if (actionName === "Generate FAQ") return "What does this page help with?\nIt explains the offer clearly, answers buyer questions, and guides visitors to the next action.";
  if (actionName === "Generate CTA") return "Ready to move faster? Start your free trial and manage your lead workflow from one dashboard.";
  return "Suggested CRO improvement: make the main value promise specific, add proof near the CTA, and reduce visual distractions around the primary action.";
}

function moduleLabel(module: StudioModule) {
  return modules.find(item => item.id === module)?.label || "Website Studio";
}

function mediaType(url: string): StudioMedia["type"] {
  const lower = url.toLowerCase();
  if (lower.endsWith(".svg")) return "svg";
  if (lower.endsWith(".pdf")) return "pdf";
  if (lower.endsWith(".zip")) return "zip";
  if (lower.endsWith(".mp4") || lower.endsWith(".mov") || lower.endsWith(".webm")) return "video";
  return "image";
}

function lines(value: string) {
  return value.split("\n").map(line => line.trim()).filter(Boolean);
}

function labelize(value: string) {
  return value.replace(/([A-Z])/g, " $1").replace(/^./, char => char.toUpperCase());
}

function now() {
  return new Date().toISOString();
}

function formatTime(value?: string) {
  if (!value) return "not yet";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36)}`;
}
