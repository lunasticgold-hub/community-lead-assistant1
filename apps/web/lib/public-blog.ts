import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export type PublicBlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content_markdown: string;
  featured_image_url: string | null;
  author_name: string;
  reading_time_minutes: number;
  seo_title: string | null;
  meta_description: string | null;
  published_at: string | null;
  updated_at: string;
};

type CmsPostRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content_markdown: string;
  author_name: string;
  reading_time_minutes: number;
  seo: Record<string, unknown> | null;
  published_at: string | null;
  updated_at: string;
};

function tableMissing(error: { code?: string; message?: string } | null) {
  return Boolean(error?.code === "42P01" || /does not exist|schema cache/i.test(error?.message || ""));
}

export async function listPublishedBlogPosts(): Promise<{ posts: PublicBlogPost[]; cmsReady: boolean }> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { posts: [], cmsReady: false };

  const cmsResult = await supabase
    .from("cms_posts")
    .select("id,title,slug,excerpt,content_markdown,author_name,reading_time_minutes,seo,published_at,updated_at")
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(24);

  if (!tableMissing(cmsResult.error)) {
    if (cmsResult.error) throw cmsResult.error;
    return { posts: ((cmsResult.data || []) as CmsPostRow[]).map(cmsPostToPublicPost), cmsReady: true };
  }

  const { data, error } = await supabase
    .from("blog_posts")
    .select("id,title,slug,excerpt,content_markdown,featured_image_url,author_name,reading_time_minutes,seo_title,meta_description,published_at,updated_at")
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(24);

  if (tableMissing(error)) return { posts: [], cmsReady: false };
  if (error) throw error;
  return { posts: (data || []) as PublicBlogPost[], cmsReady: true };
}

export async function getPublishedBlogPost(slug: string): Promise<{ post: PublicBlogPost | null; cmsReady: boolean }> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { post: null, cmsReady: false };

  const cmsResult = await supabase
    .from("cms_posts")
    .select("id,title,slug,excerpt,content_markdown,author_name,reading_time_minutes,seo,published_at,updated_at")
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle();

  if (!tableMissing(cmsResult.error)) {
    if (cmsResult.error) throw cmsResult.error;
    return { post: cmsResult.data ? cmsPostToPublicPost(cmsResult.data as CmsPostRow) : null, cmsReady: true };
  }

  const { data, error } = await supabase
    .from("blog_posts")
    .select("id,title,slug,excerpt,content_markdown,featured_image_url,author_name,reading_time_minutes,seo_title,meta_description,published_at,updated_at")
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle();

  if (tableMissing(error)) return { post: null, cmsReady: false };
  if (error) throw error;
  return { post: data as PublicBlogPost | null, cmsReady: true };
}

function cmsPostToPublicPost(row: CmsPostRow): PublicBlogPost {
  const seo = row.seo && typeof row.seo === "object" ? row.seo : {};
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    content_markdown: row.content_markdown,
    featured_image_url: typeof seo.featuredImageUrl === "string" ? seo.featuredImageUrl : null,
    author_name: row.author_name,
    reading_time_minutes: row.reading_time_minutes,
    seo_title: typeof seo.title === "string" ? seo.title : null,
    meta_description: typeof seo.description === "string" ? seo.description : null,
    published_at: row.published_at,
    updated_at: row.updated_at
  };
}
