// AddStaffForm.js
// Admin "Add Staff Member" form. Captures name, job title, bio, experience,
// education and a profile-picture upload, then POSTs multipart FormData to
// /api/staff. Validation is client-side (name + job title required) with a
// matching server-side guard.
import React, { useState } from "react";
import { Col, Row, Alert } from "react-bootstrap";
import { api } from "../../../constant";
import ImageUploader from "../../../lib/ImageUploader.js";
import styles from "./AddStaffForm.module.css";

const EMPTY_STAFF = {
  name: "",
  jobTitle: "",
  bio: "",
  experience: "",
  education: "",
};

const AddStaffForm = () => {
  const [form, setForm] = useState(EMPTY_STAFF);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  // Bumped on reset so the <ImageUploader /> remounts and clears its preview.
  const [uploaderKey, setUploaderKey] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleImagesChange = (id, newImages) => {
    if (id === "profilePicture") {
      setProfilePicture(newImages.length > 0 ? newImages[0] : null);
    }
  };

  const handleReset = () => {
    setForm(EMPTY_STAFF);
    setFieldErrors({});
    setServerError("");
    setSuccess("");
    setProfilePicture(null);
    setUploaderKey((key) => key + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setSuccess("");

    const errors = {};
    if (!form.name.trim()) errors.name = "Name is required";
    if (!form.jobTitle.trim()) errors.jobTitle = "Job title is required";
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("jobTitle", form.jobTitle);
      formData.append("bio", form.bio);
      formData.append("experience", form.experience);
      formData.append("education", form.education);
      if (profilePicture) {
        formData.append("profilePicture", profilePicture);
      }

      const res = await fetch(api.staff, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(data.message || "Staff member added successfully");
        setForm(EMPTY_STAFF);
        setProfilePicture(null);
        setUploaderKey((key) => key + 1);
      } else {
        setServerError(data.error || "Failed to add staff member");
      }
    } catch (error) {
      console.error(error);
      setServerError("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div>
          <h1 className={styles.heroTitle}>Add Staff Member</h1>
          <p className={styles.heroSubtitle}>
            Create a new staff profile. Fields marked * are required.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.card} noValidate>
        <Row>
          <Col md={6}>
            <div className={styles.field}>
              <span className={styles.label}>
                Name <span className={styles.req}>*</span>
              </span>
              <input
                className={styles.input}
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Dr. Ananya Sharma"
              />
              {fieldErrors.name && (
                <span className={styles.error}>{fieldErrors.name}</span>
              )}
            </div>
          </Col>

          <Col md={6}>
            <div className={styles.field}>
              <span className={styles.label}>
                Job Title <span className={styles.req}>*</span>
              </span>
              <input
                className={styles.input}
                type="text"
                name="jobTitle"
                value={form.jobTitle}
                onChange={handleChange}
                placeholder="e.g. Senior Cardiologist"
              />
              {fieldErrors.jobTitle && (
                <span className={styles.error}>{fieldErrors.jobTitle}</span>
              )}
            </div>
          </Col>

          <Col md={12}>
            <div className={styles.field}>
              <span className={styles.label}>Bio</span>
              <textarea
                className={styles.textarea}
                name="bio"
                value={form.bio}
                onChange={handleChange}
                placeholder="A short professional bio..."
              />
            </div>
          </Col>

          <Col md={6}>
            <div className={styles.field}>
              <span className={styles.label}>Experience</span>
              <textarea
                className={styles.textarea}
                name="experience"
                value={form.experience}
                onChange={handleChange}
                placeholder="e.g. 12 years in cardiology"
              />
            </div>
          </Col>

          <Col md={6}>
            <div className={styles.field}>
              <span className={styles.label}>Education</span>
              <textarea
                className={styles.textarea}
                name="education"
                value={form.education}
                onChange={handleChange}
                placeholder="e.g. MBBS, MD - Cardiology"
              />
            </div>
          </Col>

          <Col md={12}>
            <div className={styles.field}>
              <span className={styles.label}>Profile Picture</span>
              <ImageUploader
                key={uploaderKey}
                id="profilePicture"
                multiple={false}
                onImagesChange={handleImagesChange}
              />
            </div>
          </Col>
        </Row>

        {serverError && <Alert variant="danger">{serverError}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <div className={styles.actionBar}>
          <button type="button" className={styles.ghostBtn} onClick={handleReset}>
            Reset
          </button>
          <button type="submit" className={styles.primaryBtn} disabled={loading}>
            {loading ? "Adding..." : "Add Staff Member"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddStaffForm;
