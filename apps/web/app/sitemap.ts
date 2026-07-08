import type { MetadataRoute } from "next";
import { getAppUrl } from "@/lib/env";
import { listPublishedBlogPosts } from "@/lib/public-blog";

const staticRoutes = [
  "",
  "/pricing",
  "/features",
  "/solutions",
  "/resources",
  "/blog",
  "/docs",
  "/download-extension",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/security",
  "/status"
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getAppUrl().replace(/\/$/, "");
  const now = new Date();
  const { posts } = await listPublishedBlogPosts();

  return [
    ...staticRoutes.map(route => ({
      url: `${baseUrl}${route || "/"}`,
      lastModified: now
    })),
    ...posts.map(post => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updated_at || post.published_at || now)
    }))
  ];
}
