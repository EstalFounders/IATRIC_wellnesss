// firebaseStoragePath.js
// Pure helpers that map a stored document field (a Firebase Storage download URL)
// back to the Storage object path, so server routes can delete the object after
// the reference has been removed from MongoDB.
//
// Deliberately free of any Firebase import: importing the SDK through a helper
// module breaks the dev-server bundle ("__webpack_require__.a is not a function"),
// so the routes import `firebase/storage` / `firebase-admin` themselves. Same
// constraint as src/api/marketing/helpers/blogCoverStorage.js.

/**
 * Firebase Storage object path for a stored URL.
 *
 * Accepted shapes (all produced by `getDownloadURL` or pasted by an admin):
 *   gs://<bucket>/<path>
 *   https://firebasestorage.googleapis.com/v0/b/<bucket>/o/<url-encoded path>?alt=media&token=…
 *   https://storage.googleapis.com/<bucket>/<path>
 *   <path>                       (a bare object path in the default bucket)
 *
 * Returns "" for anything that does not point at a Storage object - an empty
 * value, a /public asset ("/images/x.pdf"), a data:/blob: URI or an external
 * https link - so a caller never attempts to delete something it cannot address
 * (the Firebase SDK throws `storage/invalid-url` on a foreign host).
 */
export const firebaseStoragePathFromUrl = (url) => {
  if (typeof url !== "string") return "";

  const trimmed = url.trim();
  if (!trimmed) return "";

  if (trimmed.startsWith("gs://")) {
    const rest = trimmed.slice(5); // <bucket>/<path>
    const slash = rest.indexOf("/");
    return slash === -1 ? "" : rest.slice(slash + 1).split(/[?#]/)[0];
  }

  // A bare object path (legacy rows / the import sheet) - never a /public file,
  // which starts with a slash, and never an unparsable value.
  if (!/^[A-Za-z][A-Za-z0-9+.-]*:/.test(trimmed)) {
    const path = trimmed.replace(/^\/+/, "").split(/[?#]/)[0];
    return trimmed.startsWith("/") ? "" : path;
  }

  try {
    const parsed = new URL(trimmed);

    if (
      parsed.hostname === "firebasestorage.googleapis.com" ||
      parsed.hostname === "firebasestorage.app"
    ) {
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

/**
 * Bucket name from a `gs://<bucket>` reference ("gs://x.appspot.com" ->
 * "x.appspot.com"), or "" when the value is not a gs:// URL.
 */
export const firebaseBucketName = (bucketUrl) =>
  typeof bucketUrl === "string" && bucketUrl.startsWith("gs://")
    ? bucketUrl.slice(5).replace(/\/+$/, "")
    : "";
