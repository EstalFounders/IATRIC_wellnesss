// DoctorModal.js
import React, { useEffect, useState } from "react";
import { Modal, Button, Form, ModalBody, Row, Col } from "react-bootstrap";
import { FaTrash } from "react-icons/fa";
import { convertDateIntoTime, convertTimeIntoDate } from "../../helper";
import { DoctorType, superAdminConsultationtype, userTypeConstant } from "../../constant";
import { useSelector } from "react-redux";

const DoctorModalComp = ({ show, handleClose, doctor, onSave, origin }) => {
  console.log(doctor, "doctor in modal");
  const consultationTypeStore = useSelector(
    (state) => state.otherDetailsSlice.consultationType
  );
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
    editedDoctor.consultationType || []
  );

  const [diplomasCertificatesPreview, setDiplomasCertificatesPreview] =
    useState(doctor.diplomasCertificatesUrls);

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
    onSave(editedDoctor);
    handleClose();
  };

  const handleCheckboxChange = (type) => {
    let updatedTypes;
    if (selectedTypes.includes(type)) {
      updatedTypes = selectedTypes.filter((item) => item !== type); // Remove if already selected
    } else {
      updatedTypes = [...selectedTypes, type]; // Add if not selected
    }

    setSelectedTypes(updatedTypes);
    setEditedDoctor({ ...editedDoctor, consultationType: updatedTypes });
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
                <div>
                  {consultationTypeStore.map((type) => (
                    <Form.Check
                      key={type._id} // Assuming each 'type' has a unique '_id' field
                      type="checkbox"
                      label={type.name} // Assuming 'name' is a property of each type
                      value={type.name}
                      checked={selectedTypes.includes(type.name)}
                      onChange={() => handleCheckboxChange(type.name)}
                      className="mb-2"
                    />
                  ))}
                </div>
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
                  <option value={DoctorType.Company}>{DoctorType.Company}</option>
                  <option value={DoctorType.Individual}>{DoctorType.Individual}</option>
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
