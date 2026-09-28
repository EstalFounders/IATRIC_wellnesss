// Shared blog payload helpers (used by the blog API routes and the panel form).
export const BLOG_LIMITS = {
  title: 160,
  slug: 120,
  excerpt: 300,
  content: 20000,
  author: 80,
};

/** "5 Signs You Need A Physio!" -> "5-signs-you-need-a-physio". */
export const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, BLOG_LIMITS.slug);

/**
 * Cover images may come from Firebase Storage (absolute URL), from /public
 * ("/images/x.jpg") or, as pasted by an older flow, without the leading slash
 * ("images/x.jpg"). The latter breaks on nested routes such as /our-blog/slug,
 * so normalise local paths. Empty stays empty (the UI then shows a default).
 */
export const normalizeCoverImage = (value) => {
  if (typeof value !== "string") return "";

  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^(https?:)?\/\//i.test(trimmed) || trimmed.startsWith("data:")) return trimmed;
  if (trimmed.startsWith("/")) return trimmed;

  return `/${trimmed}`;
};

/**
 * Validate + normalise a blog post payload.
 * `existingSlugs` / `currentId` let the caller enforce a unique slug while
 * still allowing a post to keep its own slug when it is edited.
 */
export const sanitizeBlogPayload = (
  body = {},
  { existingPosts = [], currentId = null } = {}
) => {
  const asString = (value, limit) =>
    typeof value === "string" ? value.trim().slice(0, limit) : "";

  const title = asString(body.title, BLOG_LIMITS.title);
  const slug = slugify(body.slug || body.title);
  const excerpt = asString(body.excerpt, BLOG_LIMITS.excerpt);
  const content = asString(body.content, BLOG_LIMITS.content);
  // Accept coverImage (canonical) plus the imageUrl / featuredImage aliases.
  const coverImage = normalizeCoverImage(
    asString(body.coverImage || body.imageUrl || body.featuredImage, 600)
  );
  const author = asString(body.author, BLOG_LIMITS.author) || "Marketing Team";
  const isPublished =
    typeof body.isPublished === "boolean" ? body.isPublished : true;

  const errors = [];

  if (!title) errors.push("A post title is required.");
  if (!slug) errors.push("A slug is required (letters, numbers and dashes).");
  if (!content) errors.push("The post content cannot be empty.");

  const clash = (existingPosts || []).find(
    (post) =>
      post?.slug === slug && String(post?._id) !== String(currentId || "")
  );

  if (clash) {
    errors.push(`The slug "${slug}" is already used by another post.`);
  }

  return {
    values: { title, slug, excerpt, content, coverImage, author, isPublished },
    errors,
  };
};
