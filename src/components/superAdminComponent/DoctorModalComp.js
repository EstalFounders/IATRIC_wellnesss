// DoctorModal.js
import React, { useEffect, useState } from "react";
import { Modal, Button, Form, ModalBody, Row, Col } from "react-bootstrap";
import { FaTrash } from "react-icons/fa";
import {
  convertDateIntoTime,
  convertTimeIntoDate,
  isMobileValid,
} from "../../helper";
import {
  DoctorType,
  userTypeConstant,
} from "../../constant";

const DoctorModalComp = ({ show, handleClose, doctor, onSave, origin }) => {
  console.log(doctor, "doctor in modal");
  const [editedDoctor, setEditedDoctor] = useState({ ...doctor });
  const [profilePicturePreview, setProfilePicturePreview] = useState(
    doctor.profilePictureUrl
  );
  const [slotStartTime, setSlotStartTime] = useState(
    convertDateIntoTime(editedDoctor.slotStartTime)
  );
  const [slotEndTime, setSlotEndTime] = useState(
    convertDateIntoTime(editedDoctor.slotEndTime)
  );

  const [selectedTypes, setSelectedTypes] = useState(
    Array.isArray(editedDoctor.consultationType) ? editedDoctor.consultationType : []
  );

  const [diplomasCertificatesPreview, setDiplomasCertificatesPreview] =
    useState(doctor.diplomasCertificatesUrls);

  const [showAddInput, setShowAddInput] = useState(false);
  const [newTypeInput, setNewTypeInput] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "slotStartTime" || name === "slotEndTime") {
      const updatedTime = convertTimeIntoDate(value);
      if (name === "slotStartTime") {
        setSlotStartTime(value);
        setEditedDoctor({
          ...editedDoctor,
          slotStartTime: updatedTime,
        });
      } else {
        setSlotEndTime(value);
        setEditedDoctor({
          ...editedDoctor,
          slotEndTime: updatedTime,
        });
      }
    } else {
      setEditedDoctor({ ...editedDoctor, [name]: value });
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditedDoctor({
        ...editedDoctor,
        profilePictureUrl: file,
      });
      setProfilePicturePreview(URL.createObjectURL(file));
    }
  };

  const handleDiplomasCertificatesChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      const urls = Array.from(files).map((file) => file);
      setEditedDoctor({ ...editedDoctor, diplomasCertificatesUrls: urls });
      setDiplomasCertificatesPreview(urls);
    }
  };

  const handleDeleteProfilePicture = () => {
    setEditedDoctor({ ...editedDoctor, profilePictureUrl: "" });
    setProfilePicturePreview(null);
  };

  const handleDeleteDiplomasCertificate = (index) => {
    const updatedUrls = [...editedDoctor.diplomasCertificatesUrls];
    updatedUrls.splice(index, 1);
    setEditedDoctor({ ...editedDoctor, diplomasCertificatesUrls: updatedUrls });
    setDiplomasCertificatesPreview(updatedUrls);
  };

  const handleSave = () => {
    console.log(editedDoctor, "edited doctor");
    if (!isMobileValid(editedDoctor.mobileNumber)) {
      alert("Please enter a valid mobile number");
      return;
    }
    onSave(editedDoctor);
    handleClose();
  };

  const handleRemoveType = (type) => {
    const updatedTypes = selectedTypes.filter((item) => item !== type);
    setSelectedTypes(updatedTypes);
    setEditedDoctor({ ...editedDoctor, consultationType: updatedTypes });
  };

  const handleAddType = () => {
    const trimmed = newTypeInput.trim();
    if (!trimmed) return;
    // Duplicate check (case-insensitive)
    if (selectedTypes.some((t) => t.toLowerCase() === trimmed.toLowerCase())) return;
    const updatedTypes = [...selectedTypes, trimmed];
    setSelectedTypes(updatedTypes);
    setEditedDoctor({ ...editedDoctor, consultationType: updatedTypes });
    setNewTypeInput("");
    setShowAddInput(false);
  };

  console.log(editedDoctor, "edited doctor");

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Edit Doctor Details</Modal.Title>
      </Modal.Header>
      <ModalBody>
        <Form>
          <Row>
            <Col md={6}>
              <Form.Group controlId="name" className="mb-3">
                <Form.Label>
                  <b>Name</b>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={editedDoctor.name}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group controlId="mobileNumber" className="mb-3">
                <Form.Label>
                  <b>Mobile Number</b>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="mobileNumber"
                  value={editedDoctor.mobileNumber}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group controlId="expertise" className="mb-3">
                <Form.Label>
                  <b>Expertise</b>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="expertise"
                  value={editedDoctor.expertise}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="degree" className="mb-3">
                <Form.Label>
                  <b>Degree</b>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="degree"
                  value={editedDoctor.degree}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group controlId="language" className="mb-3">
                <Form.Label>
                  <b>Language</b>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="language"
                  value={editedDoctor.language}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group controlId="workDays" className="mb-3">
                <Form.Label>
                  <b>Work Days</b>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="workDays"
                  value={editedDoctor.workDays}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group controlId="overview" className="mb-3">
                <Form.Label>
                  <b>Overview</b>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="overview"
                  value={editedDoctor.overview}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="workExperience" className="mb-3">
                <Form.Label>
                  <b>Work Experience</b>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="workExperience"
                  value={editedDoctor.workExperience}
                  onChange={handleChange}
                />
              </Form.Group>
              <Form.Group controlId="consultationType" className="mb-3">
                <Form.Label>
                  <b>Consultation Type</b>
                </Form.Label>
                <div style={{ marginBottom: 8 }}>
                  {selectedTypes.length === 0 ? (
                    <span style={{ fontSize: "0.85rem", color: "#999" }}>
                      No consultation types selected.
                    </span>
                  ) : (
                    selectedTypes.map((type, index) => (
                      <span
                        key={index}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          background: "#e8f5e9",
                          color: "#2e7d32",
                          padding: "4px 10px",
                          borderRadius: "16px",
                          fontSize: "0.85rem",
                          margin: "2px 4px 2px 0",
                        }}
                      >
                        {type}
                        <FaTrash
                          style={{
                            cursor: "pointer",
                            fontSize: "0.7rem",
                            color: "#c62828",
                          }}
                          onClick={() => handleRemoveType(type)}
                        />
                      </span>
                    ))
                  )}
                </div>
                {showAddInput ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <input
                      type="text"
                      value={newTypeInput}
                      onChange={(e) => setNewTypeInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddType(); } }}
                      placeholder="Enter consultation type..."
                      style={{
                        padding: "6px 8px",
                        borderRadius: "6px",
                        border: "1px solid #ccc",
                        fontSize: "0.85rem",
                      }}
                      autoFocus
                    />
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={handleAddType}
                        style={{
                          background: "#3b5f1d",
                          color: "white",
                          border: "none",
                          padding: "6px 14px",
                          borderRadius: "6px",
                          fontSize: "0.85rem",
                          cursor: "pointer",
                        }}
                      >
                        Add
                      </button>
                      <button
                        onClick={() => { setShowAddInput(false); setNewTypeInput(""); }}
                        style={{
                          background: "#f5f5f5",
                          color: "#333",
                          border: "1px solid #ccc",
                          padding: "6px 14px",
                          borderRadius: "6px",
                          fontSize: "0.85rem",
                          cursor: "pointer",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAddInput(true)}
                    style={{
                      background: "#3b5f1d",
                      color: "white",
                      border: "none",
                      borderRadius: "50%",
                      width: 28,
                      height: 28,
                      fontSize: "1.1rem",
                      lineHeight: 1,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    title="Add consultation type"
                  >
                    +
                  </button>
                )}
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              {/* Add Form.Group for profile picture */}
              <Form.Group controlId="location," className="mb-3">
                <Form.Label>
                  <b>Location</b>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="location,"
                  value={editedDoctor.location}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="educationTraining" className="mb-3">
                <Form.Label>
                  <b>Education Training</b>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="educationTraining"
                  value={editedDoctor.educationTraining}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              {/* Add Form.Group for profile picture */}
              <Form.Group controlId="doctor-type," className="mb-3">
                <Form.Label>
                  <b>Doctor Type</b>
                </Form.Label>
                <select
                  type="text"
                  name="doctorType"
                  value={editedDoctor.doctorType}
                  onChange={handleChange}
                  className="w-100 py-2"
                >
                  <option value="" disabled>
                    Select an option
                  </option>
                  <option value={DoctorType.Company}>
                    {DoctorType.Company}
                  </option>
                  <option value={DoctorType.Individual}>
                    {DoctorType.Individual}
                  </option>
                </select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="price" className="mb-3">
                <Form.Label>
                  <b>Price</b>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="price"
                  value={editedDoctor.price}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              {/* Add Form.Group for profile picture */}
              <Form.Group controlId="slotStartTime," className="mb-3">
                <Form.Label className="mr-4">
                  <b>Start time</b>
                </Form.Label>
                <input
                  type="time"
                  id="slotStartTime"
                  name="slotStartTime"
                  value={slotStartTime}
                  onChange={handleChange}
                  min="09:00"
                  max="21:00"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="slotEndTime" className="mb-3">
                <Form.Label className="mr-4">
                  <b>EndTime</b>
                </Form.Label>
                <input
                  type="time"
                  id="slotEndTime"
                  name="slotEndTime"
                  value={slotEndTime}
                  onChange={handleChange}
                  min="09:00"
                  max="21:00"
                />
              </Form.Group>
            </Col>
          </Row>
          {origin !== userTypeConstant.doctor ? (
            <Row>
              <Col md={6}>
                {/* Diplomas Certificates */}
                <Form.Group controlId="diplomasCertificates" className="mb-3">
                  <Form.Label>
                    <b>Diplomas Certificates</b>
                  </Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleDiplomasCertificatesChange}
                  />
                  {diplomasCertificatesPreview &&
                    diplomasCertificatesPreview.map((url, index) => (
                      <div key={index} style={{ position: "relative" }}>
                        <img
                          src={url}
                          alt={`Diploma ${index + 1}`}
                          style={{ width: "100%", marginTop: "10px" }}
                        />
                        <FaTrash
                          style={{
                            cursor: "pointer",
                            position: "absolute",
                            top: "5px",
                            right: "5px",
                          }}
                          onClick={() => handleDeleteDiplomasCertificate(index)}
                        />
                      </div>
                    ))}
                </Form.Group>
              </Col>
              <Col md={6}>
                {/* Profile Picture */}
                <Form.Group controlId="profilePicture" className="mb-3">
                  <Form.Label>
                    <b>Profile Picture</b>
                  </Form.Label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                  />

                  {profilePicturePreview && (
                    <>
                      <img
                        src={profilePicturePreview}
                        alt="Profile"
                        style={{ width: "100%", marginTop: "10px" }}
                      />
                      <FaTrash
                        style={{ cursor: "pointer", marginTop: "5px" }}
                        onClick={handleDeleteProfilePicture}
                      />
                    </>
                  )}
                </Form.Group>
              </Col>
            </Row>
          ) : (
            ""
          )}
        </Form>
      </ModalBody>
      <Modal.Footer>
        <Button className="bg-primary" onClick={handleClose}>
          Cancel
        </Button>
        <Button className="bg-primary" onClick={handleSave}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DoctorModalComp;
