// imageUpload.js
// Uploads are NOT restricted to images: the doctor forms accept any file (a PDF
// certificate, for instance) and `POST` / `PUT /api/addDoctor` store it as it is.
// These helpers only answer "is this file an image?", which decides two optional
// things:
//   * whether the server may run the upload through `resizeImage` (sharp only
//     understands pictures - a PDF would throw), and
//   * whether the browser can render a preview inside an <img>.
// Everything else is uploaded untouched.

export const IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg", // non-standard alias some browsers/OS report for .jpg files
  "image/pjpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/bmp",
  "image/svg+xml",
  "image/avif",
  "image/tiff",
];

export const IMAGE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".jpe",
  ".png",
  ".webp",
  ".gif",
  ".bmp",
  ".svg",
  ".avif",
  ".tif",
  ".tiff",
];

/** `myfile.PNG` -> `.png` */
export function getFileExtension(filename) {
  const name = String(filename || "").trim().toLowerCase();
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "" : name.slice(dot);
}

export function isImageMimeType(mimeType) {
  return IMAGE_MIME_TYPES.includes(
    String(mimeType || "")
      .trim()
      .toLowerCase()
      .split(";")[0]
  );
}

const hasImageExtension = (filename) =>
  IMAGE_EXTENSIONS.includes(getFileExtension(filename));

/**
 * Browser side: a `File` from a dropzone or `<input type="file" />`. Only used to
 * decide whether an <img> preview can be shown; the MIME type wins when the
 * browser reports one, and the extension is the fallback for the empty-type case.
 */
export function isPreviewableImage(file) {
  if (!file) return false;
  const type = String(file.type || "").trim();
  if (type) return type.startsWith("image/");
  return hasImageExtension(file.name);
}

/**
 * Stored Firebase URL (string) for a certificate. The extension is taken from the
 * decoded object path, so a `.pdf` certificate is listed by name instead of being
 * rendered as a broken <img>. Unknown extensions are treated as images.
 */
export function isPreviewableImageUrl(url) {
  if (!url) return false;
  let path = String(url).split(/[?#]/)[0];
  try {
    path = decodeURIComponent(path);
  } catch (error) {
    // A malformed escape sequence: fall back to the raw path.
  }
  const extension = getFileExtension(path);
  return extension ? IMAGE_EXTENSIONS.includes(extension) : true;
}

/** `.../o/certificates%2Fmbbs.pdf?alt=media` -> `mbbs.pdf` */
export function fileNameFromUrl(url) {
  const path = String(url || "").split(/[?#]/)[0];
  let decoded = path;
  try {
    decoded = decodeURIComponent(path);
  } catch (error) {
    // Keep the raw path when it cannot be decoded.
  }
  const name = decoded.split("/").pop() || "";
  return name || "Certificate";
}

/**
 * Server side: a multiparty file part ({ headers, originalFilename }). Only used
 * to decide between "resize" and "store as uploaded".
 */
export function isResizableImage(upload) {
  if (!upload) return false;
  const contentType = upload.headers?.["content-type"];
  if (contentType) return isImageMimeType(contentType);
  return hasImageExtension(upload.originalFilename || upload.path);
}
