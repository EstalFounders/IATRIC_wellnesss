// Queries for blog posts, stored in marketingPanel.blogDetails.posts on the
// "blog" document (a panel-internal identifier - it is not one of the SEO
// targets in MARKETING_PAGES).
import MarketingPanel from "../../../models/marketingPanelSchema";
import { normalizeCoverImage } from "../utils/blogPayload";

const BLOG_IDENTIFIER = "blog";

const toPost = (post) => ({
  _id: post._id,
  title: post.title,
  slug: post.slug,
  excerpt: post.excerpt || "",
  content: post.content || "",
  coverImage: normalizeCoverImage(post.coverImage),
  author: post.author || "Marketing Team",
  isPublished: post.isPublished !== false,
  publishedAt: post.publishedAt || null,
  updatedAt: post.updatedAt || null,
});

const byNewest = (a, b) =>
  new Date(b.publishedAt || b.updatedAt || 0) -
  new Date(a.publishedAt || a.updatedAt || 0);

/** All posts, newest first (panel view). */
export const listBlogPosts = async () => {
  const doc = await MarketingPanel.findOne({
    pageIdentifier: BLOG_IDENTIFIER,
  }).lean();

  return (doc?.blogDetails?.posts || []).map(toPost).sort(byNewest);
};

/** Published posts only (public view). */
export const listPublishedBlogPosts = async () => {
  const posts = await listBlogPosts();
  return posts.filter((post) => post.isPublished);
};

/** One published post by slug, or null. */
export const findPublishedBlogPostBySlug = async (slug) => {
  const posts = await listPublishedBlogPosts();
  return posts.find((post) => post.slug === slug) || null;
};

/** Create a post on the blog document (creates the doc when missing). */
export const createBlogPost = async (values, updatedBy) => {
  const now = new Date();

  await MarketingPanel.findOneAndUpdate(
    { pageIdentifier: BLOG_IDENTIFIER },
    {
      $push: {
        "blogDetails.posts": {
          ...values,
          publishedAt: values.publishedAt || now,
          updatedAt: now,
        },
      },
      $set: { updatedBy },
    },
    { upsert: true, setDefaultsOnInsert: true, runValidators: true }
  );

  const posts = await listBlogPosts();
  return posts.find((post) => post.slug === values.slug) || null;
};

/** Update one post by _id. Returns the updated post or null. */
export const updateBlogPost = async (id, values, updatedBy) => {
  const updates = { ...values, updatedAt: new Date() };

  if (typeof values.isPublished === "boolean" && !values.title) {
    // publish/unpublish toggles only send isPublished
    delete updates.slug;
    delete updates.content;
  }

  const set = Object.entries(updates).reduce((acc, [key, value]) => {
    if (value !== undefined) acc[`blogDetails.posts.$.${key}`] = value;
    return acc;
  }, {});

  const doc = await MarketingPanel.findOneAndUpdate(
    { pageIdentifier: BLOG_IDENTIFIER, "blogDetails.posts._id": id },
    { $set: { ...set, updatedBy } },
    { new: true, runValidators: true }
  ).lean();

  if (!doc) return null;

  return (
    (doc.blogDetails?.posts || [])
      .map(toPost)
      .find((post) => String(post._id) === String(id)) || null
  );
};

/** Delete one post by _id. Returns the deleted post or null. */
export const deleteBlogPost = async (id, updatedBy) => {
  const doc = await MarketingPanel.findOneAndUpdate(
    { pageIdentifier: BLOG_IDENTIFIER, "blogDetails.posts._id": id },
    { $pull: { "blogDetails.posts": { _id: id } }, $set: { updatedBy } },
    { new: false }
  ).lean();

  if (!doc) return null;

  const removed = (doc.blogDetails?.posts || []).find(
    (post) => String(post._id) === String(id)
  );

  return removed ? toPost(removed) : null;
};
