import { getSeoStaticProps } from "../../src/api/marketing/helpers/seoServer";

// Marketing panel SEO: the tags are written into the built HTML and refresh at
// most every 60s; saving in the panel also triggers an on-demand rebuild.
export const getStaticProps = () => getSeoStaticProps("/our-blog");

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Layouts from "../../src/layout/Layouts";
import PageBanner from "../../src/layout/PageBanner";
import { api } from "../../src/constant";

const DEFAULT_COVER = "/images/blog/post-1-img.jpg";

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

/** One listing card - keeps the site's blog-post markup. */
const BlogCard = ({ post }) => {
  const [src, setSrc] = useState(post.coverImage || DEFAULT_COVER);

  useEffect(() => {
    setSrc(post.coverImage || DEFAULT_COVER);
  }, [post.coverImage]);

  return (
    <div className="col-lg-4">
      <div className="blog-post">
        {/* BLOG POST IMAGE */}
        <div className="blog-post-img">
          <img
            className="img-fluid"
            src={src}
            alt={post.title || "blog-post-image"}
            onError={() => setSrc(DEFAULT_COVER)}
          />
        </div>
        {/* BLOG POST TEXT */}
        <div className="blog-post-txt">
          <h5 className="h5-sm steelblue-color">
            <Link legacyBehavior href={`/our-blog/${post.slug}`}>
              <a>{post.title}</a>
            </Link>
          </h5>
          <span>
            {formatDate(post.publishedAt)
              ? `${formatDate(post.publishedAt)} by `
              : ""}
            <span>{post.author || "Marketing Team"}</span>
          </span>
          <p>
            {post.excerpt ||
              `${String(post.content || "").slice(0, 150)}${
                String(post.content || "").length > 150 ? "..." : ""
              }`}
          </p>
          <Link legacyBehavior href={`/our-blog/${post.slug}`}>
            <a className="btn btn-sm btn-outline-secondary">Read more</a>
          </Link>
        </div>
      </div>
    </div>
  );
};

/**
 * "Our Blog" - lists every published post managed in the marketing panel.
 * This is the breadcrumb target used by the blog detail pages (/our-blog/<slug>).
 */
const OurBlogPage = () => {
  const [state, setState] = useState({ loading: true, posts: [], error: "" });

  useEffect(() => {
    let alive = true;

    const loadPosts = async () => {
      try {
        const response = await fetch(api.marketingBlogPublic, {
          cache: "no-store",
        });
        const data = await response.json();

        if (alive) {
          setState({
            loading: false,
            posts: Array.isArray(data.posts) ? data.posts : [],
            error: "",
          });
        }
      } catch (error) {
        if (alive) {
          setState({
            loading: false,
            posts: [],
            error: "Unable to load the blog posts right now.",
          });
        }
      }
    };

    loadPosts();

    return () => {
      alive = false;
    };
  }, []);

  const { loading, posts, error } = state;

  return (
    <Layouts>
      <PageBanner pageTitle="Our Blog" />

      <section className="wide-60 blog-page-section division">
        <div className="container">
          {/* SECTION TITLE */}
          <div className="row">
            <div className="col-lg-10 offset-lg-1 section-title">
              <h3 className="h3-md text-dark">Our Blog</h3>
              <div>
                Health tips, patient stories and clinic updates from our team.
              </div>
            </div>
          </div>

          {loading && <p className="text-center">Loading posts…</p>}

          {!loading && error && (
            <p className="text-center text-muted">{error}</p>
          )}

          {!loading && !error && posts.length === 0 && (
            <div className="row">
              <div className="col-lg-8 offset-lg-2 text-center">
                <p className="text-muted">
                  No posts have been published yet. Please check back soon.
                </p>
                <Link legacyBehavior href="/appointment">
                  <a className="btn btn-md btn-primary">Book a consultation</a>
                </Link>
              </div>
            </div>
          )}

          {posts.length > 0 && (
            <div className="row">
              {posts.map((post) => (
                <BlogCard key={post._id || post.slug} post={post} />
              ))}
            </div>
          )}
        </div>
      </section>
    </Layouts>
  );
};

export default OurBlogPage;
