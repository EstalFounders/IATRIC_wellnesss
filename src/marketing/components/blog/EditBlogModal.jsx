import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button, Form, Modal } from "react-bootstrap";
import { api, color_schema } from "../../../constant";
import { uploadBlogCover } from "../../../services/firebaseStorage";
import { BLOG_LIMITS, slugify } from "../../../api/marketing/utils/blogPayload";
import styles from "../css/marketingPanel.module.css";

const emptyForm = () => ({
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImage: "",
  author: "Marketing Team",
  isPublished: true,
});

/** Create / edit dialog for one blog post. */
const EditBlogModal = ({ show, post, onHide, onSaved }) => {
  const [form, setForm] = useState(emptyForm());
  const [slugTouched, setSlugTouched] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!show) return;

    setError("");
    setSlugTouched(Boolean(post));
    setForm(
      post
        ? {
            title: post.title || "",
            slug: post.slug || "",
            excerpt: post.excerpt || "",
            content: post.content || "",
            coverImage: post.coverImage || "",
            author: post.author || "Marketing Team",
            isPublished: post.isPublished !== false,
          }
        : emptyForm()
    );
  }, [show, post]);

  const setField = (field, value) => {
    setForm((previous) => {
      const next = { ...previous, [field]: value };

      // Keep the slug in sync with the title until the user edits the slug.
      if (field === "title" && !slugTouched) next.slug = slugify(value);

      return next;
    });
  };

  const handleCoverUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);

    try {
      const url = await uploadBlogCover(file, form.slug || form.title);
      setField("coverImage", url);
    } catch (uploadError) {
      setError(
        `Cover upload failed (${uploadError.message}). You can paste an image URL instead.`
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      const response = await fetch(api.marketingBlog, {
        method: post ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(post ? { ...form, _id: post._id } : form),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.ok) {
        setError(data.message || "Could not save the post.");
        return;
      }

      onSaved(post ? "Post updated." : "Post created.");
      onHide();
    } catch (saveError) {
      setError("Could not reach the server. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const busy = saving || uploading;
  const slugPreview = form.slug || slugify(form.title);

  return (
    <Modal
      show={show}
      onHide={busy ? undefined : onHide}
      centered
      backdrop="static"
      keyboard={!busy}
      size="lg"
      scrollable
    >
      <Modal.Header closeButton>
        <Modal.Title className={styles.cardTitle}>
          {post ? "Edit post" : "New blog post"}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <p className={styles.error}>{error}</p>}

          <Form.Group className="mb-3" controlId="blog-title">
            <Form.Label className={styles.fieldLabel}>Title</Form.Label>
            <Form.Control
              size="sm"
              value={form.title}
              onChange={(event) => setField("title", event.target.value)}
              maxLength={BLOG_LIMITS.title}
              placeholder="5 signs you should see a physiotherapist"
              disabled={busy}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="blog-slug">
            <Form.Label className={styles.fieldLabel}>Slug (URL)</Form.Label>
            <Form.Control
              size="sm"
              value={form.slug}
              onChange={(event) => {
                setSlugTouched(true);
                setField("slug", slugify(event.target.value));
              }}
              placeholder="5-signs-you-should-see-a-physiotherapist"
              disabled={busy}
            />
            <span className={styles.counter}>
              Link: <code>/blog/{slugPreview || "…"}</code>
            </span>
          </Form.Group>

          <Form.Group className="mb-3" controlId="blog-excerpt">
            <Form.Label className={styles.fieldLabel}>
              Excerpt (preview text)
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              size="sm"
              value={form.excerpt}
              onChange={(event) => setField("excerpt", event.target.value)}
              maxLength={BLOG_LIMITS.excerpt}
              placeholder="Short summary shown in the blog list"
              disabled={busy}
            />
            <span className={styles.counter}>
              {form.excerpt.length}/{BLOG_LIMITS.excerpt}
            </span>
          </Form.Group>

          <Form.Group className="mb-3" controlId="blog-content">
            <Form.Label className={styles.fieldLabel}>Content</Form.Label>
            <Form.Control
              as="textarea"
              rows={8}
              size="sm"
              value={form.content}
              onChange={(event) => setField("content", event.target.value)}
              maxLength={BLOG_LIMITS.content}
              placeholder="Write the post. Blank lines start a new paragraph."
              disabled={busy}
              required
            />
            <span className={styles.counter}>
              {form.content.length}/{BLOG_LIMITS.content}
            </span>
          </Form.Group>

          <Form.Group className="mb-3" controlId="blog-cover-url">
            <Form.Label className={styles.fieldLabel}>Cover image</Form.Label>

            {/* Preview only exists once an image was uploaded/pasted. */}
            {form.coverImage ? (
              <Image
                src={form.coverImage}
                alt="Cover preview"
                width={420}
                height={208}
                className={styles.previewImg}
                unoptimized
              />
            ) : (
              <div className={styles.coverEmpty}>
                No cover image selected — the preview appears here after you upload a
                file or paste a URL.
              </div>
            )}

            <Form.Control
              type="file"
              accept="image/png,image/jpeg,image/*"
              onChange={handleCoverUpload}
              disabled={busy}
              className="mb-2"
            />
            <Form.Control
              size="sm"
              value={form.coverImage}
              onChange={(event) => setField("coverImage", event.target.value)}
              placeholder="https://firebasestorage.googleapis.com/…"
              disabled={busy}
            />
            <span className={styles.counter}>
              {uploading
                ? "Uploading cover to Firebase Storage…"
                : "Uploads to metadata/blog/ in Firebase Storage, or paste a URL."}
            </span>
          </Form.Group>

          <Form.Group className="mb-3" controlId="blog-author">
            <Form.Label className={styles.fieldLabel}>Author</Form.Label>
            <Form.Control
              size="sm"
              value={form.author}
              onChange={(event) => setField("author", event.target.value)}
              placeholder="Marketing Team"
              disabled={busy}
            />
          </Form.Group>

          <Form.Group controlId="blog-published">
            <Form.Check
              id="blog-published"
              type="switch"
              label="Published (visible on the website)"
              checked={form.isPublished}
              onChange={(event) => setField("isPublished", event.target.checked)}
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
            {uploading ? "Uploading…" : saving ? "Saving…" : "Save post"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default EditBlogModal;
