import Link from "next/link";
import React, { useEffect, useState } from "react";
import { api } from "../../constant";
import { useLanguage } from "../../i18n/LanguageContext";
import { richText } from "../../i18n/richText";

const DEFAULT_COVER = "/images/blog/post-1-img.jpg";
const PUBLIC_LIMIT = 3;

const formatDate = (value) => {
  if (!value) return "";

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

/** One card - falls back to the default image when the cover fails to load. */
const BlogCard = ({ post, title, href, cover, date, author, excerpt }) => {
  const [src, setSrc] = useState(cover || DEFAULT_COVER);

  useEffect(() => {
    setSrc(cover || DEFAULT_COVER);
  }, [cover]);

  return (
    <div className="col-lg-4">
      <div className="blog-post">
        {/* BLOG POST IMAGE */}
        <div className="blog-post-img">
          <img
            className="img-fluid"
            src={src}
            alt={title || post?.title || "blog-post-image"}
            onError={() => setSrc(DEFAULT_COVER)}
          />
        </div>
        {/* BLOG POST TITLE */}
        <div className="blog-post-txt">
          {/* Post Title */}
          <h5 className="h5-sm steelblue-color">
            <Link legacyBehavior href={href}>
              <a>{title || post?.title}</a>
            </Link>
          </h5>
          {/* Post Data */}
          <span>
            {date ? `${date} by ` : ""}
            <span>{author}</span>
          </span>
          {/* Post Text */}
          <p>{excerpt}</p>
        </div>
      </div>
    </div>
  );
};

/**
 * Blog preview section (Demo 5).
 * Posts come from the marketing panel; while loading, or when the panel has no
 * published posts, the original static cards are shown instead.
 */
const Demo5Blog1 = () => {
  const { t } = useLanguage();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    let alive = true;

    const loadPosts = async () => {
      try {
        const response = await fetch(api.marketingBlogPublic, {
          cache: "no-store",
        });
        const data = await response.json();

        if (alive && Array.isArray(data.posts)) {
          setPosts(data.posts.slice(0, PUBLIC_LIMIT));
        }
      } catch (error) {
        // offline/blocked - keep the static cards below
      }
    };

    loadPosts();

    return () => {
      alive = false;
    };
  }, []);

  const staticPosts = [
    {
      key: "post1",
      title: t("blog1.post1"),
      href: "/single-post",
      cover: "images/blog/post-1-img.jpg",
      date: "May 03, 2019",
      author: "Dr.Jeremy Smith",
      excerpt:
        "Quaerat neque purus ipsum neque dolor primis libero tempus impedit tempor blandit sapien at gravida donec ipsum, at porta justo...",
    },
    {
      key: "post2",
      title: t("blog1.post2"),
      href: "/single-post",
      cover: "images/blog/post-2-img.jpg",
      date: "Apr 28, 2019",
      author: "Dr.Jonathan Barnes",
      excerpt:
        "Quaerat neque purus ipsum neque dolor primis libero tempus impedit tempor blandit sapien at gravida donec ipsum, at porta justo...",
    },
    {
      key: "post3",
      title: t("blog1.post3"),
      href: "/single-post",
      cover: "images/blog/post-3-img.jpg",
      date: "Apr 17, 2019",
      author: "Dr.Megan Coleman",
      excerpt:
        "Quaerat neque purus ipsum neque dolor primis libero tempus impedit tempor blandit sapien at gravida donec ipsum, at porta justo...",
    },
  ];

  const hasManagedPosts = posts.length > 0;

  return (
    <section id="blog-1" className="wide-60 blog-section division">
      <div className="container h5 box-list grey-color">
        {/* SECTION TITLE */}
        <div className="row">
          <div className="col-lg-10 offset-lg-1 section-title">
            <span className="section-id blue-color">
              <h4>{t("blog1.title")}</h4>
            </span>
            {/* Title 	*/}
            <h3 className="h3-md text-dark">{t("blog1.heading")}</h3>
            {/* Text */}
            <div>{richText(t("blog1.intro"))}</div>
          </div>
        </div>
        {/* BLOG POSTS HOLDER */}
        <div className="row">
          {hasManagedPosts
            ? posts.map((post) => (
                <BlogCard
                  key={post._id || post.slug}
                  post={post}
                  title={post.title}
                  href={`/our-blog/${post.slug}`}
                  cover={post.coverImage}
                  date={formatDate(post.publishedAt)}
                  author={post.author || "Marketing Team"}
                  excerpt={
                    post.excerpt ||
                    `${String(post.content || "").slice(0, 140)}${
                      String(post.content || "").length > 140 ? "..." : ""
                    }`
                  }
                />
              ))
            : staticPosts.map((post) => (
                <BlogCard
                  key={post.key}
                  title={post.title}
                  href={post.href}
                  cover={post.cover}
                  date={post.date}
                  author={post.author}
                  excerpt={post.excerpt}
                />
              ))}
        </div>
        {/* END BLOG POSTS HOLDER */}
      </div>
      {/* End container */}
    </section>
  );
};

export default Demo5Blog1;
