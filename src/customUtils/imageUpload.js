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

/** Document types the doctor forms may store untouched (see `prepareUpload`). */
export const DOCUMENT_EXTENSIONS = [
  ".pdf",
  ".doc",
  ".docx",
  ".rtf",
  ".odt",
  ".txt",
  ".csv",
  ".xls",
  ".xlsx",
];

/**
 * Only a short, purely alphanumeric suffix counts as an extension. This matters:
 * Firebase object names are built from the doctor's name and are often
 * extension-less, so `.../o/...%2FDr.%20Himansu%20Bhusan%20Naik8d7d3e13-...` used
 * to have everything after the "Dr." dot read as an extension, which made a
 * perfectly good picture look like a document.
 */
const URL_EXTENSION_PATTERN = /^\.[a-z0-9]{1,5}$/;

/**
 * The decoded object path of a stored file.
 * `https://firebasestorage.googleapis.com/v0/b/<bucket>/o/images%2FdoctorPicture%2FDr.%20X-uuid?alt=media&token=...`
 * -> `images/doctorPicture/Dr. X-uuid`
 */
export function storageObjectPath(url) {
  const raw = String(url || "")
    .split(/[?#]/)[0]
    .trim();
  if (!raw) return "";

  const match = raw.match(/\/o\/(.+)$/);
  let path = match ? match[1] : raw;

  try {
    path = decodeURIComponent(path);
  } catch (error) {
    // A malformed escape sequence: keep the raw path.
  }
  return path;
}

/** The real extension of a stored file URL ("" when the object has none). */
export function getUrlExtension(url) {
  const extension = getFileExtension(storageObjectPath(url));
  return URL_EXTENSION_PATTERN.test(extension) ? extension : "";
}

/**
 * Stored Firebase URL (string) for a picture. A picture can be rendered inside an
 * <img> - a `.pdf` certificate cannot, so it is listed by name instead of showing
 * a broken image. An object with no recognisable extension is treated as a
 * picture: the doctor documents stored before the PNG conversion are JPEGs with a
 * name like `Dr. X c29d8381-...`.
 */
export function isPreviewableImageUrl(url) {
  const extension = getUrlExtension(url);
  return extension ? IMAGE_EXTENSIONS.includes(extension) : Boolean(url);
}

/** `true` for a stored PDF, whatever the query string looks like. */
export function isPdfUrl(url) {
  return getUrlExtension(url) === ".pdf";
}

/**
 * What a stored document URL is, for the render branches:
 * `"image"` (or an unknown/extension-less object), `"pdf"` or `"document"`.
 */
export function documentKind(url) {
  if (!url) return "document";
  const extension = getUrlExtension(url);
  if (!extension) return "image";
  if (IMAGE_EXTENSIONS.includes(extension)) return "image";
  if (extension === ".pdf") return "pdf";
  return "document";
}

/** `.../o/certificates%2Fmbbs.pdf?alt=media` -> `mbbs.pdf` */
export function fileNameFromUrl(url) {
  const name = storageObjectPath(url).split("/").pop() || "";
  return name || "Certificate";
}

/**
 * Same as `fileNameFromUrl`, without the uuid the upload appends, so a chip can
 * read `Dr. Himansu Bhusan Naik.pdf` instead of `...Naik8d7d3e13-533b-...pdf`.
 */
export function displayFileNameFromUrl(url, fallback = "Document") {
  const name = fileNameFromUrl(url)
    .replace(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
      ""
    )
    .replace(/[\s._-]+$/g, "")
    .trim();
  return name || fallback;
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
