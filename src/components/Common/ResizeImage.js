// utils/resizeImage.js
import sharp from "sharp";

/**
 * Resize an uploaded image on the server.
 *
 * `options` is passed straight to sharp's `.resize()`. It is optional so the
 * existing callers (doctor avatars, certificates) keep sharp's default
 * `fit: "cover"` square crop.
 *
 * Callers that must NOT lose part of the picture - the nursing-staff photo, for
 * example - pass `{ fit: "inside", withoutEnlargement: true }` so the frame is
 * preserved instead of being cropped to a square.
 */
export async function resizeImage(file, width, height, options = {}) {
  try {
    const resizedImageBuffer = await sharp(file)
      .resize(width, height, options)
      .toBuffer();
    return resizedImageBuffer;
  } catch (error) {
    console.error("Error resizing image:", error);
    throw error;
  }
}
