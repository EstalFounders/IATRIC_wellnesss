import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button, Form, Modal } from "react-bootstrap";
import { api, color_schema, imageBlurDataUrl } from "../../../constant";
import { POPUP_FALLBACK_IMAGE } from "../../../../data/popupBanner";
import { uploadBannerImage } from "../../../services/firebaseStorage";
import styles from "../css/marketingPanel.module.css";

const MAX_FILE_MB = 5;

/** Upload / edit dialog for the homepage banner (overwrites metadata/img.png). */
const EditBannerModal = ({ show, banner, onHide, onSaved }) => {
  const [altText, setAltText] = useState("HealthPath");
  const [href, setHref] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [pendingFile, setPendingFile] = useState(null);
  const [urlInput, setUrlInput] = useState("");
  const [preview, setPreview] = useState("");
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!show) return;

    setError("");
    setAltText(banner?.altText || "HealthPath");
    setHref(banner?.href || "");
    setIsActive(banner?.isActive !== false);
    setPendingFile(null);
    setUrlInput(banner?.bannerUrl || "");
    setPreview(banner?.bannerUrl || "");
  }, [show, banner]);

  // Release the local object URL when the modal closes/replaces the file.
  useEffect(
    () => () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    },
    [preview]
  );

  const pickFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Choose a PNG or JPG image file.");
      return;
    }

    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      setError(`The image must be smaller than ${MAX_FILE_MB} MB.`);
      return;
    }

    setError("");
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    setPendingFile(file);
    setUrlInput("");
    setPreview(URL.createObjectURL(file));
  };

  const handleInputChange = (event) => pickFile(event.target.files?.[0]);

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    pickFile(event.dataTransfer.files?.[0]);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      // 1) upload/overwrite metadata/img.png in Firebase Storage when a new file was chosen
      let bannerUrl = urlInput || banner?.bannerUrl || "";

      if (pendingFile) {
        setUploading(true);
        bannerUrl = await uploadBannerImage(pendingFile);
        setUploading(false);
      }

      if (!bannerUrl) {
        setError("Choose an image to upload first.");
        return;
      }

      // 2) store the download URL + metadata in marketingPanel
      const response = await fetch(api.marketingBanner, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bannerUrl, altText, href, isActive }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.ok) {
        setError(data.message || "Could not save the banner.");
        return;
      }

      onSaved(
        data.liveNow
          ? "Banner uploaded and live on the homepage."
          : "Banner saved (marked inactive, so the homepage hides it)."
      );
      onHide();
    } catch (saveError) {
      setUploading(false);
      setError(
        `Save failed (${saveError.message}). If the upload is blocked by Firebase Storage rules, paste a public image URL instead.`
      );
    } finally {
      setSaving(false);
    }
  };

  const busy = saving || uploading;

  return (
    <Modal
      show={show}
      onHide={busy ? undefined : onHide}
      centered
      backdrop="static"
      keyboard={!busy}
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title className={styles.cardTitle}>
          Homepage banner — upload image
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSave}>
        <Modal.Body>
          {error && <p className={styles.error}>{error}</p>}

          <div
            role="button"
            tabIndex={0}
            aria-label="Drop a banner image or click to choose a file"
            onClick={() => !busy && fileInputRef.current?.click()}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                if (!busy) fileInputRef.current?.click();
              }
            }}
            onDragOver={(event) => {
              event.preventDefault();
              if (!busy) setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            style={{
              border: `2px dashed ${dragging ? color_schema.green : "#cdd5c4"}`,
              background: dragging ? "#eef3e6" : "#fafbf8",
              borderRadius: "12px",
              padding: "18px",
              textAlign: "center",
              cursor: busy ? "not-allowed" : "pointer",
              marginBottom: "14px",
            }}
          >
            <Image
              placeholder="blur"
              blurDataURL={imageBlurDataUrl}
              src={preview || POPUP_FALLBACK_IMAGE}
              alt="Banner preview"
              width={420}
              height={208}
              className={styles.previewImg}
              unoptimized
            />
            <p className={styles.muted} style={{ marginBottom: 0 }}>
              {uploading
                ? "Uploading to Firebase Storage…"
                : pendingFile
                ? `Ready to upload: ${pendingFile.name}`
                : "Drag & drop a PNG/JPG here, or click to choose a file"}
            </p>
            <span className={styles.counter}>
              Saving overwrites <code>/metadata/img.png</code> in Firebase Storage
              (max {MAX_FILE_MB} MB).
            </span>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/*"
            onChange={handleInputChange}
            disabled={busy}
            style={{ display: "none" }}
          />

          <Form.Group className="mb-3" controlId="banner-alt-text">
            <Form.Label className={styles.fieldLabel}>Alt text</Form.Label>
            <Form.Control
              size="sm"
              value={altText}
              onChange={(event) => setAltText(event.target.value)}
              placeholder="HealthPath"
              disabled={busy}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="banner-link">
            <Form.Label className={styles.fieldLabel}>
              Link when clicked (optional)
            </Form.Label>
            <Form.Control
              size="sm"
              value={href}
              onChange={(event) => setHref(event.target.value)}
              placeholder="/appointment or https://…"
              disabled={busy}
            />
            <span className={styles.counter}>
              Clicking the banner opens this link without closing the popup.
            </span>
          </Form.Group>

          <Form.Group className="mb-3" controlId="banner-image-url">
            <Form.Label className={styles.fieldLabel}>
              Image URL (only if you cannot upload)
            </Form.Label>
            <Form.Control
              size="sm"
              value={urlInput}
              onChange={(event) => {
                setUrlInput(event.target.value);
                setPendingFile(null);
              }}
              placeholder="https://firebasestorage.googleapis.com/…"
              disabled={busy}
            />
            <span className={styles.counter}>
              Filled automatically after an upload; paste a URL to use an image that
              is already hosted.
            </span>
          </Form.Group>

          <Form.Group controlId="banner-active">
            <Form.Check
              id="banner-active"
              type="switch"
              label="Active (show the popup on the homepage)"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
              disabled={busy}
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button
            size="sm"
            variant="outline-secondary"
            onClick={onHide}
            disabled={busy}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            type="submit"
            disabled={busy}
            style={{ backgroundColor: color_schema.green, border: "none" }}
          >
            {uploading ? "Uploading…" : saving ? "Saving…" : "Save & Replace"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default EditBannerModal;
