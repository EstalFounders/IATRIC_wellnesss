// AddDoctorForm.js
import React, { useEffect, useState } from "react";
import styles from "./AddDoctorForm.module.css";
import { Button, Col, Row } from "react-bootstrap";
import { useDropzone } from "react-dropzone";
import ImageUploader from "../../../lib/ImageUploader.js";
import Preloader from "../../Preloader.js";
import {
  api,
  DoctorType,
  superAdminConsultationtype,
} from "../../../constant.js";
import TimePicker from "react-time-picker";
import WorkDaysPicker from "../../Common/WorkDaysPicker.js";
import EducationTrainingInput from "../../Common/EducationTrainingInput.js";
import LanguageInput from "../../Common/LanguageInput.js";
import { appendEducationTraining } from "../../../customUtils/educationTraining.js";
import {
  appendLanguages,
  parseLanguages,
} from "../../../customUtils/languages.js";
import CustomDialog from "../../CustomPopup.js";
import { convertTimeIntoDate, isMobileValid } from "../../../helper.js";
import { useDispatch, useSelector } from "react-redux";
import { setConsultationType } from "../../../store/slices/superAdmin/otherDetailsSlice.js";
import { setServiceOffered } from "../../../store/slices/superAdmin/homepageSlice.js";

/**
 * Fields that MUST be filled to register a doctor. Everything else on this form
 * (gender, education + training, price, doctor share, passwords, picture /
 * certificates / stamp / signature, slot times) is optional for now.
 * `consultationType` and `serviceOffered` cannot use HTML `required` because
 * their visible <select> always keeps `value=""`, so they are validated through
 * `selectedTypes` / `selectedService` in `handleSubmit` instead. `workDays` uses
 * the <WorkDaysPicker /> chips; its state is an array of day names that is kept
 * in `doctorDetails.workDays` as a comma-joined string (the doctor schema stores
 * a String and `pages/api/addDoctor.js` forwards it verbatim). `educationTraining`
 * uses the same "draft rows live in their own state" pattern as
 * <EducationTrainingInput />: the rows are held in `educationItems`, blank rows
 * are dropped on submit and every remaining entry becomes its own FormData field.
 * `language` is repeatable the same way (<LanguageInput /> + `languageItems`), so
 * it is validated in `handleSubmit` rather than in the list below.
 */
