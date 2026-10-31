// POST /api/doctor/upload-avatar
//
// multipart/form-data:
//   profilePicture  (file, required)  the photo picked in the Doctor Panel
//   doctorId        (text, optional)  used in the storage filename
//
// Plain, non-AI uploader. Stores the photo at
// `images/doctorPicture/<doctorId|doctor>-<timestamp>.<ext>` (the same folder and
// 700x700 shape pages/api/addDoctor.js uses) and returns the public Firebase URL.
// The Doctor Panel puts that URL into its approval request - previously the File
// itself went into the JSON body, where it serialised to "{}" and the new photo
// was silently dropped.
//
// No database writes and no file deletions happen here: the doctor keeps their
// live photo until a super-admin approves the change request.
import multiparty from "multiparty";
import fs from "fs";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../../lib/firebase";
import { resizeImage } from "../../../src/components/Common/ResizeImage";
import { profilePicture_img_path } from "../../../src/constant";
import {
  getFileExtension,
  isResizableImage,
} from "../../../src/customUtils/imageUpload";

export const config = {
  api: {
    bodyParser: false,
  },
};

const AVATAR_SIZE = 700;
const MAX_BYTES = Number(process.env.AVATAR_MAX_UPLOAD_BYTES || 8 * 1024 * 1024);
// Extension used when the browser does not send a useful content type. The
// uploader accepts ANY file type (the doctor forms do), resizing is simply
// skipped for anything that is not an image.
const EXTENSION_BY_TYPE = {
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const storageFolder = () =>
  String(process.env.AVATAR_STORAGE_FOLDER || profilePicture_img_path)
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");

const parseMultipart = (req) =>
  new Promise((resolve, reject) => {
    const form = new multiparty.Form({
      maxFilesSize: MAX_BYTES,
      maxFieldsSize: 64 * 1024,
    });

    form.parse(req, (error, fields, files) =>
      error ? reject(error) : resolve({ fields, files })
    );
  });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  // Optional shared-secret guard - dormant unless AVATAR_API_TOKEN is configured.
  const expectedToken = process.env.AVATAR_API_TOKEN;
  if (expectedToken && req.headers["x-avatar-token"] !== expectedToken) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }

  let parsed;

  try {
    parsed = await parseMultipart(req);
  } catch (error) {
    // multiparty reports "maximum file length exceeded" (or "maxFilesSize exceeded").
    const tooLarge = /max(imum)? ?(file)? ?(length|size)/i.test(String(error.message));
    return res.status(tooLarge ? 413 : 400).json({
      ok: false,
      error: tooLarge
        ? `The photo must be smaller than ${Math.round(MAX_BYTES / (1024 * 1024))} MB`
        : `Could not read the upload: ${error.message}`,
    });
  }

  const file = parsed.files?.profilePicture?.[0];

  if (!file) {
    return res
      .status(400)
      .json({ ok: false, error: 'Attach the photo as the "profilePicture" field' });
  }

  const contentType = String(
    file.headers?.["content-type"] || "application/octet-stream"
  ).toLowerCase();

  try {
    const fileBuffer = fs.readFileSync(file.path);
    // Images are squared to AVATAR_SIZE; any other file is stored unchanged.
    const payload = isResizableImage(file)
      ? await resizeImage(fileBuffer, AVATAR_SIZE, AVATAR_SIZE)
      : fileBuffer;

    const doctorId = String(parsed.fields?.doctorId?.[0] || "").replace(/[^a-zA-Z0-9_-]/g, "");
    const extension =
      EXTENSION_BY_TYPE[contentType] ||
      getFileExtension(file.originalFilename).slice(1) ||
      "bin";
    const storagePath = `${storageFolder()}/${doctorId || "doctor"}-${Date.now()}.${extension}`;
    const storageRef = ref(storage, storagePath);

    await uploadBytes(storageRef, payload, {
      contentType,
      // Filenames are unique per upload, so the file can be cached hard.
      cacheControl: "public, max-age=31536000",
    });

    const url = await getDownloadURL(storageRef);
    console.log("[upload-avatar] stored", storagePath);

    return res.status(200).json({ ok: true, url, storagePath });
  } catch (error) {
    console.error("[upload-avatar] failed:", error);
    return res.status(500).json({ ok: false, error: error.message });
  } finally {
    try {
      fs.unlinkSync(file.path);
    } catch (error) {
      /* temp file cleanup is best effort */
    }
  }
}
