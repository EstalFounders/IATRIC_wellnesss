// ManageStaffComp.js
// Super-admin "Manage staff" page: lists every staff member with Edit (modal
// form + optional new photo) and Delete (confirm) actions, backed by
// GET/PUT/DELETE on /api/staff.
import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Table,
  Button,
  Modal,
  Form,
  Alert,
} from "react-bootstrap";
import { api } from "../../../constant";
import ImageUploader from "../../../lib/ImageUploader.js";
import ConfirmModal from "../model/ConfirmModel";
import styles from "./ManageStaff.module.css";

const EMPTY_FORM = {
  name: "",
  jobTitle: "",
  bio: "",
  experience: "",
  education: "",
};

const ManageStaffComp = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  const [showEdit, setShowEdit] = useState(false);
  const [editId, setEditId] = useState("");
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [editPicture, setEditPicture] = useState(null);
  const [editPictureUrl, setEditPictureUrl] = useState("");
  const [removePicture, setRemovePicture] = useState(false);
  const [uploaderKey, setUploaderKey] = useState(0);
  const [fieldErrors, setFieldErrors] = useState({});
  const [saveError, setSaveError] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await fetch(api.staff);
      const data = await res.json();
      setStaffList(data.staff || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const openEdit = (staff) => {
    setEditId(staff._id);
    setEditForm({
      name: staff.name || "",
      jobTitle: staff.jobTitle || "",
      bio: staff.bio || "",
      experience: staff.experience || "",
      education: staff.education || "",
    });
    setEditPicture(null);
    setEditPictureUrl(staff.profilePictureUrl || "");
    setRemovePicture(false);
    setUploaderKey((key) => key + 1);
    setFieldErrors({});
    setSaveError("");
    setShowEdit(true);
  };

  const closeEdit = () => {
    if (saveLoading) return;
    setShowEdit(false);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleEditImagesChange = (id, newImages) => {
    if (id === "profilePicture") {
      setEditPicture(newImages.length > 0 ? newImages[0] : null);
      setRemovePicture(false); // Selecting a new photo cancels removal.
    }
  };

  const handleRemovePicture = () => {
    setRemovePicture(true);
    setEditPicture(null);
    setUploaderKey((key) => key + 1); // Clear the uploader preview.
  };

  const handleUpdate = async () => {
    const errors = {};
    if (!editForm.name.trim()) errors.name = "Name is required";
    if (!editForm.jobTitle.trim()) errors.jobTitle = "Job title is required";
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSaveLoading(true);
    setSaveError("");
    try {
      const formData = new FormData();
      formData.append("name", editForm.name);
      formData.append("jobTitle", editForm.jobTitle);
      formData.append("bio", editForm.bio);
      formData.append("experience", editForm.experience);
      formData.append("education", editForm.education);
      if (editPicture) {
        formData.append("profilePicture", editPicture);
      }
      if (removePicture) {
        formData.append("removeProfilePicture", "true");
      }

      const res = await fetch(`${api.staff}?id=${editId}`, {
        method: "PUT",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setShowEdit(false);
        setNotice(data.message || "Staff member updated successfully");
        fetchStaff();
      } else {
        setSaveError(data.error || "Failed to update staff member");
      }
    } catch (error) {
      console.error(error);
      setSaveError("An error occurred. Please try again later.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`${api.staff}?id=${deleteTarget._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setDeleteTarget(null);
        setNotice(data.message || "Staff member deleted successfully");
        fetchStaff();
      } else {
        setDeleteTarget(null);
        setNotice(data.error || "Failed to delete staff member");
      }
    } catch (error) {
      console.error(error);
      setDeleteTarget(null);
      setNotice("An error occurred. Please try again later.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <Container className={styles.page}>
      <div className={styles.hero}>
        <div>
          <h1 className={styles.heroTitle}>Manage Staff</h1>
          <p className={styles.heroSubtitle}>
            View, edit or remove staff members.
          </p>
        </div>
      </div>

      {notice && (
        <Alert variant="info" dismissible onClose={() => setNotice("")}>
          {notice}
        </Alert>
      )}

      <div className={styles.card}>
        {loading ? (
          <p className={styles.empty}>Loading staff…</p>
        ) : staffList.length === 0 ? (
          <p className={styles.empty}>No staff members yet.</p>
        ) : (
          <Table striped hover responsive className="mb-0">
            <thead>
              <tr>
                <th>Photo</th>
                <th>Name</th>
                <th>Job Title</th>
                <th>Experience</th>
                <th>Education</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {staffList.map((staff) => (
                <tr key={staff._id}>
                  <td>
                    {staff.profilePictureUrl ? (
                      <img
                        src={staff.profilePictureUrl}
                        alt={staff.name}
                        className={styles.thumb}
                      />
                    ) : (
                      <span className={styles.thumbPlaceholder}>—</span>
                    )}
                  </td>
                  <td>{staff.name}</td>
                  <td>{staff.jobTitle}</td>
                  <td>{staff.experience || "—"}</td>
                  <td>{staff.education || "—"}</td>
                  <td className="text-end">
                    <Button
                      size="sm"
                      variant="outline-primary"
                      className="me-2"
                      onClick={() => openEdit(staff)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => setDeleteTarget(staff)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>

      {/* Edit modal */}
      <Modal show={showEdit} onHide={closeEdit} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Staff Member</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Name *</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  isInvalid={!!fieldErrors.name}
                />
                <Form.Control.Feedback type="invalid">
                  {fieldErrors.name}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Job Title *</Form.Label>
                <Form.Control
                  type="text"
                  name="jobTitle"
                  value={editForm.jobTitle}
                  onChange={handleEditChange}
                  isInvalid={!!fieldErrors.jobTitle}
                />
                <Form.Control.Feedback type="invalid">
                  {fieldErrors.jobTitle}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Bio</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="bio"
                  value={editForm.bio}
                  onChange={handleEditChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Experience</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="experience"
                  value={editForm.experience}
                  onChange={handleEditChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Education</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="education"
                  value={editForm.education}
                  onChange={handleEditChange}
                />
              </Form.Group>
            </Col>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Profile Picture</Form.Label>
                {editPictureUrl && !removePicture && (
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <img
                      src={editPictureUrl}
                      alt="Current profile"
                      style={{
                        width: 64,
                        height: 64,
                        objectFit: "cover",
                        borderRadius: "50%",
                      }}
                    />
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={handleRemovePicture}
                    >
                      Remove photo
                    </Button>
                  </div>
                )}
                {removePicture ? (
                  <Form.Text className="d-block text-danger">
                    Photo will be removed on save.
                  </Form.Text>
                ) : (
                  <ImageUploader
                    key={uploaderKey}
                    id="profilePicture"
                    multiple={false}
                    onImagesChange={handleEditImagesChange}
                  />
                )}
              </Form.Group>
            </Col>
          </Row>
          {saveError && <Alert variant="danger">{saveError}</Alert>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeEdit} disabled={saveLoading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdate} disabled={saveLoading}>
            {saveLoading ? "Saving..." : "Save Changes"}
          </Button>
        </Modal.Footer>
      </Modal>

      <ConfirmModal
        show={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete staff member"
        message={`Are you sure you want to delete ${
          deleteTarget?.name || "this staff member"
        }?`}
        confirmLabel={deleteLoading ? "Deleting..." : "Delete"}
        busy={deleteLoading}
      />
    </Container>
  );
};

export default ManageStaffComp;
