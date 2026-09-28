// Client-side Firebase Storage helpers for the marketing panel.
// Uses the shared Firebase app from lib/firebase.js (same as utils.js).
import {
  getDownloadURL,
  ref,
  updateMetadata,
  uploadBytes,
} from "firebase/storage";
import { storage } from "../../lib/firebase";

/**
 * Fixed banner location: every upload overwrites this one object, so the
 * homepage always points at the same path.
 */
export const BANNER_STORAGE_PATH = "metadata/img.png";

/** Blog cover images live here; each upload gets a unique name (no overwrites). */
export const BLOG_IMAGE_FOLDER = "metadata/blogImg";

/**
 * Browsers/CSS never request the banner twice for the same URL, so it can be cached
 * hard: every place that renders it versions the URL with `withCacheBuster(url,
 * lastUpdated)`, which means a replaced image is a different URL (fresh download) and
 * the old one can stay cached for a year. Previously `no-cache` forced a re-download
 * on every visit, which is what made the popup feel slow.
 */
const BANNER_CACHE_CONTROL = "public, max-age=31536000";

/** Decode a File into an <img> element (object URL is revoked either way). */
const loadImageElement = (file) =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new window.Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not read the selected image"));
    };

    image.src = objectUrl;
  });

const canvasToBlob = (canvas, type, quality) =>
  new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });

/**
 * Shrink + re-encode an image in the browser before it is uploaded. A 3 MB phone
 * PNG becomes a ~150-250 KB WebP, which is the real fix for "the popup appears a
 * second late on a slow connection".
 *
 * Best effort by design: any failure (no canvas, unsupported codec, already tiny
 * file) returns the original File so saving in the panel never breaks.
 */
export const optimizeImageFile = async (
  file,
  { maxWidth = 1600, maxHeight = 1600, quality = 0.85 } = {}
) => {
  if (!file || typeof window === "undefined" || !file.type?.startsWith("image/")) {
    return file;
  }

  try {
    const image = await loadImageElement(file);
    const scale = Math.min(
      1,
      maxWidth / image.naturalWidth,
      maxHeight / image.naturalHeight
    );

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));

    const context = canvas.getContext("2d");
    if (!context) return file;

    // White backdrop so transparent PNGs do not turn black in a JPEG fallback.
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    let blob = await canvasToBlob(canvas, "image/webp", quality);
    // Unsupported codec silently falls back to PNG - ask for JPEG instead.
    if (blob && blob.type !== "image/webp") {
      blob = await canvasToBlob(canvas, "image/jpeg", quality);
    }

    // Never upload something bigger than what the user picked.
    if (!blob || blob.size >= file.size) return file;

    const baseName = (file.name || "image").replace(/\.[a-z0-9]+$/i, "") || "image";
    const extension = blob.type === "image/webp" ? "webp" : "jpg";

    return new File([blob], `${baseName}.${extension}`, { type: blob.type });
  } catch (error) {
    return file;
  }
};

/** Upload (overwrite) the homepage banner and return its download URL. */
export const uploadBannerImage = async (file) => {
  if (!file) throw new Error("No file selected");

  // Optimise before uploading: smaller file = faster popup, less Firebase egress.
  const optimised = await optimizeImageFile(file);
  const storageRef = ref(storage, BANNER_STORAGE_PATH);

  const snapshot = await uploadBytes(storageRef, optimised, {
    contentType: optimised.type || "image/png",
    cacheControl: BANNER_CACHE_CONTROL,
  });

  return getDownloadURL(snapshot.ref);
};

/**
 * Apply the long cache headers to the banner that already sits in Storage (objects
 * uploaded before this change carry `no-cache`). Needs write access, so it is only
 * called from the authenticated marketing panel - best effort, never throws.
 */
export const applyBannerCacheMetadata = async () => {
  try {
    await updateMetadata(ref(storage, BANNER_STORAGE_PATH), {
      cacheControl: BANNER_CACHE_CONTROL,
    });
    return true;
  } catch (error) {
    return false;
  }
};

/** Download URL of the fixed banner path, or null when nothing is uploaded yet. */
export const getBannerImageUrl = async () => {
  try {
    return await getDownloadURL(ref(storage, BANNER_STORAGE_PATH));
  } catch (error) {
    return null;
  }
};

/**
 * Upload a blog cover image to Firebase Storage (metadata/blogImg) and return
 * its public download URL. The filename is unique, so covers never overwrite
 * each other.
 */
export const uploadBlogCover = async (file, slug) => {
  if (!file) throw new Error("No file selected");

  const safeSlug =
    (slug || "post").toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 60) || "post";
  const rawExtension = (file.name || "").split(".").pop() || "jpg";
  const extension = rawExtension.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const storageRef = ref(
    storage,
    `${BLOG_IMAGE_FOLDER}/${safeSlug}-${Date.now()}.${extension}`
  );

  const snapshot = await uploadBytes(storageRef, file, {
    contentType: file.type || "image/jpeg",
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
