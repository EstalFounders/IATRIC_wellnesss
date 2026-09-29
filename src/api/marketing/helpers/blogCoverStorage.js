// Pure helpers for the blog cover cleanup (no Firebase import on purpose).
//
// The Firebase SDK must be imported directly inside the API route: importing it
// through a helper module breaks the dev-server bundle with
// "__webpack_require__.a is not a function" (see pages/api/marketing/blog/index.js).
import { blog_img_folder } from "../../../constant";

/** The blog cover folder this cleanup is allowed to touch (env-scoped). */
export const BLOG_COVER_FOLDER =
  String(blog_img_folder || "metadata/blogImg")
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");

/**
 * Firebase Storage object path for a cover URL, or "" when the URL does not point
 * at a Firebase object (a /public path like "/images/x.jpg", a data: URI or an
 * external image). Supports download URLs, storage.googleapis.com and gs://.
 */
export const blogCoverPathFromUrl = (url) => {
  if (typeof url !== "string") return "";

  const trimmed = url.trim();
  if (!trimmed) return "";

  try {
    if (trimmed.startsWith("gs://")) {
      const rest = trimmed.slice(5); // <bucket>/<path>
      const slash = rest.indexOf("/");
      return slash === -1 ? "" : rest.slice(slash + 1);
    }

    const parsed = new URL(trimmed);

    if (parsed.hostname === "firebasestorage.googleapis.com") {
      // /v0/b/<bucket>/o/<url-encoded path>
      const marker = "/o/";
      const index = parsed.pathname.indexOf(marker);
      return index === -1
        ? ""
        : decodeURIComponent(parsed.pathname.slice(index + marker.length));
    }

    if (parsed.hostname === "storage.googleapis.com") {
      // /<bucket>/<path> - drop the bucket segment
      const parts = parsed.pathname.replace(/^\/+/, "").split("/");
      parts.shift();
      return parts.join("/");
    }
  } catch (error) {
    return "";
  }

  return "";
};

/** True only for objects that live inside our own blog cover folder. */
export const isBlogCoverPath = (objectPath) =>
  Boolean(objectPath) && objectPath.startsWith(`${BLOG_COVER_FOLDER}/`);

