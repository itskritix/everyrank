import { getAllPosts } from "@/lib/blog";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — AI Model News, Guides & Analysis",
  description:
    "Stay up to date with AI model releases, pricing changes, benchmark results, and practical guides for choosing the right model.",
};

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Blog</h1>
      <p className="text-muted mb-10">
        AI model news, pricing analysis, and practical guides.
      </p>

      {posts.length === 0 ? (
        <p className="text-muted">No posts yet. Check back soon.</p>
      ) : (
        <div className="space-y-8">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="group border border-border rounded-lg overflow-hidden hover:border-accent/50 transition-all"
            >
              <Link href={`/blog/${post.slug}`} className="block">
                {post.coverImage && (
                  <div className="aspect-[2.4/1] overflow-hidden bg-card">
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center gap-3 text-xs text-muted mb-2">
                    <time>{formatDate(post.date)}</time>
                    <span>·</span>
                    <span>{post.readingTime}</span>
                  </div>
                  <h2 className="text-xl font-semibold mb-2 group-hover:text-accent-light transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-sm text-muted line-clamp-2">
                    {post.description}
                  </p>
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent-light border border-accent/20"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
