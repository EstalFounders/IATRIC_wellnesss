// DoctorModal.js
import React, { useEffect, useState } from "react";
import { Modal, Button, Form, ModalBody, Row, Col } from "react-bootstrap";
import { FaTrash } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import {
  convertDateIntoTime,
  convertTimeIntoDate,
  isMobileValid,
} from "../../helper";
import { api, DoctorType, superAdminConsultationtype, userTypeConstant, color_schema } from "../../constant";
import { setServiceOffered } from "../../store/slices/superAdmin/homepageSlice";
import WorkDaysPicker from "../Common/WorkDaysPicker";
import EducationTrainingInput from "../Common/EducationTrainingInput";
import WorkExperienceInput from "../Common/WorkExperienceInput";
import LanguageInput from "../Common/LanguageInput";
import { formatWorkDays, parseWorkDays } from "../../customUtils/workDays";
import { parseEducationTraining } from "../../customUtils/educationTraining";
import { parseWorkExperience } from "../../customUtils/workExperience";
import { parseLanguages } from "../../customUtils/languages";
import { formatLocation } from "../../customUtils/indiaLocations";

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

  const [selectedServices, setSelectedServices] = useState(
    Array.isArray(editedDoctor.serviceOffered) ? editedDoctor.serviceOffered : []
  );

  // Day chips. The array drives the picker, while `editedDoctor.workDays` stays
  // a comma-joined string: the doctor document stores a String and the approval
  // flow (`RegisterDocLoginHeader` -> `doctorUpdateReq`) compares strings.
  // A legacy value ("mon-sunday") is parsed here and only rewritten on a click.
  const [selectedWorkDays, setSelectedWorkDays] = useState(
    parseWorkDays(doctor.workDays)
  );
  const [workDaysError, setWorkDaysError] = useState("");

  // Draft rows for the repeatable education/training inputs. `editedDoctor`
  // keeps the stored value untouched until a row is actually edited, so an
  // untouched legacy string still reports "no change" in the doctor-panel
  // approval diff (see RegisterDocLoginHeader).
  const [educationItems, setEducationItems] = useState(
    parseEducationTraining(doctor.educationTraining)
  );

  // Draft rows for the repeatable work-experience inputs.
  const [workExperienceItems, setWorkExperienceItems] = useState(
    parseWorkExperience(doctor.workExperience)
  );

  // Draft rows for the repeatable language inputs. Like education/work days,
  // `editedDoctor` keeps the stored value untouched until a row is actually
  // edited, so an untouched legacy value still reports "no change" in the
  // doctor-panel approval diff (see RegisterDocLoginHeader).
  const [languageItems, setLanguageItems] = useState(
    parseLanguages(doctor.language)
  );
  const [languageError, setLanguageError] = useState("");

  const dispatch = useDispatch();
  const storedService = useSelector(
    (state) => state.superAdminHomePage.serviceOffered
  );

  useEffect(() => {
    if (!storedService || storedService.length === 0) {
      fetch(api.serviceOffered)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) dispatch(setServiceOffered(data));
        })
        .catch((err) => console.error("Failed to fetch services:", err));
    }
  }, [dispatch, storedService]);

  const [diplomasCertificatesPreview, setDiplomasCertificatesPreview] =
    useState(doctor.diplomasCertificatesUrls);

  const [showAddInput, setShowAddInput] = useState(false);

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
    if (selectedWorkDays.length === 0) {
      setWorkDaysError("Please select at least one workday");
      return;
    }
    if (parseLanguages(languageItems).length === 0) {
      setLanguageError("Please add at least one language");
      return;
    }
    if (!isMobileValid(editedDoctor.mobileNumber)) {
      alert("Please enter a valid mobile number");
      return;
    }
    // Compulsory field - `<Form>` here has no onSubmit, so the native `required`
    // never fires and this check is the one that bites.
    if (!String(editedDoctor.doctorRegistrationNo || "").trim()) {
      alert("Please enter the registration number");
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

  // Consultation type - picked from the fixed list (Audio, Video, Home visit, Clinic)
  const handleAddType = (value) => {
    const trimmed = String(value || "").trim();
    if (!trimmed) return;
    // Duplicate check (case-insensitive)
    if (selectedTypes.some((t) => t.toLowerCase() === trimmed.toLowerCase())) return;
    const updatedTypes = [...selectedTypes, trimmed];
    setSelectedTypes(updatedTypes);
    setEditedDoctor({ ...editedDoctor, consultationType: updatedTypes });
    setShowAddInput(false);
  };

  // Services offered - same add/remove tag pattern
  const handleAddService = (value) => {
    const trimmed = String(value || "").trim();
    if (!trimmed) return;
    if (selectedServices.includes(trimmed)) return;
    const updatedServices = [...selectedServices, trimmed];
    setSelectedServices(updatedServices);
    setEditedDoctor({ ...editedDoctor, serviceOffered: updatedServices });
  };

  const handleRemoveService = (service) => {
    const updatedServices = selectedServices.filter((item) => item !== service);
    setSelectedServices(updatedServices);
    setEditedDoctor({ ...editedDoctor, serviceOffered: updatedServices });
  };

  // Work days - the picker returns an ordered array, the payload keeps the
  // comma-joined string the API and the approval diffing already use.
  const handleWorkDaysChange = (days) => {
    setSelectedWorkDays(days);
    setEditedDoctor({ ...editedDoctor, workDays: formatWorkDays(days) });
    if (days.length > 0) setWorkDaysError("");
  };

  // Education + training - the rows are stored as an array of trimmed strings
  // (doctor schema is `[String]`), which is also what the doctor-panel diff and
  // the approval PUT expect.
  const handleEducationTrainingChange = (items) => {
    setEducationItems(items);
    setEditedDoctor({
      ...editedDoctor,
      educationTraining: parseEducationTraining(items),
    });
  };

  // Work experience - the rows are stored as an array of trimmed strings
  // (doctor schema is `[String]`), like education + training.
  const handleWorkExperienceChange = (items) => {
    setWorkExperienceItems(items);
    setEditedDoctor({
      ...editedDoctor,
      workExperience: parseWorkExperience(items),
    });
  };

  // Languages - one entry per language, stored as an array of trimmed strings.
  // `parseLanguages` drops the blank rows the user left open.
  const handleLanguagesChange = (items) => {
    setLanguageItems(items);
    setEditedDoctor({ ...editedDoctor, language: parseLanguages(items) });
    if (parseLanguages(items).length > 0) setLanguageError("");
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
              {/* Compulsory: printed as the third line of the prescription stamp. */}
              <Form.Group controlId="doctorRegistrationNo" className="mb-3">
                <Form.Label>
                  <b>Registration Number *</b>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="doctorRegistrationNo"
                  value={editedDoctor.doctorRegistrationNo || ""}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="language" className="mb-3">
                <Form.Label>
                  <b>Language</b>
                </Form.Label>
                <LanguageInput
                  value={languageItems}
                  onChange={handleLanguagesChange}
                  error={languageError}
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
                <WorkDaysPicker
                  value={selectedWorkDays}
                  onChange={handleWorkDaysChange}
                  error={workDaysError}
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
                <WorkExperienceInput
                  value={workExperienceItems}
                  onChange={handleWorkExperienceChange}
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
                    <select
                      value=""
                      onChange={(e) => handleAddType(e.target.value)}
                      style={{
                        padding: "6px 8px",
                        borderRadius: "6px",
                        border: "1px solid #ccc",
                        fontSize: "0.85rem",
                        background: "#fff",
                        cursor: "pointer",
                      }}
                      autoFocus
                    >
                      <option value="" disabled>
                        Select consultation type
                      </option>
                      {superAdminConsultationtype.map((option) => (
                        <option
                          key={option.name}
                          value={option.name}
                          disabled={selectedTypes.includes(option.name)}
                        >
                          {option.name}
                        </option>
                      ))}
                    </select>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => setShowAddInput(false)}
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
                      background: color_schema.green,
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
              <Form.Group controlId="serviceOffered" className="mb-3">
                <Form.Label>
                  <b>Services Offered</b>
                </Form.Label>
                <div style={{ marginBottom: 8 }}>
                  {selectedServices.length === 0 ? (
                    <span style={{ fontSize: "0.85rem", color: "#999" }}>
                      No services selected.
                    </span>
                  ) : (
                    selectedServices.map((service, index) => (
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
                        {service}
                        <FaTrash
                          style={{
                            cursor: "pointer",
                            fontSize: "0.7rem",
                            color: "#c62828",
                          }}
                          onClick={() => handleRemoveService(service)}
                        />
                      </span>
                    ))
                  )}
                </div>
                <select
                  value=""
                  onChange={(e) => handleAddService(e.target.value)}
                  style={{
                    padding: "6px 8px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                    fontSize: "0.85rem",
                    background: "#fff",
                    cursor: "pointer",
                  }}
                >
                  <option value="" disabled>
                    Select service
                  </option>
                  {(storedService || [])
                    .filter((option) => option.isActive !== false)
                    .map((option) => (
                      <option
                        key={option._id || option.name}
                        value={option.name}
                        disabled={selectedServices.includes(option.name)}
                      >
                        {option.name}
                      </option>
                    ))}
                </select>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              {/* Add Form.Group for profile picture */}
              <Form.Group controlId="location" className="mb-3">
                <Form.Label>
                  <b>Location</b>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="location"
                  value={formatLocation(editedDoctor.location)}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="educationTraining" className="mb-3">
                <Form.Label>
                  <b>Education Training</b>
                </Form.Label>
                <EducationTrainingInput
                  value={educationItems}
                  onChange={handleEducationTrainingChange}
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
                  <option value={DoctorType.company}>
                    {DoctorType.company}
                  </option>
                  <option value={DoctorType.individual}>
                    {DoctorType.individual}
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
