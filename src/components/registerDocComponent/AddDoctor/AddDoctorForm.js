// AddDoctorForm.js
import React, { useEffect, useState } from "react";
import styles from "./AddDoctorForm.module.css";
import { Col, Row } from "react-bootstrap";
import { useDropzone } from "react-dropzone";
import ImageUploader from "../../../lib/ImageUploader";
import Preloader from "../../Preloader.js";

const AddDoctorForm = () => {
  const [diplomasCertificates, setDiplomasCertificates] = useState([]);
  const [profilePicture, setprofilePicture] = useState("");
  const [loader, setLoader] = useState(false);

  const [doctorDetails, setDoctorDetails] = useState({
    name: "",
    expertise: "",
    degree: "",
    language: "",
    workDays: "",
    overview: "",
    educationTraining: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDoctorDetails({ ...doctorDetails, [name]: value });
  };

  const handleImagesChange = (id, newImages) => {
    if (id === "profilePicture") {
      setprofilePicture(newImages.length > 0 ? newImages[0] : "");
    } else if (id === "diplomasCertificates") {
      setDiplomasCertificates(newImages);
    }
  };

  const handleSubmit = async (e) => {
    setLoader(true);
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('name', doctorDetails.name);
    formData.append('expertise', doctorDetails.expertise);
    formData.append('degree', doctorDetails.degree);
    formData.append('language', doctorDetails.language);
    formData.append('workDays', doctorDetails.workDays);
    formData.append('overview', doctorDetails.overview);
    formData.append('educationTraining', doctorDetails.educationTraining);
  
    formData.append('profilePicture', profilePicture);
    diplomasCertificates.forEach((certificate, index) => {
      formData.append(`diplomasCertificates[${index}]`, certificate);
    });

    try {
      const response = await fetch('/api/addDoctor', {
        // headers: {
        //     'Content-Type': 'application/json',
        // },
        method: 'POST',
        body: formData,
      });
  
      if (response.ok) {
        console.log('Doctor added successfully.');
        // Reset form fields or navigate to another page
      } else {
        console.error('Error adding doctor:', response.statusText);
      }
    } catch (error) {
      console.error('Error adding doctor:', error.message);
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
            />
          </label>

          <label className={styles.label}>
            <b>Works Days:</b>
            <input
              className={styles.input}
              type="text"
              name="workDays"
              value={doctorDetails.workDays}
              onChange={handleChange}
            />
          </label>

          <label className={styles.label}>
            <b>Overview:</b>
            <textarea
              className={styles.textarea}
              name="overview"
              value={doctorDetails.overview}
              onChange={handleChange}
            />
          </label>

          <label className={styles.label}>
            <b>Education + Training:</b>
            <textarea
              className={styles.textarea}
              name="educationTraining"
              value={doctorDetails.educationTraining}
              onChange={handleChange}
            />
          </label>

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
