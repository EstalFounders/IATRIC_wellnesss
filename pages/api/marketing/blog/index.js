// /api/marketing/blog - blog CRUD for the marketing panel (session required).
//   GET             list every post (newest first)
//   POST            create a post
//   PUT             update a post by _id (full form or just { isPublished })
//   DELETE ?id=...  delete a post by _id (also removes its Firebase cover image)
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
import {
  BLOG_COVER_FOLDER,
  blogCoverPathFromUrl,
} from "../../../../src/api/marketing/helpers/blogCoverStorage";
// Firebase is imported directly here (not through a helper module): loading it
// indirectly breaks the dev-server bundle with
// "__webpack_require__.a is not a function".
import { ref, deleteObject } from "firebase/storage";
import { storage } from "../../../../lib/firebase";

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

    // The record is already removed, so the cover cleanup can never block the
    // response: a foreign URL, a missing file or a Storage error only logs a
    // warning. The path is parsed + guarded to the blog cover folder first.
    let coverDeleted = false;
    const coverPath = blogCoverPathFromUrl(post.coverImage);

    if (coverPath && coverPath.startsWith(`${BLOG_COVER_FOLDER}/`)) {
      try {
        await deleteObject(ref(storage, coverPath));
        coverDeleted = true;
      } catch (error) {
        console.warn(
          "[marketing/blog] could not delete the cover image:",
          coverPath,
          error.message
        );
      }
    }

    return res.status(200).json({ ok: true, deleted: post, coverDeleted });
  } catch (error) {
    console.error("marketing/blog error:", error);
    return res.status(500).json({
      ok: false,
      message: error.message || "Blog request failed.",
    });
  }
});
