// pages/homepage.js

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { Button, Col, Row } from "react-bootstrap";
import MedicineForm from "../registerDocComponent/lib/MedicineForm";
import { FaPlus } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import DocPrescriptionGeneratePdf from "../registerDocComponent/lib/DoctorPrescriptionGenerator";
import {
  api,
  appointment_status,
  doctor_info_local_storage,
} from "../../constant";
import bcrypt from "bcryptjs";
import DoctorPasswordPopup from "../registerDocComponent/lib/DoctorPasswordPopup";
import { useSelector } from "react-redux";
import {
  ADVICES,
  CHIEF_COMPLAINTS_TXT,
  KNOWN_CASES_TXT,
  LAST_HEALTH_TEXT_DONE_TXT,
  NOTES,
  TEST_ADVICES,
  UNDER_TREATMENT_TXT,
} from "./utils/constant";
import { IoIosClose } from "react-icons/io";
import { BiPencil, BiSolidPencil } from "react-icons/bi";

const PrescriptionComp = () => {
  const [availableTests, setAvailableTests] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [medicineForms, setMedicineForms] = useState([]);
  const [showPasswordPopup, setPasswordPopup] = useState(false);
  const doctorInfo = JSON.parse(
    sessionStorage.getItem(doctor_info_local_storage)
  );
  const [doctors, setDoctors] = useState(doctorInfo.user);
  const [doctorPassword, setDoctorPassword] = useState(doctors.password);

  const appointments = useSelector((state) => state.appointment.appointments);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedName, setSelectedName] = useState("");
  const [testAdviceSearchTerm, setTestAdviceSearchTerm] = useState("");
  const [testAdviceSuggestions, setTestAdviceSuggestions] = useState([]);
  const [showTestAdviceDropdown, setShowTestAdviceDropdown] = useState(false);

  console.log(doctorInfo, "doctoinfo", appointments, "appointments");
  const [updatedFormDetails, setUpdatedFormDetails] = useState({
    doctorName: "",
    doctorDegree: doctorInfo.user.degree,
    doctorMobNo: doctorInfo.user.mobileNumber,
    patientName: "",
    age: "",
    gender: "Male",
    patientNo: "",
    patientId: "",
    anyDrugAllergy: "No known allergy from medicine",
    // lastDoctorVisit: "Within 1 month",
    lastHealthTest: "Within 6 months",
    medicineInfo: [],
    knownCases: "",
    underTreatmentSince: "",
    cheifCompalaints: "",
    advices: "",
    notes: "",
    testAdvices: [],
    doctorStampUrl: "",
    doctorSignatureUrl: "",
    appointmentId: "",
    // Add more fields as needed
  });

  const handleMedicineFormChange = (formValues, index) => {
    console.log(formValues, "form value in homepage");
    const updatedMedicineForms = [...medicineForms];
    updatedMedicineForms[index] = formValues;
    setMedicineForms(updatedMedicineForms);
  };

  const handleOtherFormDetailsChange = (formValues, index) => {
    if (formValues.target) {
      // Handling a single input change (like before)
      const { name, value } = formValues.target;
      setUpdatedFormDetails((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    } else {
      // Handling multiple field updates
      setUpdatedFormDetails((prevState) => ({
        ...prevState,
        ...formValues, // Spread the formValues object to update multiple keys
      }));
    }
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
    console.log(password, "password in prescription");
    const isPasswordCorrect = password === doctorPassword;
    // = bcrypt.compareSync(password, doctorPassword);

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
    // if (!doctorPassword) {
    //   return window.alert("Please select doctor");
    // }
    setPasswordPopup(true);
    setUpdatedFormDetails({
      ...updatedFormDetails,
      medicineInfo: [...medicineForms], // Update medicineInfo with the contents of medicineForms
      doctorName: doctors.name,
      doctorStampUrl: doctors.doctorStampUrl,
      doctorSignatureUrl: doctors.doctorSignatureUrl,
    });
    // togglePreview();
    // Optionally, you can also perform any other actions here before showing the preview
    console.log(updatedFormDetails, "updated form details before");
  };

  // useEffect(() => {
  //   // Update medicineInfo whenever medicineForms changes
  //   setUpdatedFormDetails({
  //     ...updatedFormDetails,
  //     medicineInfo: [...medicineForms], // Update medicineInfo with the contents of medicineForms
  //   });
  // }, [medicineForms, updatedFormDetails]);

  // const handleDoctorSelect = (event) => {
  //   const selectedDoctor = JSON.parse(event.target.value);
  //   setUpdatedFormDetails({
  //     ...updatedFormDetails,
  //     doctorName: selectedDoctor.name,
  //     doctorStampUrl: selectedDoctor.doctorStampUrl,
  //     doctorSignatureUrl: selectedDoctor.doctorSignatureUrl,
  //   });
  //   setDoctorPassword(selectedDoctor.password);
  // };

  const handleInputChange = (event) => {
    const value = event.target.value;
    console.log(value, "value in handle input change 149");
    setSearchTerm(value);
    // Show dropdown immediately when input changes
    setShowDropdown(true);

    const filteredAppointments = appointments.filter(
      (appointment) =>
        appointment.name &&
        appointment.name.toLowerCase().includes(value.toLowerCase())
    );
    setSuggestions(filteredAppointments);

    // Call the original change handler if you need to track the raw input
    if (isEditing) {
      handleOtherFormDetailsChange({ patientName: value });
    }
  };

  const handleInputClick = () => {
    // Show the full list of names when the input is clicked (if not already shown)
    if (!showDropdown) {
      setSuggestions(appointments);
      setShowDropdown(true);
    }
    setIsEditing(false); // Reset to view mode on click
    setSelectedName("");
  };

  const handleSuggestionClick = (appointment) => {
    setSearchTerm(appointment.name);
    setSelectedName(appointment.name); // Store the selected name
    setShowDropdown(false);
    setIsEditing(false); // Go to view mode after selection
    handleOtherFormDetailsChange({
      patientName: appointment.name,
      patientId: appointment._id,
      patientNo: appointment.patientMobNo,
      appointmentId: appointment._id,
    });
    // handleOtherFormDetailsChange({
    //   target: { name: "patientId", value: appointment._id },
    // });
    // handleOtherFormDetailsChange({
    //   target: { name: "patientNo", value: appointment.patientMobNo },
    // });
  };

  const handleBlur = () => {
    setTimeout(() => {
      setShowDropdown(false);
    }, 100);
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  useEffect(() => {
    // Initialize suggestions with all appointments on initial load
    setSuggestions(appointments);
  }, [appointments]);

  const handleTestAdviceInputChange = (event) => {
    const value = event.target.value;
    setTestAdviceSearchTerm(value);
    setShowTestAdviceDropdown(true);

    const filteredAdvices = availableTests.filter((test) =>
      test.testName.toLowerCase().includes(value.toLowerCase())
    );
    const testName = filteredAdvices.map((test) => test.testName);
    console.log(testName, "test name");
    setTestAdviceSuggestions(testName);
  };

  const handleTestAdviceSuggestionClick = (advice) => {
    console.log(advice, "advice");
    setUpdatedFormDetails((prevDetails) => ({
      ...prevDetails,
      testAdvices: [...prevDetails.testAdvices, advice],
    }));
    setTestAdviceSearchTerm("");
    setTestAdviceSuggestions([]);
    setShowTestAdviceDropdown(false);
  };

  const handleInputKeyDown = (event) => {
    if (event.key === "Enter" && testAdviceSearchTerm) {
      const matchingTest = availableTests.find(
        (test) =>
          test.testName.toLowerCase() === testAdviceSearchTerm.toLowerCase()
      );
      if (matchingTest) {
        setUpdatedFormDetails((prevDetails) => ({
          ...prevDetails,
          testAdvices: [...prevDetails.testAdvices, matchingTest.testName], // Changed this line
        }));
      } else {
        setUpdatedFormDetails((prevDetails) => ({
          ...prevDetails,
          testAdvices: [...prevDetails.testAdvices, testAdviceSearchTerm],
        }));
      }
      setTestAdviceSearchTerm("");
    }
  };

  const handleTestAdviceBlur = () => {
    setTimeout(() => {
      setShowTestAdviceDropdown(false);
    }, 100);
  };

  const handleRemoveAdvice = (index) => {
    setUpdatedFormDetails((prevDetails) => ({
      ...prevDetails,
      testAdvices: prevDetails.testAdvices.filter((_, i) => i !== index),
    }));
  };

  const fetchAvailableTests = async () => {
    try {
      // setIsLoadingTests(true); // Show loader while fetching
      const response = await fetch(api.labTestDetails); // Replace with your API endpoint
      const data = await response.json();
      console.log(data, "data on 59");
      setAvailableTests(data || []); // Assuming the API returns { tests: [...] }
    } catch (error) {
      console.error("Error fetching available tests:", error);
    } finally {
      // setIsLoadingTests(false); // Hide loader once done
    }
  };

  useEffect(() => {
    fetchAvailableTests();
  }, []);

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
        fontFamily: "TT Ramillas, sans-serif",
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
                <div className="font-weight-bold">
                  {" "}
                  Dr {doctorInfo.user.name}
                </div>
              </div>
            </div>
            <Row>
              <Col>
                <label>
                  Patient Name:
                  <div
                    style={{
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {isEditing ? (
                      <input
                        type="text"
                        name="patientName"
                        style={{
                          padding: "10px",
                          borderRadius: "5px",
                          border: "1px solid #ccc",
                          width: "100%",
                          marginRight: "8px",
                        }}
                        required
                        value={searchTerm}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        autoComplete="off"
                      />
                    ) : (
                      <div
                        style={{
                          padding: "10px",
                          borderRadius: "5px",
                          border: "1px solid #ccc",
                          width: "100%",
                          marginRight: "8px",
                          cursor: "pointer",
                          backgroundColor: "#f0f0f0",
                        }}
                        onClick={handleInputClick}
                      >
                        {selectedName || "Select Patient"}
                      </div>
                    )}
                    {console.log(
                      isEditing,
                      "isEditing",
                      selectedName,
                      "selectedName"
                    )}
                    {!isEditing && selectedName && (
                      <BiSolidPencil size={16} onClick={handleEditClick} />
                    )}
                    {showDropdown && (
                      <div
                        style={{
                          position: "absolute",
                          top: "calc(100% + 2px)",
                          left: 0,
                          width: "100%",
                          backgroundColor: "white",
                          border: "1px solid #ccc",
                          borderRadius: "5px",
                          zIndex: 10,
                          maxHeight: "150px",
                          overflowY: "auto",
                        }}
                      >
                        {suggestions
                          .filter(
                            (appointment) =>
                              appointment.status !==
                              appointment_status.completed
                          )
                          .map((appointment) => (
                            <div
                              key={appointment.id || appointment.name}
                              style={{ padding: "8px", cursor: "pointer" }}
                              onClick={() => handleSuggestionClick(appointment)}
                            >
                              {appointment.name}
                            </div>
                          ))}
                      </div>
                    )}
                    {showDropdown && suggestions.length === 0 && searchTerm && (
                      <div
                        style={{
                          position: "absolute",
                          top: "calc(100% + 2px)",
                          left: 0,
                          width: "100%",
                          backgroundColor: "white",
                          border: "1px solid #ccc",
                          borderRadius: "5px",
                          zIndex: 10,
                          padding: "8px",
                          fontStyle: "italic",
                          color: "#777",
                        }}
                      >
                        No matching patients
                      </div>
                    )}
                    {showDropdown &&
                      suggestions.length === 0 &&
                      !searchTerm && (
                        <div
                          style={{
                            position: "absolute",
                            top: "calc(100% + 2px)",
                            left: 0,
                            width: "100%",
                            backgroundColor: "white",
                            border: "1px solid #ccc",
                            borderRadius: "5px",
                            zIndex: 10,
                            padding: "8px",
                            fontStyle: "italic",
                            color: "#777",
                          }}
                        >
                          No appointments available
                        </div>
                      )}
                  </div>
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
          <h2>{KNOWN_CASES_TXT}</h2>
          <input
            name="knownCases"
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
          <h2>{UNDER_TREATMENT_TXT}</h2>
          <input
            name="underTreatmentSince"
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
          <h2>{CHIEF_COMPLAINTS_TXT}</h2>
          <input
            name="cheifCompalaints"
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
          <h2>{LAST_HEALTH_TEXT_DONE_TXT}</h2>
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
        <div style={{ marginBottom: "20px" }}>
          <h2>{ADVICES}</h2>
          <input
            name="advices"
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
          <h2>{NOTES}</h2>
          <input
            name="notes"
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
          <h2>Test Advices</h2>
          <div style={{ position: "relative" }}>
            <input
              name="testAdvicesInput"
              type="text"
              style={{
                padding: "10px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                width: "100%",
              }}
              value={testAdviceSearchTerm}
              onChange={handleTestAdviceInputChange}
              onKeyDown={handleInputKeyDown}
              onBlur={handleTestAdviceBlur}
            />
            {showTestAdviceDropdown && testAdviceSuggestions.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 2px)",
                  left: 0,
                  width: "100%",
                  backgroundColor: "white",
                  border: "1px solid #ccc",
                  borderRadius: "5px",
                  zIndex: 10,
                  maxHeight: "150px",
                  overflowY: "auto",
                }}
              >
                {testAdviceSuggestions.map((advice) => (
                  <div
                    key={advice}
                    style={{ padding: "8px", cursor: "pointer" }}
                    onClick={() => handleTestAdviceSuggestionClick(advice)}
                  >
                    {advice}
                  </div>
                ))}
              </div>
            )}
            {showTestAdviceDropdown &&
              testAdviceSuggestions.length === 0 &&
              testAdviceSearchTerm && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 2px)",
                    left: 0,
                    width: "100%",
                    backgroundColor: "white",
                    border: "1px solid #ccc",
                    borderRadius: "5px",
                    zIndex: 10,
                    padding: "8px",
                    fontStyle: "italic",
                    color: "#777",
                  }}
                >
                  No matching tests
                </div>
              )}
          </div>
          {updatedFormDetails.testAdvices.length > 0 && (
            <div style={{ marginTop: "10px" }}>
              <strong>Added Tests:</strong>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {updatedFormDetails.testAdvices.map((advice, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "4px 8px",
                      backgroundColor: "#e0e0e0",
                      borderRadius: "16px",
                      border: "1px solid #ccc",
                      gap: "4px",
                    }}
                  >
                    <span>{advice}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveAdvice(index)}
                      className="p-0 h-6 w-6"
                    >
                      <IoIosClose className="h-4 w-4 text-gray-600 hover:text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
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

export default PrescriptionComp;
