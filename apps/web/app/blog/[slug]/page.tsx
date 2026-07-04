import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MarketingShell } from "@/components/marketing-shell";
import { Badge } from "@/components/ui";
import { getPublishedBlogPost } from "@/lib/public-blog";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { post } = await getPublishedBlogPost(slug);
  if (!post) return {};

  return {
    title: post.seo_title || post.title,
    description: post.meta_description || post.excerpt
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { post, cmsReady } = await getPublishedBlogPost(slug);

  if (cmsReady && !post) notFound();

  return (
    <MarketingShell>
      <main className="mx-auto max-w-3xl px-6 py-16">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600">
          <ArrowLeft size={16} />
          Back to blog
        </Link>
        {!post ? (
          <div className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft dark:border-white/10 dark:bg-white/5">
            <Badge tone="orange">CMS not installed</Badge>
            <h1 className="mt-4 text-3xl font-semibold text-slate-950 dark:text-white">Blog post unavailable</h1>
            <p className="mt-3 text-slate-600 dark:text-slate-300">Run the admin migration and publish the article from Admin / Blogs.</p>
          </div>
        ) : (
          <article className="mt-10">
            <Badge tone="blue">{post.reading_time_minutes || 1} min read</Badge>
            <h1 className="mt-5 text-5xl font-semibold tracking-tight text-slate-950 dark:text-white">{post.title}</h1>
            <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">{post.excerpt}</p>
            <div className="mt-6 text-sm text-slate-500 dark:text-slate-400">
              {post.author_name || "Community Lead Assistant"} / {post.published_at ? new Date(post.published_at).toLocaleDateString() : "Published"}
            </div>
            <div className="mt-10 whitespace-pre-wrap rounded-[2rem] border border-slate-200 bg-white p-8 text-base leading-8 text-slate-700 shadow-soft dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
              {post.content_markdown || post.excerpt}
            </div>
          </article>
        )}
      </main>
    </MarketingShell>
  );
}
