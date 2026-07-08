import Link from "next/link";
import { ArrowRight, Newspaper } from "lucide-react";
import { MarketingShell } from "@/components/marketing-shell";
import { Badge, Card } from "@/components/ui";
import { listPublishedBlogPosts } from "@/lib/public-blog";

export default async function BlogPage() {
  const { posts, cmsReady } = await listPublishedBlogPosts();

  return (
    <MarketingShell>
      <main className="mx-auto max-w-7xl px-6 py-16">
        <Badge tone="blue">Blog</Badge>
        <div className="mt-5 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <h1 className="text-5xl font-semibold tracking-tight text-slate-950 dark:text-white">Community growth, lead intelligence, and safer outreach.</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              Publish guides, case studies, product updates, SEO articles, and release notes from the admin CMS.
            </p>
          </div>
        </div>

        {!cmsReady ? (
          <Card className="mt-10 dark:border-white/10 dark:bg-white/5">
            <Newspaper className="text-blue-600" />
            <h2 className="mt-4 text-xl font-semibold text-slate-950 dark:text-white">Blog publishing is not active yet</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Publish articles from the Website Editor once your CMS content tables are connected.
            </p>
          </Card>
        ) : null}

        {cmsReady && !posts.length ? (
          <Card className="mt-10 dark:border-white/10 dark:bg-white/5">
            <Newspaper className="text-blue-600" />
            <h2 className="mt-4 text-xl font-semibold text-slate-950 dark:text-white">No published articles yet</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Draft, schedule, and publish articles from the admin CMS. Published posts will appear here automatically.
            </p>
          </Card>
        ) : null}

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {posts.map(post => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group">
              <Card className="h-full transition group-hover:-translate-y-1 group-hover:shadow-2xl dark:border-white/10 dark:bg-white/5">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>{post.author_name || "Community Lead Assistant"}</span>
                  <span>{post.reading_time_minutes || 1} min read</span>
                </div>
                <h2 className="mt-5 text-xl font-semibold text-slate-950 dark:text-white">{post.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{post.excerpt}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-600">
                  Read article <ArrowRight size={16} />
                </span>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </MarketingShell>
  );
}
