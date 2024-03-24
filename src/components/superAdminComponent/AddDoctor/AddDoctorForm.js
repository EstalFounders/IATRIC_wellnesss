// AddDoctorForm.js
import React, { useEffect, useState } from "react";
import styles from "./AddDoctorForm.module.css";
import { Col, Row } from "react-bootstrap";
import { useDropzone } from "react-dropzone";
import ImageUploader from "../../../lib/ImageUploader.js";
import Preloader from "../../Preloader.js";
import Popup from "../../Popup.js";
import { api } from "../../../constant.js";
import DigitalSignature from "../lib/DigitalSignature.js";

const AddDoctorForm = () => {
  const [diplomasCertificates, setDiplomasCertificates] = useState([]);
  const [profilePicture, setprofilePicture] = useState("");
  const [doctorStamp, setDoctorStamp] = useState("");
  const [loader, setLoader] = useState(false);
  const [cpassword, setCPassword] = useState();

  const [doctorDetails, setDoctorDetails] = useState({
    name: "",
    email: "",
    expertise: "",
    degree: "",
    language: "",
    workDays: "",
    overview: "",
    location: "None",
    workExperience: "",
    educationTraining: "",
    consultationType: "",
    password: "",
    digitalSignature: "",
  });

  const handleSignatureChange = (signatureData) => {
    setDoctorDetails({ ...doctorDetails, digitalSignature: signatureData });
  };

  const handleConsultationTypeChange = (e) => {
    const selectedType = e.target.value;
    setDoctorDetails({ ...doctorDetails, consultationType: e.target.value });
  };

  const handleLocationTextChange = (e) => {
    setDoctorDetails({ ...doctorDetails, location: e.target.value });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDoctorDetails({ ...doctorDetails, [name]: value });
  };

  const handleImagesChange = (id, newImages) => {
    if (id === "profilePicture") {
      setprofilePicture(newImages.length > 0 ? newImages[0] : "");
    } else if (id === "diplomasCertificates") {
      setDiplomasCertificates(newImages);
    } else if (id === "doctorStamp") {
      setDoctorStamp(newImages.length > 0 ? newImages[0] : "");
    }
  };

  const handleSubmit = async (e) => {
    setLoader(true);
    e.preventDefault();

    if (doctorDetails.password != cpassword) {
      return window.alert("password is not matching");
    }

    const formData = new FormData();
    formData.append("name", doctorDetails.name);
    formData.append("email", doctorDetails.email);
    formData.append("expertise", doctorDetails.expertise);
    formData.append("degree", doctorDetails.degree);
    formData.append("language", doctorDetails.language);
    formData.append("workDays", doctorDetails.workDays);
    formData.append("overview", doctorDetails.overview);
    formData.append("educationTraining", doctorDetails.educationTraining);
    formData.append("workExperience", doctorDetails.workExperience);
    formData.append("consultationType", doctorDetails.consultationType);
    formData.append("password", doctorDetails.password);
    formData.append("digitalSignature", doctorDetails.digitalSignature);
    formData.append("location", doctorDetails.location);
    formData.append("profilePicture", profilePicture);
    formData.append("doctorStamp", doctorStamp);
    diplomasCertificates.forEach((certificate, index) => {
      formData.append(`diplomasCertificates[${index}]`, certificate);
    });

    
    try {
      const response = await fetch(api.addDoctor, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        window.alert("Doctor added successfully.");
        window.location.reload();
        // Reset form fields or navigate to another page
      } else {
        console.error("Error adding doctor:", response.statusText);
      }
    } catch (error) {
      console.error("Error adding doctor:", error.message);
    }
    setLoader(false);
  };

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.heading}>Add Doctor</h2>
      <form onSubmit={handleSubmit}>
        <Row>
          <label className={styles.label}>
            <b>Name:</b>
            <input
              className={styles.input}
              type="text"
              name="name"
              value={doctorDetails.name}
              onChange={handleChange}
              required
            />
          </label>

          <label className={styles.label}>
            <b>Email:</b>
            <input
              className={styles.input}
              type="email"
              name="email"
              value={doctorDetails.email}
              onChange={handleChange}
              required
            />
          </label>

          <label className={styles.label}>
            <b>Area of Expertise:</b>
            <input
              className={styles.input}
              type="text"
              name="expertise"
              value={doctorDetails.expertise}
              onChange={handleChange}
              required
            />
          </label>

          <label className={styles.label}>
            <b>Degree:</b>
            <input
              className={styles.input}
              type="text"
              name="degree"
              value={doctorDetails.degree}
              onChange={handleChange}
              required
            />
          </label>

          <label className={styles.label}>
            <b>Language:</b>
            <input
              className={styles.input}
              type="text"
              name="language"
              value={doctorDetails.language}
              onChange={handleChange}
              required
            />
          </label>

          <label className={styles.label}>
            <b>Work Experience:</b>
            <input
              className={styles.input}
              type="text"
              name="workExperience"
              value={doctorDetails.workExperience}
              onChange={handleChange}
              required
            />
          </label>

          {/* <label htmlFor="consultationType" className={styles.label}>
            Consultation Type:
          </label> */}
          <select
            id="consultationType"
            className={styles.input}
            style={{ marginLeft: 10 }}
            value={doctorDetails.consultationType}
            onChange={handleConsultationTypeChange}
          >
            <option value="">Select Consultation Type</option>
            <option value="Online consultations">Online consultations</option>
            <option value="Off-line consultations">Off-line consultations</option>
            <option value="Home visit">Home visit</option>
          </select>
          {(doctorDetails.consultationType === "Off-line consultations" ||
            doctorDetails.consultationType === "Home visit") && (
            <div>
              <label htmlFor="Location" className="ml-3">
                Location:
              </label>
              <input
                type="text"
                id="Location"
                className={styles.input}
                style={{ marginLeft: 10 }}
                value={doctorDetails.location}
                onChange={handleLocationTextChange}
              />
            </div>
          )}

          <label className={styles.label}>
            <b>Works Days:</b>
            <input
              className={styles.input}
              type="text"
              name="workDays"
              value={doctorDetails.workDays}
              onChange={handleChange}
              required
            />
          </label>

          <label className={styles.label}>
            <b>Overview:</b>
            <textarea
              className={styles.textarea}
              name="overview"
              value={doctorDetails.overview}
              onChange={handleChange}
              required
            />
          </label>

          <label className={styles.label}>
            <b>Education + Training:</b>
            <textarea
              className={styles.textarea}
              name="educationTraining"
              value={doctorDetails.educationTraining}
              onChange={handleChange}
              required
            />
          </label>
          <Row>
            <Col>
              <label className={styles.label}>
                <b>Password:</b>
                <input
                  className={styles.input}
                  type="password"
                  name="password"
                  value={doctorDetails.password || ""}
                  onChange={handleChange}
                  required
                />
              </label>
            </Col>

            <Col>
              <label className={styles.label}>
                <b>Confirm Password:</b>
                <input
                  className={styles.input}
                  type="password"
                  name="confirm_password"
                  value={cpassword || ""}
                  onChange={(e) => setCPassword(e.target.value)}
                  required
                />
              </label>
            </Col>
          </Row>

          <Row>
            <Col>
              <label className={styles.label}>
                <b>Diplomas and Certificates:</b>
                <ImageUploader
                  id="diplomasCertificates"
                  multiple={true}
                  onImagesChange={handleImagesChange}
                />
              </label>
            </Col>
            <Col>
              <label className={styles.label}>
                <b>Doctor Picture:</b>
                <ImageUploader
                  id="profilePicture"
                  multiple={true}
                  onImagesChange={handleImagesChange}
                />
              </label>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <label className={styles.label}>
                <b>Digital Signature:</b>
                <DigitalSignature
                  name={doctorDetails.name}
                  onSignatureChange={handleSignatureChange}
                  required
                />
              </label>
            </Col>
            <Col>
              <label className={styles.label}>
                <b>Doctor Stamp:</b>
                <ImageUploader
                  id="doctorStamp"
                  multiple={false}
                  onImagesChange={handleImagesChange}
                  required
                />
              </label>
            </Col>
          </Row>
        </Row>

        <Row className="mt-4">
          <Col className="text-center">
            <button className={styles.button} type="submit">
              Add Doctor
            </button>
          </Col>
        </Row>
      </form>
      {loader && <Preloader />}
    </div>
  );
};

export default AddDoctorForm;
