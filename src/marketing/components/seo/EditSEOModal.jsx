import React, { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { api, color_schema } from "../../../constant";
import {
  identifierToPath,
  MARKETING_PAGES,
  PAGE_IDENTIFIERS,
  SEO_LIMITS,
} from "../../../api/marketing/utils/seoPayload";
import styles from "../css/marketingPanel.module.css";

const emptyForm = (pageIdentifier = PAGE_IDENTIFIERS[0]) => ({
  pageIdentifier,
  pageTitle: "",
  seoKeywords: "",
  metaDescription: "",
  isActive: true,
});

/** Create / edit dialog for one SEO entry (a marketingPanel document). */
const EditSEOModal = ({ show, entry, onHide, onSaved }) => {
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!show) return;

    setError("");
    setForm(
      entry
        ? {
            pageIdentifier: entry.pageIdentifier || PAGE_IDENTIFIERS[0],
            pageTitle: entry.pageTitle || "",
            seoKeywords: (entry.seoKeywords || []).join(", "),
            metaDescription: entry.metaDescription || "",
            isActive: entry.isActive !== false,
          }
        : emptyForm()
    );
  }, [show, entry]);

  const set = (field) => (event) => {
    const value =
      event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      const response = await fetch(api.marketingSeo, {
        method: entry ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry ? { ...form, _id: entry._id } : form),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.ok) {
        setError(data.message || "Could not save the entry.");
        return;
      }

      const label =
        MARKETING_PAGES[form.pageIdentifier]?.label || form.pageIdentifier;
      onSaved(entry ? `Updated the entry for ${label}.` : `Created the entry for ${label}.`);
      onHide();
    } catch (err) {
      setError("Could not reach the server. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const counterClass = (length, limit) =>
    `${styles.counter}${length > limit ? ` ${styles.counterWarn}` : ""}`;

  return (
    <Modal
      show={show}
      onHide={saving ? undefined : onHide}
      centered
      backdrop="static"
      keyboard={!saving}
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title className={styles.cardTitle}>
          {entry ? "Edit SEO entry" : "Add SEO entry"}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <p className={styles.error}>{error}</p>}

          <Form.Group className="mb-3" controlId="seo-page-identifier">
            <Form.Label className={styles.fieldLabel}>Page</Form.Label>
            {/* react-bootstrap 1.6 has no Form.Select - use Form.Control as="select" */}
            <Form.Control
              as="select"
              value={form.pageIdentifier}
              onChange={set("pageIdentifier")}
              disabled={saving}
            >
              {PAGE_IDENTIFIERS.map((identifier) => (
                <option key={identifier} value={identifier}>
                  {MARKETING_PAGES[identifier].label} (
                  {MARKETING_PAGES[identifier].path})
                </option>
              ))}
            </Form.Control>
            <span className={styles.counter}>
              Applied to {identifierToPath(form.pageIdentifier) || "—"}
            </span>
          </Form.Group>

          <Form.Group className="mb-3" controlId="seo-page-title">
            <Form.Label className={styles.fieldLabel}>
              Page title (used as the meta title)
            </Form.Label>
            <Form.Control
              size="sm"
              value={form.pageTitle}
              onChange={set("pageTitle")}
              maxLength={SEO_LIMITS.title}
              placeholder="HealthPath | One-stop healthcare"
              disabled={saving}
              required
            />
            <span className={counterClass(form.pageTitle.length, SEO_LIMITS.title)}>
              {form.pageTitle.length}/{SEO_LIMITS.title}
            </span>
          </Form.Group>

          <Form.Group className="mb-3" controlId="seo-keywords">
            <Form.Label className={styles.fieldLabel}>
              SEO keywords (comma separated)
            </Form.Label>
            <Form.Control
              size="sm"
              value={form.seoKeywords}
              onChange={set("seoKeywords")}
              placeholder="health, wellness, doctor consultation"
              disabled={saving}
            />
            <span className={styles.counter}>
              max {SEO_LIMITS.keywords} keywords
            </span>
          </Form.Group>

          <Form.Group className="mb-3" controlId="seo-meta-description">
            <Form.Label className={styles.fieldLabel}>Meta description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              size="sm"
              value={form.metaDescription}
              onChange={set("metaDescription")}
              maxLength={SEO_LIMITS.description}
              placeholder="Optional meta description"
              disabled={saving}
            />
            <span
              className={counterClass(
                form.metaDescription.length,
                SEO_LIMITS.description
              )}
            >
              {form.metaDescription.length}/{SEO_LIMITS.description}
            </span>
          </Form.Group>

          <Form.Group controlId="seo-active">
            <Form.Check
              id="seo-active"
              type="switch"
              label="Published (applied to the live page)"
              checked={form.isActive}
              onChange={set("isActive")}
              disabled={saving}
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button
            size="sm"
            variant="outline-secondary"
            onClick={onHide}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            type="submit"
            disabled={saving}
            style={{ backgroundColor: color_schema.green, border: "none" }}
          >
            {saving ? "Saving…" : "Save entry"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default EditSEOModal;
