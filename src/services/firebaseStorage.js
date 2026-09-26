// Client-side Firebase Storage helpers for the marketing panel.
// Uses the shared Firebase app from lib/firebase.js (same as utils.js).
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../../lib/firebase";

/**
 * Fixed banner location: every upload overwrites this one object, so the
 * homepage always points at the same path.
 */
export const BANNER_STORAGE_PATH = "metadata/img.png";

/** Upload (overwrite) the homepage banner and return its download URL. */
export const uploadBannerImage = async (file) => {
  if (!file) throw new Error("No file selected");

  const storageRef = ref(storage, BANNER_STORAGE_PATH);
  const metadata = {
    contentType: file.type || "image/png",
    // Replaced images must not be served from the CDN cache.
    cacheControl: "public, max-age=0, no-cache",
  };

  const snapshot = await uploadBytes(storageRef, file, metadata);
  return getDownloadURL(snapshot.ref);
};

/** Download URL of the fixed banner path, or null when nothing is uploaded yet. */
export const getBannerImageUrl = async () => {
  try {
    return await getDownloadURL(ref(storage, BANNER_STORAGE_PATH));
  } catch (error) {
    return null;
  }
};

/** Upload a blog cover image and return its download URL. */
export const uploadBlogCover = async (file, slug) => {
  if (!file) throw new Error("No file selected");

  const safeSlug = (slug || "post").replace(/[^a-z0-9-]/gi, "").slice(0, 60) || "post";
  const extension = (file.name || "").split(".").pop() || "png";
  const storageRef = ref(
    storage,
    `metadata/blog/${safeSlug}-${Date.now()}.${extension}`
  );

  const snapshot = await uploadBytes(storageRef, file, {
    contentType: file.type || "image/png",
    cacheControl: "public, max-age=86400",
  });

  return getDownloadURL(snapshot.ref);
};

/** Append a version query so a replaced image bypasses the browser/CDN cache. */
export const withCacheBuster = (url, version) => {
  if (!url) return "";

  const stamp = version ? new Date(version).getTime() : Date.now();
  if (!stamp) return url;

  return `${url}${url.includes("?") ? "&" : "?"}v=${stamp}`;
};
