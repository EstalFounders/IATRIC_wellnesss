// GET /api/marketing/blog/public - PUBLIC read of the published blog posts.
//   (no query)      -> { ok, posts: [...] }   (newest first, max 20)
//   ?slug=my-post   -> { ok, found, post }
import { dbConnect } from "../../../../src/lib/db";
import { allowMethods } from "../../../../src/api/marketing/helpers/apiHandler";
import {
  findPublishedBlogPostBySlug,
  listPublishedBlogPosts,
} from "../../../../src/api/marketing/helpers/blogQueries";

const PUBLIC_LIMIT = 20;

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET"])) return;

  try {
    await dbConnect();

    res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=300");

    const slug = typeof req.query.slug === "string" ? req.query.slug.trim() : "";

    if (slug) {
      const post = await findPublishedBlogPostBySlug(slug);

      if (!post) {
        return res.status(200).json({ ok: true, found: false, post: null });
      }

      return res.status(200).json({ ok: true, found: true, post });
    }

    const posts = (await listPublishedBlogPosts()).slice(0, PUBLIC_LIMIT);

    return res.status(200).json({ ok: true, posts });
  } catch (error) {
    console.error("marketing/blog/public error:", error);
    return res
      .status(200)
      .json({ ok: true, posts: [], found: false, post: null });
  }
}