const MANDATORY_TEXT_FIELDS = [
  ["name", "Name"],
  ["email", "Email"],
  ["mobileNumber", "Mobile Number"],
  ["expertise", "Area of Expertise"],
  ["workExperience", "Work Experience"],
  ["workDays", "Work Days"],
  ["overview", "Overview"],
];

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
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedService, setSelectedService] = useState([]);
  // Array of canonical day names; mirrored into doctorDetails.workDays as a
  // comma-joined string, which is what the API stores.
  const [selectedWorkDays, setSelectedWorkDays] = useState([]);
  const [workDaysError, setWorkDaysError] = useState("");
  // Draft rows for the repeatable education/training inputs; blank rows are
  // filtered out on submit by `appendEducationTraining`.
  const [educationItems, setEducationItems] = useState([""]);
  // Draft rows for the repeatable language inputs; blank rows are filtered out on
  // submit by `appendLanguages`. The field is mandatory, so `handleSubmit` raises
  // an inline error (the same pattern as the work-day chips).
  const [languageItems, setLanguageItems] = useState([""]);
  const [languageError, setLanguageError] = useState("");
  const dispatch = useDispatch();

  const [doctorDetails, setDoctorDetails] = useState({
    name: "",
    email: "",
    expertise: "",
    gender: "",
    workDays: "",
    overview: "",
    location: "None",
    workExperience: "",
    consultationType: "",
    serviceOffered: "",
    password: "",
    doctorType: DoctorType.individual,
    doctorShare: "",
    price: "",
    slotStartTime: "",
    slotEndTime: "",
    mobileNumber: "",
  });

  const storedService = useSelector(
    (state) => state.superAdminHomePage.serviceOffered,
  );

  const consultationTypeStore = useSelector(
    (state) => state.otherDetailsSlice.consultationType,
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
  }, []);

  const handleAddType = (e) => {
    const value = e.target.value;

    if (value && !selectedTypes.includes(value)) {
      setSelectedTypes((prevTypes) => {
        const updatedTypes = [...prevTypes, value];

        // Update doctorDetails with the new consultationType
        setDoctorDetails((prevDetails) => ({
          ...prevDetails,
          consultationType: updatedTypes, // Ensure it updates with latest array
        }));

        return updatedTypes;
      });
    }
  };

  // Remove option from array when "tag" is clicked
  const handleRemoveType = (type) => {
    const updatedTypes = selectedTypes.filter((item) => item !== type);
    setSelectedTypes(updatedTypes);
    // Keep doctorDetails in sync, otherwise the removed tag is still submitted.
    setDoctorDetails((prevDetails) => ({
      ...prevDetails,
      consultationType: updatedTypes,
    }));
  };

  const handleAddService = (e) => {
    const value = e.target.value;

    if (value && !selectedService.includes(value)) {
      setSelectedService((prevTypes) => {
        const updatedService = [...prevTypes, value];

        // Update doctorDetails with the new consultationType
        setDoctorDetails((prevDetails) => ({
          ...prevDetails,
          serviceOffered: updatedService, // Ensure it updates with latest array
        }));

        return updatedService;
      });
    }
  };

  // Remove option from array when "tag" is clicked
  const handleRemoveService = (type) => {
    const updatedService = selectedService.filter((item) => item !== type);
    setSelectedService(updatedService);
    // Keep doctorDetails in sync, otherwise the removed tag is still submitted.
    setDoctorDetails((prevDetails) => ({
      ...prevDetails,
      serviceOffered: updatedService,
    }));
  };

  const handleLocationTextChange = (e) => {
    setDoctorDetails({ ...doctorDetails, location: e.target.value });
  };

  // <WorkDaysPicker /> already returns a Monday -> Sunday ordered array.
  const handleWorkDaysChange = (days) => {
    setSelectedWorkDays(days);
    setDoctorDetails((prevDetails) => ({
      ...prevDetails,
      workDays: days.join(","),
    }));
    if (days.length > 0) setWorkDaysError("");
  };

  // Languages - draft rows in, array out; `editedDoctor`-style payloads and the
  // FormData body are built on submit by `appendLanguages`.
  const handleLanguagesChange = (items) => {
    setLanguageItems(items);
    if (parseLanguages(items).length > 0) setLanguageError("");
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
    console.log(name, "name", value, "value");
    // Parse the selected time
    if (name === "slotStartTime" || name === "slotEndTime") {
      {
        name === "slotStartTime"
          ? setSlotStartTime(value)
          : setSlotEndTime(value);
      }
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

    // The day picker keeps its own array state; the inline message under the
    // chips is set here so it appears together with the missing-field dialog.
    const hasWorkDays = selectedWorkDays.length > 0;
    setWorkDaysError(hasWorkDays ? "" : "Please select at least one workday");

    const missingFields = MANDATORY_TEXT_FIELDS.filter(
      ([key]) => !String(doctorDetails[key] ?? "").trim(),
    ).map(([, label]) => label);

    // Languages live in their own draft-row state, so they cannot be part of the
    // `MANDATORY_TEXT_FIELDS` loop above.
    const hasLanguages = parseLanguages(languageItems).length > 0;
    setLanguageError(hasLanguages ? "" : "Please add at least one language");
    if (!hasLanguages) {
      missingFields.push("Language");
    }

    if (selectedTypes.length === 0) {
      missingFields.push("Select Consultation Type");
    }
    if (selectedService.length === 0) {
      missingFields.push("Select Services Offered");
    }

    if (missingFields.length > 0) {
      setLoader(false);
      return handleShowDialog(
        `Please fill the mandatory field(s): ${missingFields.join(", ")}`,
      );
    }

    // Passwords are optional; they only have to match when one of them is filled.
    if (
      (doctorDetails.password || cpassword) &&
      doctorDetails.password !== cpassword
    ) {
      setLoader(false);
      return handleShowDialog("Password is not matching");
    }
    if (!isMobileValid(doctorDetails.mobileNumber)) {
      setLoader(false);
      return handleShowDialog("Please correct mobile number");
    }

    const formData = new FormData();
    formData.append("name", doctorDetails.name);
    formData.append("email", doctorDetails.email);
    formData.append("gender", doctorDetails.gender);
    formData.append("mobileNumber", doctorDetails.mobileNumber);
    formData.append("expertise", doctorDetails.expertise);
    // One field per entry; a blank field clears the list on the API side.
    appendLanguages(formData, languageItems);
    formData.append("workDays", doctorDetails.workDays);
    formData.append("overview", doctorDetails.overview);
    // One field per entry; a blank field clears the list on the API side.
    appendEducationTraining(formData, educationItems);
    formData.append("workExperience", doctorDetails.workExperience);
    // Comma-joined, `pages/api/addDoctor.js` splits these back into arrays.
    formData.append("consultationType", selectedTypes.join(","));
    formData.append("serviceOffered", selectedService.join(","));
    formData.append("password", doctorDetails.password);
    formData.append("digitalSignature", doctorSignature);
    formData.append("location", doctorDetails.location);
    formData.append("profilePicture", profilePicture);
    formData.append("doctorType", doctorDetails.doctorType);
    formData.append("price", doctorDetails.price);
    formData.append("slotStartTime", doctorDetails.slotStartTime);
    formData.append("slotEndTime", doctorDetails.slotEndTime);
    formData.append("doctorStamp", doctorStamp);
    formData.append("doctorShare", doctorDetails.doctorShare);
    diplomasCertificates.forEach((certificate, index) => {
      formData.append(`diplomasCertificates[${index}]`, certificate);
    });

    try {
      const response = await fetch(api.addDoctor, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        handleShowDialog("Doctor registered successfully");
        // Reset form fields or navigate to another page
      } else {
        console.error("Error adding doctor:", response.statusText);
        handleShowDialog("Something went wrong, please try again");
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
            <b>Mobile Number:</b>
            <input
              className={styles.input}
              type="number"
              name="mobileNumber"
              value={doctorDetails.mobileNumber}
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

          <div className={styles.label}>
            <b>Language:</b>
            <LanguageInput
              value={languageItems}
              onChange={handleLanguagesChange}
              error={languageError}
            />
          </div>

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
          <div className="font-weight-bold row ml-0">
            <div className="col-md-6">
              <label>Select Consultation Type:</label>
              <select
                id="consultationType"
                className={styles.input}
                onChange={handleAddType}
                value=""
              >
                <option value="" disabled>
                  Select options
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

              {/* Display selected options as "tags" */}
              <div className={styles.tagsContainer}>
                {selectedTypes.map((type) => (
                  <div key={type} className={styles.tag}>
                    {type}
                    <button
                      type="button"
                      className={styles.removeButton}
                      onClick={() => handleRemoveType(type)}
                    >
                      ✖
                    </button>
                  </div>
                ))}
              </div>

              {/* Location input for specific consultation types */}
              {(selectedTypes.includes("Off-line consultations") ||
                selectedTypes.includes("Home visit")) && (
                <div>
                  <label htmlFor="Location" className="ml-3">
                    Location:
                  </label>
                  <input
                    type="text"
                    id="Location"
                    className={styles.input}
                    placeholder="Enter location"
                  />
                </div>
              )}
            </div>

            <div className="font-weight-bold col-md-6">
              <label>Select Services Offered:</label>
              <select
                id="ServicesOffered"
                className={styles.input}
                onChange={handleAddService}
                value=""
              >
                <option value="" disabled>
                  Select options
                </option>
                {storedService
                  .filter((option) => option.isActive !== false)
                  .map((option) => (
                    <option
                      key={option._id || option.name}
                      value={option.name}
                      disabled={selectedService.includes(option.name)}
                    >
                      {option.name}
                    </option>
                  ))}
              </select>

              {/* Display selected options as "tags" */}
              <div className={styles.tagsContainer}>
                {selectedService.map((type) => (
                  <div key={type} className={styles.tag}>
                    {type}
                    <button
                      type="button"
                      className={styles.removeButton}
                      onClick={() => handleRemoveService(type)}
                    >
                      ✖
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.label}>
            <b>Work Days:</b>
            <WorkDaysPicker
              value={selectedWorkDays}
              onChange={handleWorkDaysChange}
              error={workDaysError}
            />
          </div>

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

          <div className={styles.label}>
            <b>Education + Training:</b>
            <EducationTrainingInput
              value={educationItems}
              onChange={setEducationItems}
            />
          </div>
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
            <Col>
              <label className={styles.label}>
                <b>Doctor Share (%)</b>
                <input
                  type="number"
                  name="doctorShare"
                  value={doctorDetails.doctorShare}
                  onChange={handleChange}
                  className={styles.input}
                  min="0"
                  max="100"
                />
              </label>
            </Col>
            <Col>
              <label className={styles.label}>
                <b>Doctor Type</b>
                <select
                  name="doctorType"
                  value={doctorDetails.doctorType}
                  onChange={handleChange}
                  className={styles.select}
                >
                  <option value={DoctorType.individual}>
                    {DoctorType.individual}
                  </option>
                  <option value={DoctorType.company}>
                    {DoctorType.company}
                  </option>
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
                  min="08:00"
                  max="23:00"
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
                  min={slotStartTime}
                  max="23:00"
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
                />
              </label>
            </Col>
          </Row>

          <Row>
            <Col>
              <div className={styles.label}>
                <b>Diplomas and Certificates:</b>
                <ImageUploader
                  id="diplomasCertificates"
                  multiple={true}
                  onImagesChange={handleImagesChange}
                />
              </div>
            </Col>
            <Col>
              <div className={styles.label}>
                <b>Doctor Picture:</b>
                <ImageUploader
                  id="profilePicture"
                  multiple={true}
                  onImagesChange={handleImagesChange}
                />
              </div>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <div className={styles.label}>
                <b>Digital Signature:</b>
                <ImageUploader
                  id="doctorSignature"
                  multiple={false}
                  onImagesChange={handleImagesChange}
                />
              </div>
            </Col>
            <Col>
              <div className={styles.label}>
                <b>Doctor Stamp:</b>
                <ImageUploader
                  id="doctorStamp"
                  multiple={false}
                  onImagesChange={handleImagesChange}
                />
              </div>
            </Col>
          </Row>
        </Row>

        <Row className="mt-4">
          <Col className="text-right">
            <label className={styles.label}>
              <b>Male</b>
              <input
                // className={styles.input}
                className="ml-1"
                type="radio"
                name="gender"
                value="male"
                onChange={handleChange}
              />
            </label>
          </Col>
          <Col className="text-left">
            <label className={styles.label}>
              <b>Female</b>
              <input
                // className={styles.input}
                className="ml-1"
                type="radio"
                name="gender"
                value="female"
                onChange={handleChange}
              />
            </label>
          </Col>
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
