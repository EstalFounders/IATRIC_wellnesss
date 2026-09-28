import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Layouts from "../../src/layout/Layouts";
import PageBanner from "../../src/layout/PageBanner";
import { api } from "../../src/constant";

const formatDate = (value) => {
  if (!value) return "";

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString(undefined, {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
};

/**
 * Public blog detail view for a post created in the marketing panel.
 * Rendered client-side (like the rest of the site) from
 * /api/marketing/blog/public?slug=…
 */
const BlogPostPage = () => {
  const router = useRouter();
  const slug = router.query?.slug;
  const [state, setState] = useState({ loading: true, post: null });

  useEffect(() => {
    if (!slug) return undefined;

    let alive = true;

    const loadPost = async () => {
      try {
        const response = await fetch(
          `${api.marketingBlogPublic}?slug=${encodeURIComponent(slug)}`,
          { cache: "no-store" }
        );
        const data = await response.json();

        if (alive) setState({ loading: false, post: data?.post || null });
      } catch (error) {
        if (alive) setState({ loading: false, post: null });
      }
    };

    loadPost();

    return () => {
      alive = false;
    };
  }, [slug]);

  const { post, loading } = state;
  const paragraphs = String(post?.content || "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <Layouts>
      <PageBanner
        pageTitle={post?.title || "Our Blog"}
        url="blog"
        motherTitle="Our Blog"
      />

      <section className="wide-60 blog-page-section division">
        <div className="container">
          {loading && <p className="text-center">Loading the post…</p>}

          {!loading && !post && (
            <div className="row">
              <div className="col-lg-8 offset-lg-2 text-center">
                <h3 className="h3-md text-dark">
                  This post is not available
                </h3>
                <p>
                  It may have been unpublished or the link is incorrect.
                </p>
                <Link legacyBehavior href="/demo-5#blog-1">
                  <a className="btn btn-md btn-primary">
                    Back to the blog
                  </a>
                </Link>
              </div>
            </div>
          )}

          {!loading && post && (
            <div className="row">
              <div className="col-lg-8 offset-lg-2">
                {post.coverImage && (
                  <img
                    className="img-fluid mb-4"
                    src={post.coverImage}
                    alt={post.title}
                  />
                )}

                <h1 className="h1-lg text-dark">{post.title}</h1>

                <p className="post-meta mb-4">
                  {formatDate(post.publishedAt)}
                  {post.author ? ` · ${post.author}` : ""}
                </p>

                {post.excerpt && (
                  <p className="lead mb-4">
                    <strong>{post.excerpt}</strong>
                  </p>
                )}

                {paragraphs.map((paragraph, index) => (
                  // Content is rendered as plain text (never as raw HTML).
                  <p key={index}>{paragraph}</p>
                ))}

                <Link legacyBehavior href="/demo-5#blog-1">
                  <a className="btn btn-sm btn-outline-secondary mt-4">
                    ← All posts
                  </a>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </Layouts>
  );
};

export default BlogPostPage;
