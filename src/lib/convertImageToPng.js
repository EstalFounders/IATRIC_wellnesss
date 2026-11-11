// convertImageToPng.js
//
// ONE place that turns an uploaded picture into a real PNG before it is written
// to Firebase Storage. Server-only (it uses `sharp`), so it lives in `src/lib`
// next to the other server helpers - never import it from a component.
//
// Why: the doctor forms accept whatever the browser hands over (JPG, JPEG, WEBP,
// PNG, GIF, AVIF, TIFF, SVG) and the stored object used to keep that format, so
// the same doctor folder held a mix of `.jpg`, `.webp` and extension-less
// objects. Every picture now goes through here and is stored as `image/png`.
//
// Only pictures are converted: the forms also accept PDFs and other documents,
// which must be stored untouched. The caller decides with `isResizableImage`
// (src/customUtils/imageUpload.js) - see `prepareUpload` in pages/api/addDoctor.js.
//
// Usage:
//   import { convertImageToPng } from "../convertImageToPng";
//   const png = await convertImageToPng(buffer, { width: 700, height: 700 });
//
// Throws `ImageConversionError` for an empty / corrupt / unsupported file; the
// API handlers turn that into a friendly 400 (see `isImageConversionError`).

import sharp from "sharp";

/** sharp (libvips) input formats this helper accepts. */
export const CONVERTIBLE_IMAGE_FORMATS = [
  "jpeg",
  "jpg",
  "png",
  "webp",
  "gif",
  "avif",
  "tiff",
  "svg",
];

export const PNG_CONTENT_TYPE = "image/png";
export const PNG_EXTENSION = ".png";

/** One message for every rejected image, so the form can show it verbatim. */
export const UNSUPPORTED_IMAGE_MESSAGE =
  "The image could not be processed. Please upload a valid JPG, PNG or WEBP file.";

/**
 * A corrupt or unsupported picture. `statusCode` is what the API should answer
 * with (400 - the request is what is wrong, not the server).
 */
export class ImageConversionError extends Error {
  constructor(message = UNSUPPORTED_IMAGE_MESSAGE, options = {}) {
    super(message);
    this.name = "ImageConversionError";
    this.statusCode = options.statusCode || 400;
    /** Detected input format, for the logs ("pdf", "unknown", ...). */
    this.originalFormat = options.originalFormat || "";
    if (options.cause) this.cause = options.cause;
  }
}

/** `error instanceof ImageConversionError` without importing the class. */
export function isImageConversionError(error) {
  return error instanceof ImageConversionError || error?.name === "ImageConversionError";
}

/**
 * A document was uploaded where only a picture can work - the profile picture, the
 * digital signature, the stamp. Certificates may be PDFs, these three may not: an
 * `<img>`/`next/image` can never render them, so the panel showed a blank spot.
 * `statusCode` 400 = the request is what is wrong.
 */
export class RequiredImageError extends Error {
  constructor(label = "file") {
    super(
      `The ${label} must be an image (JPG, PNG or WEBP). A PDF or other document cannot be shown as a picture.`
    );
    this.name = "RequiredImageError";
    this.statusCode = 400;
    /** Which slot was rejected, for the logs ("profile picture", ...). */
    this.label = label;
  }
}

export function isRequiredImageError(error) {
  return error instanceof RequiredImageError || error?.name === "RequiredImageError";
}

/**
 * One check for the API handlers: an upload the doctor form must answer with a
 * friendly 400 instead of a 500 (a corrupt picture or a document in an image
 * slot).
 */
export function isUploadRejection(error) {
  return isImageConversionError(error) || isRequiredImageError(error);
}

/**
 * Convert an uploaded picture to PNG.
 *
 * Nothing is resized unless a size is asked for, so by default the original
 * dimensions and aspect ratio are preserved and only the encoding changes
 * (PNG is lossless - the only "compression" is the deflate level below).
 *
 * @param {Buffer|Uint8Array|string} input         file buffer, tmp path or stream
 * @param {object}   [options]
 * @param {number}   [options.width]              target width  (needs `height`)
 * @param {number}   [options.height]             target height (needs `width`)
 * @param {"cover"|"contain"|"inside"|"outside"} [options.fit]
 *                                                sharp fit; "cover" = square crop
 * @param {number}   [options.maxDimension]       longest side limit when no
 *                                                width/height is given; keeps the
 *                                                aspect ratio and never enlarges
 * @param {boolean}  [options.withoutEnlargement] never scale a small picture up
 * @param {number}   [options.compressionLevel]   PNG deflate level 0-9 (default 9)
 * @returns {Promise<Buffer>} PNG bytes
 */
export async function convertImageToPng(input, options = {}) {
  if (!input) {
    throw new ImageConversionError("No image file was received.");
  }

  const {
    width,
    height,
    fit = "cover",
    maxDimension,
    withoutEnlargement = false,
    compressionLevel = 9,
  } = options;

  // Read the header first: a truncated/corrupt file or a PDF renamed to ".jpg"
  // fails here (sharp's `failOn: "error"`) instead of being stored broken.
  let metadata;
  try {
    metadata = await sharp(input, { failOn: "error" }).metadata();
  } catch (error) {
    throw new ImageConversionError(UNSUPPORTED_IMAGE_MESSAGE, { cause: error });
  }

  const format = String(metadata.format || "").toLowerCase();
  if (!CONVERTIBLE_IMAGE_FORMATS.includes(format)) {
    throw new ImageConversionError(UNSUPPORTED_IMAGE_MESSAGE, {
      originalFormat: format || "unknown",
    });
  }

  try {
    // `rotate()` with no argument applies the EXIF orientation, so a portrait
    // photo taken on a phone is not stored sideways - PNG carries no EXIF.
    let pipeline = sharp(input, { failOn: "error" }).rotate();

    if (width && height) {
      pipeline = pipeline.resize(width, height, { fit, withoutEnlargement });
    } else if (maxDimension) {
      pipeline = pipeline.resize({
        width: maxDimension,
        height: maxDimension,
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    return await pipeline
      .png({ compressionLevel, palette: false, adaptiveFiltering: true })
      .toBuffer();
  } catch (error) {
    throw new ImageConversionError(UNSUPPORTED_IMAGE_MESSAGE, {
      cause: error,
      originalFormat: format,
    });
  }
}

export default convertImageToPng;
