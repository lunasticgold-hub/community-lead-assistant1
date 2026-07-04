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

function tableMissing(error: { code?: string; message?: string } | null) {
  return Boolean(error?.code === "42P01" || /does not exist|schema cache/i.test(error?.message || ""));
}

export async function listPublishedBlogPosts(): Promise<{ posts: PublicBlogPost[]; cmsReady: boolean }> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { posts: [], cmsReady: false };

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
