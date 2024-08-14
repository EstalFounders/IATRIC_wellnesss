// AddDoctorForm.js
import React, { useEffect, useState } from "react";
import styles from "./AddDoctorForm.module.css";
import { Col, Row } from "react-bootstrap";
import { useDropzone } from "react-dropzone";
import ImageUploader from "../../../lib/ImageUploader.js";
import Preloader from "../../Preloader.js";
import { api } from "../../../constant.js";
import TimePicker from "react-time-picker";
import CustomDialog from "../../CustomPopup.js";
import { convertTimeIntoDate } from "../../../helper.js";

const AddDoctorForm = () => {
  const [diplomasCertificates, setDiplomasCertificates] = useState([]);
  const [profilePicture, setprofilePicture] = useState("");
  const [doctorStamp, setDoctorStamp] = useState("");
  const [doctorSignature, setDoctorSignature] = useState("");
  const [loader, setLoader] = useState(false);
  const [cpassword, setCPassword] = useState();
  const [slotStartTime, setSlotStartTime] = useState("09:00");
  const [slotEndTime, setSlotEndTime] = useState("21:00");
  const [message, setMessage] = useState("");
  const [showDialog, setShowDialog] = useState(false);

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
    doctorType: "individual",
    price: "",
    slotStartTime: "",
    slotEndTime: "",
  });

  const handleConsultationTypeChange = (e) => {
    const selectedType = e.target.value;
    setDoctorDetails({ ...doctorDetails, consultationType: e.target.value });
  };

  const handleLocationTextChange = (e) => {
    setDoctorDetails({ ...doctorDetails, location: e.target.value });
  };

  const handleShowDialog = (msg) => {
    setMessage(msg);
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setMessage("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(name, 'name', value, 'value') 
    // Parse the selected time
    if (name === "slotStartTime" || name === "slotEndTime") {
      {name === "slotStartTime" ? setSlotStartTime(value) : setSlotEndTime(value)}  
      // const [hours, minutes] = value.split(":");
      // const updatedDate = new Date(); // You can set a specific date here if needed
      // updatedDate.setHours(hours, minutes, 0, 0);
      
      setDoctorDetails({
        ...doctorDetails,
        [name]: convertTimeIntoDate(value),
      });
    } else {
      setDoctorDetails({
        ...doctorDetails,
        [name]: value,
      });
    }
  };

  const handleImagesChange = (id, newImages) => {
    if (id === "profilePicture") {
      setprofilePicture(newImages.length > 0 ? newImages[0] : "");
    } else if (id === "diplomasCertificates") {
      setDiplomasCertificates(newImages);
    } else if (id === "doctorStamp") {
      setDoctorStamp(newImages.length > 0 ? newImages[0] : "");
    } else if (id === "doctorSignature") {
      setDoctorSignature(newImages.length > 0 ? newImages[0] : "");
    }
  };

  

  const handleSubmit = async (e) => {
    console.log(doctorDetails, "doctor details");
    setLoader(true);
    e.preventDefault();

    if (doctorDetails.password != cpassword) {
      return handleShowDialog("Password is not matching");
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
    formData.append("digitalSignature", doctorSignature);
    formData.append("location", doctorDetails.location);
    formData.append("profilePicture", profilePicture);
    formData.append("doctorType", doctorDetails.doctorType);
    formData.append("price", doctorDetails.price);
    formData.append("slotStartTime", doctorDetails.slotStartTime);
    formData.append("slotEndTime", doctorDetails.slotEndTime);
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
        handleShowDialog(response.message)
        // Reset form fields or navigate to another page
      } else {
        console.error("Error adding doctor:", response.statusText);
        handleShowDialog("Something went wrong, please try again")
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
            <option value="Off-line consultations">
              Off-line consultations
            </option>
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
                <b>Price</b>
                <input
                  type="number"
                  name="price"
                  value={doctorDetails.price}
                  onChange={handleChange}
                  className={styles.input}
                />
              </label>
            </Col>

            <Col className="ml-5">
              <label className={styles.label}>
                <b>Doctor Type</b>
                <select
                  name="doctorType"
                  value={doctorDetails.doctorType}
                  onChange={handleChange}
                  className={styles.select}
                >
                  <option value="individual">Individual</option>
                  <option value="company">Company</option>
                </select>
              </label>
            </Col>
          </Row>
          <Row>
            <Col>
              <label className={styles.label}>
                <b>Start time:</b>
                <input
                  type="time"
                  id="slotStartTime"
                  name="slotStartTime"
                  value={slotStartTime}
                  onChange={handleChange}
                  min="09:00"
                  max="21:00"
                  className={styles.input}
                />
              </label>
            </Col>

            <Col className="ml-5">
              <label className={styles.label}>
                <b>End time:</b>
                <input
                  type="time"
                  id="slotEndTime"
                  name="slotEndTime"
                  value={slotEndTime}
                  onChange={handleChange}
                  min="09:00"
                  max="21:00"
                  className={styles.input}
                />
              </label>
            </Col>
          </Row>
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
                <ImageUploader
                  id="doctorSignature"
                  multiple={false}
                  onImagesChange={handleImagesChange}
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
        <CustomDialog
            show={showDialog}
            handleClose={handleCloseDialog}
            message={message}
          />
      </form>
      {loader && <Preloader />}
    </div>
  );
};

export default AddDoctorForm;
