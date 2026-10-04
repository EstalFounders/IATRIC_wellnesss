import React, { useState, useEffect } from "react";
import styles from "./css/ServiceOffered.module.css";
import { MdDelete, MdEdit } from "react-icons/md";
import { api, serviceCategoryType } from "../../constant";
import { Button } from "react-bootstrap";
import { useSelector } from "react-redux";

// Blank shape of the "Add New Service" form. The tab-1 copy fields
// (image / subheading / description + their Hindi counterparts) are optional but
// render on the homepage speciality tabs.
const EMPTY_SERVICE = {
  name: "",
  description: "",
  subheading: "",
  subheadingHi: "",
  descriptionHi: "",
  image: "",
  hsn_percentage: "",
  hsn_code: "",
  share: "",
  gst: "",
  platformfee: "",
  processingfee: "",
  freight: "",
  isActive: true,
  categoryType: serviceCategoryType.MAJOR,
};

const ServiceOfferedComp = () => {
  const [loader, setLoader] = useState(false);
  const [service, setService] = useState([]);
  const [editing, setEditing] = useState(null);
  const [editedService, setEditedService] = useState(null);
  const [error, setError] = useState(null);
  const [updateError, setUpdateError] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [filterCategory, setFilterCategory] = useState("");
  const [newService, setNewService] = useState({ ...EMPTY_SERVICE });
  const storedService = useSelector(
    (state) => state.superAdminHomePage.serviceOffered
  );

  useEffect(() => {
    setService(storedService);
  }, []);

  const handleEdit = (id) => {
    const serviceToEdit = service.find((item) => item._id === id);
    if (serviceToEdit) {
      setEditing(id);
      setEditedService({ ...serviceToEdit });
    }
  };

  const handleDiscard = () => {
    setEditing(null);
    setEditedService(null);
  };

  const handleUpdate = (id) => {
    setUpdateError(null);
    fetch(`${api.serviceOffered}?id=${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(editedService),
    })
      .then(async (response) => {
        if (!response.ok) {
          const errMsg = await response.text().catch(() => "");
          throw new Error(errMsg || "Failed to update service");
        }
        return response.json();
      })
      .then((data) => {
        setService((prev) =>
          prev.map((item) => (item._id === id ? data : item))
        );
        setEditing(null);
        setEditedService(null);
        setUpdateError(null);
      })
      .catch((err) => {
        console.error("Error updating service:", err);
        setUpdateError(err.message || "Failed to update service");
      });
  };

  const handleAdd = () => {
    setError(null);
    setLoader(true);
    fetch(api.serviceOffered, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newService),
    })
      .then(async (response) => {
        if (!response.ok) {
          const errMsg = await response.text().catch(() => "");
          throw new Error(errMsg || "Failed to add service");
        }
        return response.json();
      })
      .then((data) => {
        setService((prev) => [...prev, data]);
        setNewService({ ...EMPTY_SERVICE });
        setLoader(false);
        setError(null);
      })
      .catch((err) => {
        console.error("Error adding service:", err);
        setLoader(false);
        setError(err.message || "Failed to add service");
      });
  };

  const handleDelete = (id) => {
    setDeleteError(null);
    fetch(`${api.serviceOffered}?id=${id}`, {
      method: "DELETE",
    })
      .then(async (response) => {
        if (!response.ok) {
          const errMsg = await response.text().catch(() => "");
          throw new Error(errMsg || "Failed to delete service");
        }
        return response.text();
      })
      .then(() => {
        setService((prev) => prev.filter((item) => item._id !== id));
        setDeleteError(null);
      })
      .catch((err) => {
        console.error("Error deleting service:", err);
        setDeleteError(err.message || "Failed to delete service");
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewService({ ...newService, [name]: value });
  };

  const filteredServices = filterCategory
    ? service.filter((s) => s.categoryType === filterCategory)
    : service;

  const renderField = (label, value) => (
    <div>
      <div className={styles.fieldLabel}>{label}</div>
      <div className={value ? styles.fieldValue : styles.fieldValueEmpty}>
        {value || "—"}
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Service Offered</h1>

      <div className={styles.filterBar}>
        <span className={styles.filterLabel}>Filter by category:</span>
        <select
          className={styles.filterSelect}
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="">All Services</option>
          <option value={serviceCategoryType.MAJOR}>Major Services</option>
          <option value={serviceCategoryType.SUB}>Sub Services</option>
        </select>
      </div>

      <div className={styles.cardContainer}>
        {filteredServices.length === 0 && (
          <div className={styles.emptyState}>No services available</div>
        )}

        {filteredServices.map((service) => (
          <div key={service._id} className={styles.card}>
            {editing === service._id && editedService ? (
              /* ---- EDIT MODE ---- */
              <div>
                <div className={styles.cardHeader}>
                  <span className={styles.serviceName}>
                    {service.name}
                  </span>
                </div>
                <div className={styles.editSection}>
                  <div className={styles.editGrid}>
                    <div className={styles.editGroup}>
                      <label className={styles.editLabel}>Name</label>
                      <input
                        className={styles.input}
                        type="text"
                        placeholder="Name"
                        value={editedService.name}
                        onChange={(e) =>
                          setEditedService({ ...editedService, name: e.target.value })
                        }
                      />
                    </div>

                    <div className={styles.editGroup}>
                      <label className={styles.editLabel}>Fee</label>
                      <input
                        className={styles.input}
                        type="number"
                        placeholder="Fee"
                        value={editedService.fee}
                        onChange={(e) =>
                          setEditedService({ ...editedService, fee: e.target.value })
                        }
                      />
                    </div>

                    <div className={styles.editGroup}>
                      <label className={styles.editLabel}>HSN Code</label>
                      <input
                        className={styles.input}
                        type="text"
                        placeholder="HSN Code"
                        value={editedService.hsn_code}
                        onChange={(e) =>
                          setEditedService({ ...editedService, hsn_code: e.target.value })
                        }
                      />
                    </div>

                    <div className={styles.editGroup}>
                      <label className={styles.editLabel}>HSN %</label>
                      <input
                        className={styles.input}
                        type="number"
                        placeholder="HSN %"
                        value={editedService.hsn_percentage}
                        onChange={(e) =>
                          setEditedService({ ...editedService, hsn_percentage: e.target.value })
                        }
                      />
                    </div>

                    <div className={styles.editGroup}>
                      <label className={styles.editLabel}>Share</label>
                      <input
                        className={styles.input}
                        type="number"
                        placeholder="Share"
                        value={editedService.share}
                        onChange={(e) =>
                          setEditedService({ ...editedService, share: e.target.value })
                        }
                      />
                    </div>

                    <div className={styles.editGroup}>
                      <label className={styles.editLabel}>GST</label>
                      <input
                        className={styles.input}
                        type="number"
                        placeholder="GST"
                        value={editedService.gst}
                        onChange={(e) =>
                          setEditedService({ ...editedService, gst: e.target.value })
                        }
                      />
                    </div>

                    <div className={styles.editGroup}>
                      <label className={styles.editLabel}>Platform Fee</label>
                      <input
                        className={styles.input}
                        type="number"
                        placeholder="Platform Fee"
                        value={editedService.platformfee}
                        onChange={(e) =>
                          setEditedService({ ...editedService, platformfee: e.target.value })
                        }
                      />
                    </div>

                    <div className={styles.editGroup}>
                      <label className={styles.editLabel}>Processing Fee</label>
                      <input
                        className={styles.input}
                        type="number"
                        placeholder="Processing Fee"
                        value={editedService.processingfee}
                        onChange={(e) =>
                          setEditedService({ ...editedService, processing_fee: e.target.value })
                        }
                      />
                    </div>

                    <div className={styles.editGroup}>
                      <label className={styles.editLabel}>Freight</label>
                      <input
                        className={styles.input}
                        type="number"
                        placeholder="Freight"
                        value={editedService.freight}
                        onChange={(e) =>
                          setEditedService({ ...editedService, freight: e.target.value })
                        }
                      />
                    </div>

                    {/* Copy rendered by the homepage speciality tabs (Tabs-1). */}
                    <div className={styles.editGroupFull}>
                      <label className={styles.editLabel}>Image</label>
                      <input
                        className={styles.input}
                        type="text"
                        placeholder="/images/cardiology.jpg"
                        value={editedService.image || ""}
                        onChange={(e) =>
                          setEditedService({ ...editedService, image: e.target.value })
                        }
                      />
                    </div>

                    <div className={styles.editGroup}>
                      <label className={styles.editLabel}>Subheading</label>
                      <input
                        className={styles.input}
                        type="text"
                        placeholder="Subheading"
                        value={editedService.subheading || ""}
                        onChange={(e) =>
                          setEditedService({ ...editedService, subheading: e.target.value })
                        }
                      />
                    </div>

                    <div className={styles.editGroup}>
                      <label className={styles.editLabel}>Subheading (Hindi)</label>
                      <input
                        className={styles.input}
                        type="text"
                        placeholder="हिंदी उपशीर्षक"
                        value={editedService.subheadingHi || ""}
                        onChange={(e) =>
                          setEditedService({ ...editedService, subheadingHi: e.target.value })
                        }
                      />
                    </div>

                    <div className={styles.editGroupFull}>
                      <label className={styles.editLabel}>Description</label>
                      <textarea
                        className={styles.textarea}
                        rows={4}
                        placeholder="Paragraph shown on the homepage speciality tab"
                        value={editedService.description || ""}
                        onChange={(e) =>
                          setEditedService({ ...editedService, description: e.target.value })
                        }
                      />
                    </div>

                    <div className={styles.editGroupFull}>
                      <label className={styles.editLabel}>Description (Hindi)</label>
                      <textarea
                        className={styles.textarea}
                        rows={4}
                        placeholder="हिंदी विवरण"
                        value={editedService.descriptionHi || ""}
                        onChange={(e) =>
                          setEditedService({ ...editedService, descriptionHi: e.target.value })
                        }
                      />
                    </div>

                    <div className={styles.editGroupFull}>
                      <label className={styles.editLabel}>Category</label>
                      <select
                        className={styles.input}
                        value={editedService.categoryType || serviceCategoryType.MAJOR}
                        onChange={(e) =>
                          setEditedService({ ...editedService, categoryType: e.target.value })
                        }
                      >
                        <option value={serviceCategoryType.MAJOR}>Major</option>
                        <option value={serviceCategoryType.SUB}>Sub</option>
                      </select>
                    </div>

                    <div className={styles.toggleRow}>
                      <div
                        className={styles.toggleSwitch}
                        onClick={() =>
                          setEditedService({
                            ...editedService,
                            isActive: !editedService.isActive,
                          })
                        }
                        style={{
                          backgroundColor: editedService.isActive ? "#22c55e" : "#9ca3af",
                        }}
                      >
                        <div
                          className={styles.toggleKnob}
                          style={{
                            left: editedService.isActive ? "23px" : "3px",
                          }}
                        ></div>
                      </div>
                      <span className={styles.toggleLabel}>
                        {editedService.isActive ? "Active" : "Not Active"}
                      </span>
                    </div>

                    {updateError && (
                      <div className={styles.errorMessage}>
                        ⚠ {updateError}
                      </div>
                    )}
                    <div className={styles.buttonGroup}>
                      <Button
                        className={styles.updateButton}
                        onClick={() => handleUpdate(service._id)}
                      >
                        Update
                      </Button>
                      <button
                        className={styles.discardButton}
                        onClick={handleDiscard}
                      >
                        Discard
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* ---- VIEW MODE ---- */
              <>
                <div className={styles.cardHeader}>
                  <span className={styles.serviceName}>
                    {service.name}
                    <span
                      className={`${styles.categoryBadge} ${
                        service.categoryType === serviceCategoryType.MAJOR
                          ? styles.categoryBadgeMajor
                          : styles.categoryBadgeSub
                      }`}
                    >
                      {service.categoryType || "MAJOR"}
                    </span>
                  </span>
                  <span
                    className={`${styles.statusBadge} ${
                      service.isActive ? styles.statusBadgeActive : styles.statusBadgeInactive
                    }`}
                  >
                    <span
                      className={`${styles.statusDot} ${
                        service.isActive ? styles.statusDotActive : styles.statusDotInactive
                      }`}
                    />
                    {service.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.fieldGrid}>
                    {renderField("Fee", service.fee)}
                    {renderField("HSN Code", service.hsn_code)}
                    {renderField("HSN %", service.hsn_percentage)}
                    {renderField("Share", service.share)}
                    {renderField("GST", service.gst)}
                    {renderField("Platform Fee", service.platformfee)}
                    {renderField("Processing Fee", service.processingfee)}
                    {renderField("Freight", service.freight)}
                    {renderField("Subheading", service.subheading)}
                    {renderField("Image", service.image)}
                  </div>

                  {service.description && (
                    <div className={styles.fieldDescription}>
                      <div className={styles.fieldLabel}>Description</div>
                      <div className={styles.fieldValue}>
                        {service.description}
                      </div>
                    </div>
                  )}

                  {service.descriptionHi && (
                    <div className={styles.fieldDescription}>
                      <div className={styles.fieldLabel}>Description (Hindi)</div>
                      <div className={styles.fieldValue}>
                        {service.descriptionHi}
                      </div>
                    </div>
                  )}
                </div>

                <div className={styles.cardActions}>
                  {deleteError && (
                    <div className={styles.errorMessageActions}>
                      ⚠ {deleteError}
                    </div>
                  )}
                  <Button
                    className={styles.editButton}
                    onClick={() => handleEdit(service._id)}
                  >
                    <MdEdit size={16} />
                    Edit
                  </Button>
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDelete(service._id)}
                    title="Delete"
                  >
                    <MdDelete size={20} />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* ---- ADD NEW SERVICE ---- */}
      <div className={styles.sectionHeader}>
        <h2>Add New Service</h2>
      </div>

      <div className={styles.form}>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label>Name</label>
            <input
              className={styles.input}
              type="text"
              name="name"
              value={newService.name}
              onChange={handleChange}
              placeholder="Enter service name"
            />
          </div>

          <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
            <label>Description</label>
            <textarea
              className={styles.textarea}
              name="description"
              rows={4}
              value={newService.description}
              onChange={handleChange}
              placeholder="Paragraph shown on the homepage speciality tab"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Subheading</label>
            <input
              className={styles.input}
              type="text"
              name="subheading"
              value={newService.subheading}
              onChange={handleChange}
              placeholder="e.g., Primary Care, Always Accessible"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Subheading (Hindi)</label>
            <input
              className={styles.input}
              type="text"
              name="subheadingHi"
              value={newService.subheadingHi}
              onChange={handleChange}
              placeholder="हिंदी उपशीर्षक"
            />
          </div>

          <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
            <label>Description (Hindi)</label>
            <textarea
              className={styles.textarea}
              name="descriptionHi"
              rows={4}
              value={newService.descriptionHi}
              onChange={handleChange}
              placeholder="हिंदी विवरण"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Image</label>
            <input
              className={styles.input}
              type="text"
              name="image"
              value={newService.image}
              onChange={handleChange}
              placeholder="/images/cardiology.jpg"
            />
          </div>

          <div className={styles.formGroup}>
            <label>HSN %</label>
            <input
              className={styles.input}
              type="number"
              name="hsn_percentage"
              value={newService.hsn_percentage}
              onChange={handleChange}
              placeholder="e.g., 18"
            />
          </div>

          <div className={styles.formGroup}>
            <label>HSN Code</label>
            <input
              className={styles.input}
              type="text"
              name="hsn_code"
              value={newService.hsn_code}
              onChange={handleChange}
              placeholder="e.g., 9983"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Share</label>
            <input
              className={styles.input}
              type="number"
              name="share"
              value={newService.share}
              onChange={handleChange}
              placeholder="Enter share"
            />
          </div>

          <div className={styles.formGroup}>
            <label>GST</label>
            <input
              className={styles.input}
              type="number"
              name="gst"
              value={newService.gst}
              onChange={handleChange}
              placeholder="Enter GST"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Platform Fee</label>
            <input
              className={styles.input}
              type="number"
              name="platformfee"
              value={newService.platformfee}
              onChange={handleChange}
              placeholder="Enter platform fee"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Processing Fee</label>
            <input
              className={styles.input}
              type="number"
              name="processingfee"
              value={newService.processingfee}
              onChange={handleChange}
              placeholder="Enter processing fee"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Freight</label>
            <input
              className={styles.input}
              type="number"
              name="freight"
              value={newService.freight}
              onChange={handleChange}
              placeholder="Enter freight"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Category</label>
            <select
              className={styles.input}
              name="categoryType"
              value={newService.categoryType}
              onChange={handleChange}
            >
              <option value={serviceCategoryType.MAJOR}>Major</option>
              <option value={serviceCategoryType.SUB}>Sub</option>
            </select>
          </div>
        </div>

        {error && (
          <div className={styles.errorMessage} style={{ marginBottom: 12 }}>
            ⚠ {error}
          </div>
        )}
        <div className={styles.formActions}>
          {loader ? (
            <div className={styles.loader}>Loading...</div>
          ) : (
            <Button className={styles.addButton} onClick={handleAdd}>
              + Add Service
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceOfferedComp;