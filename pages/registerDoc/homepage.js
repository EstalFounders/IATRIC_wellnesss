// pages/homepage.js

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { Button, Col, Row } from "react-bootstrap";
import MedicineForm from "../../src/components/registerDocComponent/lib/MedicineForm";
import { FaPlus } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import DocPrescriptionGeneratePdf from "../../src/components/registerDocComponent/lib/DoctorPrescriptionGenerator";
import { api } from "../../src/constant";
import bcrypt from "bcryptjs";
import DoctorPasswordPopup from "../../src/components/registerDocComponent/lib/pdfPasswordPopup";

const Homepage = () => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [medicineForms, setMedicineForms] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [showPasswordPopup, setPasswordPopup] = useState(false);
  const [doctorPassword, setDoctorPassword] = useState("");

  const [updatedFormDetails, setUpdatedFormDetails] = useState({
    doctorName: "",
    pateintName: "",
    age: "",
    gender: "Male",
    patientNo: "",
    anyDrugAllergy: "No known allergy from medicine",
    lastDoctorVisit: "Within 1 month",
    lastHealthTest: "Within 6 months",
    medicineInfo: [],
    presentIllness: "",
    presentIllnessSinceWhen: "",
    currentStatusPresentIllness: "",
    doctorStampUrl: "",
    doctorSignatureUrl: "",
    // Add more fields as needed
  });

  const handleMedicineFormChange = (formValues, index) => {
    console.log(formValues, "form values");
    const updatedMedicineForms = [...medicineForms];
    updatedMedicineForms[index] = formValues;
    setMedicineForms(updatedMedicineForms);
  };

  const handleOtherFormDetailsChange = (formValues, index) => {
    const { name, value } = formValues.target;
    setUpdatedFormDetails((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleDeleteMedicineForm = (index) => {
    const updatedForms = [...medicineForms];
    updatedForms.splice(index, 1);
    setMedicineForms(updatedForms);
  };

  // Function to toggle preview visibility
  const togglePreview = () => {
    setPreviewVisible(!previewVisible);
  };

  const doctorPasswordValidation = (password) => {
    console.log("Password submitted:", doctorPassword);

    const isPasswordCorrect = bcrypt.compareSync(password, doctorPassword);

    console.log(isPasswordCorrect, "isPassword");

    if (isPasswordCorrect) {
      setPasswordPopup(false);
      togglePreview();
    } else {
      window.alert("password is not correct");
    }
    // Close the popup
    // setPasswordPopup(false);
  };

  // Function to handle preview button click
  const handlePreview = () => {
    if (!doctorPassword) {
      return window.alert("Please select doctor");
    }
    setPasswordPopup(true);
    setUpdatedFormDetails({
      ...updatedFormDetails,
      medicineInfo: [...medicineForms], // Update medicineInfo with the contents of medicineForms
    });
    // togglePreview();
    // Optionally, you can also perform any other actions here before showing the preview
    console.log(updatedFormDetails, "updated form details before");
  };

  useEffect(() => {
    // Update medicineInfo whenever medicineForms changes
    setUpdatedFormDetails({
      ...updatedFormDetails,
      medicineInfo: [...medicineForms], // Update medicineInfo with the contents of medicineForms
    });
  }, []);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch(api.addDoctor);
        const data = await response.json();
        setDoctors(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchDoctors();
  }, []);

  const handleDoctorSelect = (event) => {
    const selectedDoctor = JSON.parse(event.target.value);
    setUpdatedFormDetails({
      ...updatedFormDetails,
      doctorName: selectedDoctor.name,
      doctorStampUrl: selectedDoctor.doctorStampUrl,
      doctorSignatureUrl: selectedDoctor.doctorSignatureUrl,
    });
    setDoctorPassword(selectedDoctor.password);
  };

  // CSS for the modal
  const modalStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  const modalContentStyle = {
    backgroundColor: "#fefefe",
    padding: "20px",
    borderRadius: "5px",
    maxHeight: "90%",
    overflowY: "auto",
  };

  const closeButtonStyle = {
    position: "absolute",
    top: "10px",
    right: "10px",
    cursor: "pointer",
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1
        style={{ marginBottom: "30px", color: "#3b5f1d" }}
        className="text-center"
      >
        <b>
          <u>Doctor Prescription</u>
        </b>
      </h1>
      <div style={{ width: "90%", maxWidth: "500px" }}>
        <div style={{ marginBottom: "20px" }}>
          <div style={{ display: "grid", gap: "10px" }}>
            <div className="row">
              <div className="col">
                <select
                  onChange={handleDoctorSelect}
                  style={{
                    padding: "10px",
                    borderRadius: "5px",
                    border: "1px solid #ccc",
                    width: "100%",
                  }}
                >
                  <option value="">Select a Doctor</option>
                  {doctors.map((doctor) => (
                    <option key={doctor._id} value={JSON.stringify(doctor)}>
                      {doctor.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <Row>
              <Col>
                <label>
                  Patient Name:
                  <input
                    type="text"
                    name="pateintName"
                    style={{
                      padding: "10px",
                      borderRadius: "5px",
                      border: "1px solid #ccc",
                      width: "100%",
                    }}
                    required
                    onChange={handleOtherFormDetailsChange}
                  />
                </label>
              </Col>
              <Col md={2}>
                <label>
                  Age:
                  <input
                    type="text"
                    name="age"
                    style={{
                      padding: "10px",
                      borderRadius: "5px",
                      border: "1px solid #ccc",
                      width: "100%",
                    }}
                    required
                    onChange={handleOtherFormDetailsChange}
                  />
                </label>
              </Col>
              <Col>
                <label>
                  Gender:
                  <select
                    name="gender"
                    style={{
                      padding: "10px",
                      borderRadius: "5px",
                      border: "1px solid #ccc",
                      width: "100%",
                    }}
                    value={updatedFormDetails.gender}
                    required
                    onChange={handleOtherFormDetailsChange}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </label>
              </Col>
            </Row>
          </div>
        </div>
        <div style={{ marginBottom: "20px" }}>
          <h2>Present Illness</h2>
          <input
            name="presentIllness"
            type="text"
            style={{
              padding: "10px",
              borderRadius: "5px",
              border: "1px solid #ccc",
              width: "100%",
            }}
            pattern="[0-9]{10}"
            required
            onChange={handleOtherFormDetailsChange}
          />
        </div>
        <div style={{ marginBottom: "20px" }}>
          <h2>Present Illness Since When</h2>
          <input
            name="presentIllnessSinceWhen"
            type="text"
            style={{
              padding: "10px",
              borderRadius: "5px",
              border: "1px solid #ccc",
              width: "100%",
            }}
            pattern="[0-9]{10}"
            required
            onChange={handleOtherFormDetailsChange}
          />
        </div>
        <div style={{ marginBottom: "20px" }}>
          <h2>Currrent Status of Present Illness</h2>
          <input
            name="currentStatusPresentIllness"
            type="text"
            style={{
              padding: "10px",
              borderRadius: "5px",
              border: "1px solid #ccc",
              width: "100%",
            }}
            pattern="[0-9]{10}"
            required
            onChange={handleOtherFormDetailsChange}
          />
        </div>
        <div style={{ marginBottom: "20px" }}>
          <h2>Drug Allergies</h2>
          <label>
            Any Drug Allergies:
            <select
              name="anyDrugAllergy"
              style={{
                padding: "10px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                width: "100%",
              }}
              required
              onChange={handleOtherFormDetailsChange}
              value={updatedFormDetails.anyDrugAllergy}
            >
              <option value="No known allergy from medicine">
                No known allergy from medicine
              </option>
              <option value="Dust allergy">Dust allergy</option>
              <option value="Food allergy">Food allergy</option>
              <option value="Other allergies">Other allergies</option>
            </select>
          </label>
        </div>
        <div style={{ marginBottom: "20px" }}>
          <h2>Last Doctor Visit</h2>
          <label>
            When was the last doctor visit:
            <select
              name="lastDoctorVisit"
              style={{
                padding: "10px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                width: "100%",
              }}
              required
              onChange={handleOtherFormDetailsChange}
              value={updatedFormDetails.lastDoctorVisit}
            >
              <option value="within_1_month">Within 1 month</option>
              <option value="Within 3 months">Within 3 months</option>
              <option value="Within 6 months">Within 6 months</option>
              <option value="Over 6 months ago">Over 6 months ago</option>
            </select>
          </label>
        </div>
        <div style={{ marginBottom: "20px" }}>
          <h2>Last Health Test</h2>
          <label>
            When was the last health test:
            <select
              name="lastHealthTest"
              style={{
                padding: "10px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                width: "100%",
              }}
              required
              onChange={handleOtherFormDetailsChange}
              value={updatedFormDetails.lastHealthTest}
            >
              <option value="Within 6 months">Within 6 months</option>
              <option value="Over 6 months ago">Over 6 months ago</option>
            </select>
          </label>
        </div>
        <div
          className="text-center mb-4"
          onClick={() => setMedicineForms([...medicineForms, {}])}
        >
          <b>
            <strong className="text-primary">Add Medicine</strong>
          </b>
          <FaPlus className="ml-1" />
        </div>
        {medicineForms.map((form, index) => (
          <div key={index}>
            <MedicineForm
              onChange={(formValues) =>
                handleMedicineFormChange(formValues, index)
              }
            />
            <MdDelete
              onClick={() => handleDeleteMedicineForm(index)}
              className="mb-4"
            />
          </div>
        ))}
      </div>
      <div className="mb-4">
        {/* <button
          onClick={handleCreatePrescription}
          className="bg-success border rounded px-3 text-white py-1"
        >
          Create
        </button> */}
        <button
          onClick={handlePreview}
          className="border rounded px-3 text-white py-1"
          style={{ backgroundColor: "#3a5e1c" }}
        >
          Create
        </button>
        {showPasswordPopup && (
          <DoctorPasswordPopup
            onClose={() => setPasswordPopup(false)}
            onSubmit={doctorPasswordValidation}
          />
        )}
      </div>
      {/* Preview Modal */}
      {previewVisible && (
        <div className="modal" style={modalStyle}>
          <div className="modal-content" style={modalContentStyle}>
            <span
              className="close"
              style={closeButtonStyle}
              onClick={togglePreview}
            >
              &times;
            </span>
            <h2
              className="text-secondary"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <DocPrescriptionGeneratePdf
                data={updatedFormDetails}
                // handlePDF={handleGeneratePDF}
              />
            </h2>
          </div>
        </div>
      )}
    </div>
  );
};

export default Homepage;
