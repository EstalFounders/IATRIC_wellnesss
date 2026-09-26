// /api/marketing/blog - blog CRUD for the marketing panel (session required).
//   GET             list every post (newest first)
//   POST            create a post
//   PUT             update a post by _id (full form or just { isPublished })
//   DELETE ?id=...  delete a post by _id
import { dbConnect } from "../../../../src/lib/db";
import { allowMethods } from "../../../../src/api/marketing/helpers/apiHandler";
import { requireMarketingAuth } from "../../../../src/api/marketing/helpers/requireMarketingAuth";
import {
  createBlogPost,
  deleteBlogPost,
  listBlogPosts,
  updateBlogPost,
} from "../../../../src/api/marketing/helpers/blogQueries";
import { sanitizeBlogPayload } from "../../../../src/api/marketing/utils/blogPayload";

export default requireMarketingAuth(async (req, res) => {
  if (!allowMethods(req, res, ["GET", "POST", "PUT", "DELETE"])) return;

  await dbConnect();

  const author = req.marketingSession?.username || "marketing";

  try {
    if (req.method === "GET") {
      return res.status(200).json({ ok: true, posts: await listBlogPosts() });
    }

    if (req.method === "POST") {
      const existingPosts = await listBlogPosts();
      const { values, errors } = sanitizeBlogPayload(req.body, { existingPosts });

      if (errors.length) {
        return res.status(400).json({ ok: false, message: errors.join(" ") });
      }

      const post = await createBlogPost(values, author);
      return res.status(201).json({ ok: true, post });
    }

    if (req.method === "PUT") {
      const { _id } = req.body || {};

      if (!_id) {
        return res.status(400).json({ ok: false, message: "Missing post id." });
      }

      const hasFormFields =
        req.body.title !== undefined || req.body.content !== undefined;

      let values = {};

      if (hasFormFields) {
        const existingPosts = await listBlogPosts();
        const sanitized = sanitizeBlogPayload(req.body, {
          existingPosts,
          currentId: _id,
        });

        if (sanitized.errors.length) {
          return res
            .status(400)
            .json({ ok: false, message: sanitized.errors.join(" ") });
        }

        values = sanitized.values;
      } else if (typeof req.body.isPublished === "boolean") {
        values = { isPublished: req.body.isPublished };
      }

      if (!Object.keys(values).length) {
        return res.status(400).json({ ok: false, message: "Nothing to update." });
      }

      const post = await updateBlogPost(_id, values, author);

      if (!post) {
        return res.status(404).json({ ok: false, message: "Post not found." });
      }

      return res.status(200).json({ ok: true, post });
    }

    // DELETE
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ ok: false, message: "Missing post id." });
    }

    const post = await deleteBlogPost(id, author);

    if (!post) {
      return res.status(404).json({ ok: false, message: "Post not found." });
    }

    return res.status(200).json({ ok: true, deleted: post });
  } catch (error) {
    console.error("marketing/blog error:", error);
    return res.status(500).json({
      ok: false,
      message: error.message || "Blog request failed.",
    });
  }
});
