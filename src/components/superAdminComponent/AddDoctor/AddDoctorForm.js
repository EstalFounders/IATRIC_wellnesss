// AddDoctorForm.js
import React, { useEffect, useState } from "react";
import styles from "./AddDoctorForm.module.css";
import { Col, Row } from "react-bootstrap";
import { FaPencilAlt } from "react-icons/fa";
import {
  FaCalendarCheck,
  FaClipboardList,
  FaFileUpload,
  FaLock,
  FaStethoscope,
  FaUserCircle,
  FaUserMd,
} from "react-icons/fa";
import ImageUploader from "../../../lib/ImageUploader.js";
import Preloader from "../../Preloader.js";
import {
  api,
  DoctorType,
  superAdminConsultationtype,
} from "../../../constant.js";
import WorkDaysPicker from "../../Common/WorkDaysPicker.js";
import EducationTrainingInput from "../../Common/EducationTrainingInput.js";
import WorkExperienceInput from "../../Common/WorkExperienceInput.js";
import LanguageInput from "../../Common/LanguageInput.js";
import IndiaLocationPicker from "../../Common/IndiaLocationPicker.js";
import { appendEducationTraining } from "../../../customUtils/educationTraining.js";
import {
  appendWorkExperience,
  parseWorkExperience,
} from "../../../customUtils/workExperience.js";
import {
  appendLanguages,
  parseLanguages,
} from "../../../customUtils/languages.js";
import CustomDialog from "../../CustomPopup.js";
import { convertTimeIntoDate, isMobileValid } from "../../../helper.js";
import { useDispatch, useSelector } from "react-redux";
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
  ["workDays", "Work Days"],
  ["overview", "Overview"],
  ["doctorRegistrationNo", "Registration No"],
];

// Blank form state, also used by the Reset button so a second registration
// starts from a clean slate. `location` starts empty so the India location
// picker shows its "Select state" placeholders.
const EMPTY_DOCTOR = {
  name: "",
  email: "",
  expertise: "",
  doctorRegistrationNo: "",
  gender: "",
  workDays: "",
  overview: "",
  location: { state: "", city: "" },
  workExperience: "",
  consultationType: "",
  serviceOffered: "",
  password: "",
  doctorType: DoctorType.individual,
  doctorShare: "70",
  slotStartTime: "",
  slotEndTime: "",
  mobileNumber: "",
};

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
  // Draft rows for the repeatable work-experience inputs; blank rows are
  // filtered out on submit by `appendWorkExperience`. At least one entry is
  // required, so `handleSubmit` raises an inline error (like `language`).
  const [workExperienceItems, setWorkExperienceItems] = useState([""]);
  const [workExperienceError, setWorkExperienceError] = useState("");
  // Draft rows for the repeatable language inputs; blank rows are filtered out on
  // submit by `appendLanguages`. The field is mandatory, so `handleSubmit` raises
  // an inline error (the same pattern as the work-day chips).
  const [languageItems, setLanguageItems] = useState([""]);
  const [languageError, setLanguageError] = useState("");
  const dispatch = useDispatch();

  const [doctorDetails, setDoctorDetails] = useState(EMPTY_DOCTOR);
  // Doctor share defaults to 70% and stays locked until the admin clicks the pencil.
  const [isShareEditable, setIsShareEditable] = useState(false);
  // Bumped by the Reset button so the <ImageUploader />s remount (their preview
  // state lives inside that component).
  const [uploaderKey, setUploaderKey] = useState(0);

  const storedService = useSelector(
    (state) => state.superAdminHomePage.serviceOffered,
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
    const value = String(e.target.value || "").trim();
    if (!value) return;

    if (!selectedTypes.some((item) => item.name === value)) {
      setSelectedTypes((prevTypes) => {
        const updatedTypes = [...prevTypes, { name: value, price: null }];

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
    const updatedTypes = selectedTypes.filter((item) => item.name !== type);
    setSelectedTypes(updatedTypes);
    // Keep doctorDetails in sync, otherwise the removed tag is still submitted.
    setDoctorDetails((prevDetails) => ({
      ...prevDetails,
      consultationType: updatedTypes,
    }));
  };

  const handleServicePriceChange = (type, rawValue) => {
    const numeric = rawValue === "" ? null : Number(rawValue);
    const price =
      numeric === null || !Number.isFinite(numeric) || numeric < 0
        ? null
        : numeric;
    const updatedTypes = selectedTypes.map((item) =>
      item.name === type ? { ...item, price } : item
    );
    setSelectedTypes(updatedTypes);
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

  const handleLocationChange = (location) => {
    setDoctorDetails((prevDetails) => ({ ...prevDetails, location }));
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

  // Work experience - draft rows in, array out; at least one entry is required,
  // so the inline error is cleared as soon as one non-blank row exists.
  const handleWorkExperienceChange = (items) => {
    setWorkExperienceItems(items);
    if (parseWorkExperience(items).length > 0) setWorkExperienceError("");
  };

  const handleShowDialog = (msg) => {
    setMessage(msg);
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setMessage("");
  };

  // Clears the whole form. `uploaderKey` is bumped so the <ImageUploader />s
  // remount, which empties their internal preview state.
  const handleReset = () => {
    setDoctorDetails(EMPTY_DOCTOR);
    setIsShareEditable(false);
    setSelectedTypes([]);
    setSelectedService([]);
    setSelectedWorkDays([]);
    setEducationItems([""]);
    setWorkExperienceItems([""]);
    setLanguageItems([""]);
    setprofilePicture("");
    setDoctorStamp("");
    setDoctorSignature("");
    setDiplomasCertificates([]);
    setCPassword();
    setSlotStartTime("09:00");
    setSlotEndTime("21:00");
    setWorkDaysError("");
    setLanguageError("");
    setWorkExperienceError("");
    setUploaderKey((key) => key + 1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
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

    // Work experience is repeatable too, so it lives in its own draft-row state
    // and is validated here instead of `MANDATORY_TEXT_FIELDS`.
    const hasWorkExperience =
      parseWorkExperience(workExperienceItems).length > 0;
    setWorkExperienceError(
      hasWorkExperience ? "" : "Please add at least one work experience"
    );
    if (!hasWorkExperience) {
      missingFields.push("Work Experience");
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
    // Compulsory field - it is listed in `MANDATORY_TEXT_FIELDS` and rejected by
    // the Add Doctor POST while it is blank.
    formData.append("doctorRegistrationNo", doctorDetails.doctorRegistrationNo);
    // One field per entry; a blank field clears the list on the API side.
    appendLanguages(formData, languageItems);
    formData.append("workDays", doctorDetails.workDays);
    formData.append("overview", doctorDetails.overview);
    // One field per entry; a blank field clears the list on the API side.
    appendEducationTraining(formData, educationItems);
    appendWorkExperience(formData, workExperienceItems);
    formData.append("consultationType", JSON.stringify(selectedTypes));
    formData.append("serviceOffered", selectedService.join(","));
    formData.append("password", doctorDetails.password);
    formData.append("digitalSignature", doctorSignature);
    const location = doctorDetails.location || {};
    formData.append("locationState", location.state || "");
    formData.append("locationCity", location.city || "");
    formData.append("profilePicture", profilePicture);
    formData.append("doctorType", doctorDetails.doctorType);
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
    <div className={styles.page}>
      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">
          <FaUserMd />
        </span>
        <div>
          <h1 className={styles.heroTitle}>Add a new doctor</h1>
          <p className={styles.heroSubtitle}>
            Register a doctor on the platform. Fields marked{" "}
            <span className={styles.req}>*</span> are mandatory.
          </p>
        </div>
      </header>

      <form onSubmit={handleSubmit} noValidate>
        <div className={styles.layout}>
          <div className={styles.main}>
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>
                <FaUserCircle /> Personal details
              </h2>
              <Row>
                <Col md={6}>
                  <label className={styles.field}>
                    <span className={styles.label}>
                      Name <span className={styles.req}>*</span>
                    </span>
                    <input
                      className={styles.input}
                      type="text"
                      name="name"
                      value={doctorDetails.name}
                      onChange={handleChange}
                      required
                    />
                  </label>
                </Col>
                <Col md={6}>
                  <label className={styles.field}>
                    <span className={styles.label}>
                      Email <span className={styles.req}>*</span>
                    </span>
                    <input
                      className={styles.input}
                      type="email"
                      name="email"
                      value={doctorDetails.email}
                      onChange={handleChange}
                      required
                    />
                  </label>
                </Col>
                <Col md={6}>
                  <label className={styles.field}>
                    <span className={styles.label}>
                      Mobile Number <span className={styles.req}>*</span>
                    </span>
                    <input
                      className={styles.input}
                      type="tel"
                      inputMode="numeric"
                      name="mobileNumber"
                      value={doctorDetails.mobileNumber}
                      onChange={handleChange}
                      required
                    />
                  </label>
                </Col>
                <Col md={6}>
                  <div className={styles.field}>
                    <IndiaLocationPicker
                      key={uploaderKey}
                      value={doctorDetails.location}
                      onChange={handleLocationChange}
                      selectClassName={styles.select}
                    />
                  </div>
                </Col>
                <Col md={12}>
                  <div className={styles.field}>
                    <span className={styles.label}>Gender</span>
                    <div className={styles.radioRow}>
                      <label className={styles.radioOption}>
                        <input
                          type="radio"
                          name="gender"
                          value="male"
                          checked={doctorDetails.gender === "male"}
                          onChange={handleChange}
                        />
                        Male
                      </label>
                      <label className={styles.radioOption}>
                        <input
                          type="radio"
                          name="gender"
                          value="female"
                          checked={doctorDetails.gender === "female"}
                          onChange={handleChange}
                        />
                        Female
                      </label>
                    </div>
                  </div>
                </Col>
              </Row>
            </section>

            <section className={styles.card}>
              <h2 className={styles.cardTitle}>
                <FaStethoscope /> Professional details
              </h2>
              <Row>
                <Col md={6}>
                  <label className={styles.field}>
                    <span className={styles.label}>
                      Area of Expertise <span className={styles.req}>*</span>
                    </span>
                    <input
                      className={styles.input}
                      type="text"
                      name="expertise"
                      value={doctorDetails.expertise}
                      onChange={handleChange}
                      required
                    />
                  </label>
                </Col>
                <Col md={6}>
                  <label className={styles.field}>
                    <span className={styles.label}>
                      Registration No <span className={styles.req}>*</span>
                    </span>
                    <input
                      className={styles.input}
                      type="text"
                      name="doctorRegistrationNo"
                      value={doctorDetails.doctorRegistrationNo}
                      onChange={handleChange}
                      required
                    />
                    <span className={styles.hint}>
                      Printed on the prescription stamp as &quot;Reg. No:&quot;.
                    </span>
                  </label>
                </Col>
                <Col md={12}>
                  <div className={styles.field}>
                    <span className={styles.label}>
                      Work Experience <span className={styles.req}>*</span>
                    </span>
                    <WorkExperienceInput
                      value={workExperienceItems}
                      onChange={handleWorkExperienceChange}
                      error={workExperienceError}
                    />
                  </div>
                </Col>
                <Col md={12}>
                  <label className={styles.field}>
                    <span className={styles.label}>
                      Overview <span className={styles.req}>*</span>
                    </span>
                    <textarea
                      className={styles.textarea}
                      name="overview"
                      value={doctorDetails.overview}
                      onChange={handleChange}
                      required
                    />
                  </label>
                </Col>
                <Col md={12}>
                  <div className={styles.field}>
                    <span className={styles.label}>Education + Training</span>
                    <EducationTrainingInput
                      value={educationItems}
                      onChange={setEducationItems}
                    />
                  </div>
                </Col>
                <Col md={12}>
                  <div className={styles.field}>
                    <span className={styles.label}>
                      Language <span className={styles.req}>*</span>
                    </span>
                    <LanguageInput
                      value={languageItems}
                      onChange={handleLanguagesChange}
                      error={languageError}
                    />
                  </div>
                </Col>
              </Row>
            </section>

            <section className={styles.card}>
              <h2 className={styles.cardTitle}>
                <FaClipboardList /> Consultation &amp; services
              </h2>
              <Row>
                <Col md={6}>
                  <div className={styles.field}>
                    <span className={styles.label}>
                      Consultation Type <span className={styles.req}>*</span>
                    </span>
                    <select
                      id="consultationType"
                      className={styles.select}
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
                    <div className={styles.tagsContainer}>
                      {selectedTypes.map((type) => (
                        <div key={type.name} className={styles.tag}>
                          {type.name}
                          <button
                            type="button"
                            className={styles.removeButton}
                            aria-label={`Remove ${type.name}`}
                            onClick={() => handleRemoveType(type.name)}
                          >
                            ✖
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className={styles.field}>
                    <span className={styles.label}>
                      Services Offered <span className={styles.req}>*</span>
                    </span>
                    <select
                      id="ServicesOffered"
                      className={styles.select}
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
                    <div className={styles.tagsContainer}>
                      {selectedService.map((type) => (
                        <div key={type} className={styles.tag}>
                          {type}
                          <button
                            type="button"
                            className={styles.removeButton}
                            aria-label={`Remove ${type}`}
                            onClick={() => handleRemoveService(type)}
                          >
                            ✖
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className={styles.field}>
                    <span className={styles.label}>Doctor Share (%)</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <input
                        type="number"
                        name="doctorShare"
                        value={doctorDetails.doctorShare}
                        onChange={handleChange}
                        className={styles.input}
                        min="0"
                        max="100"
                        readOnly={!isShareEditable}
                        style={{ background: isShareEditable ? "#fff" : "#f3f5f7" }}
                      />
                      <button
                        type="button"
                        onClick={() => setIsShareEditable((prev) => !prev)}
                        title={isShareEditable ? "Lock doctor share" : "Edit doctor share"}
                        aria-label={isShareEditable ? "Lock doctor share" : "Edit doctor share"}
                        style={{ border: "none", background: "transparent", cursor: "pointer", color: "#3b5f1d", padding: 6 }}
                      >
                        <FaPencilAlt />
                      </button>
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <label className={styles.field}>
                    <span className={styles.label}>Doctor Type</span>
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

              {selectedTypes.length > 0 && (
                <Row>
                  <Col md={12}>
                    <div className={styles.field}>
                      <span className={styles.label}>
                        Price per consultation type (₹)
                      </span>
                      {selectedTypes.map((type) => (
                        <div
                          key={type.name}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 6,
                          }}
                        >
                          <span style={{ flex: "1 1 0", fontSize: "0.9rem" }}>
                            {type.name}
                          </span>
                          <input
                            type="number"
                            min="0"
                            value={type.price ?? ""}
                            onChange={(e) =>
                              handleServicePriceChange(type.name, e.target.value)
                            }
                            placeholder="e.g. 500"
                            className={styles.input}
                            style={{ width: 140 }}
                          />
                        </div>
                      ))}
                    </div>
                  </Col>
                </Row>
              )}
            </section>

            <section className={styles.card}>
              <h2 className={styles.cardTitle}>
                <FaCalendarCheck /> Availability
              </h2>
              <Row>
                <Col md={12}>
                  <div className={styles.field}>
                    <span className={styles.label}>
                      Work Days <span className={styles.req}>*</span>
                    </span>
                    <WorkDaysPicker
                      value={selectedWorkDays}
                      onChange={handleWorkDaysChange}
                      error={workDaysError}
                    />
                  </div>
                </Col>
                <Col md={6}>
                  <label className={styles.field}>
                    <span className={styles.label}>Start time</span>
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
                <Col md={6}>
                  <label className={styles.field}>
                    <span className={styles.label}>End time</span>
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
            </section>

            <section className={styles.card}>
              <h2 className={styles.cardTitle}>
                <FaLock /> Account &amp; access
              </h2>
              <p className={styles.hint}>
                Optional. If set, the two password fields must match.
              </p>
              <Row>
                <Col md={6}>
                  <label className={styles.field}>
                    <span className={styles.label}>Password</span>
                    <input
                      className={styles.input}
                      type="password"
                      name="password"
                      value={doctorDetails.password || ""}
                      onChange={handleChange}
                    />
                  </label>
                </Col>
                <Col md={6}>
                  <label className={styles.field}>
                    <span className={styles.label}>Confirm Password</span>
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
            </section>

            <section className={styles.card}>
              <h2 className={styles.cardTitle}>
                <FaFileUpload /> Documents &amp; media
              </h2>
              <p className={styles.hint}>
                Optional, but certificates, the picture, the signature and the
                stamp improve the prescription and the doctor profile.
              </p>
              <Row key={uploaderKey}>
                <Col md={6}>
                  <div className={styles.field}>
                    <span className={styles.label}>
                      Diplomas and Certificates
                    </span>
                    <ImageUploader
                      id="diplomasCertificates"
                      multiple={true}
                      onImagesChange={handleImagesChange}
                    />
                  </div>
                </Col>
                <Col md={6}>
                  <div className={styles.field}>
                    <span className={styles.label}>Doctor Picture</span>
                    <ImageUploader
                      id="profilePicture"
                      multiple={true}
                      onImagesChange={handleImagesChange}
                    />
                  </div>
                </Col>
                <Col md={6}>
                  <div className={styles.field}>
                    <span className={styles.label}>Digital Signature</span>
                    <ImageUploader
                      id="doctorSignature"
                      multiple={false}
                      onImagesChange={handleImagesChange}
                    />
                  </div>
                </Col>
                <Col md={6}>
                  <div className={styles.field}>
                    <span className={styles.label}>Doctor Stamp</span>
                    <ImageUploader
                      id="doctorStamp"
                      multiple={false}
                      onImagesChange={handleImagesChange}
                    />
                  </div>
                </Col>
              </Row>
            </section>
          </div>

          <aside className={styles.rail}>
            <div className={styles.railCard}>
              <section className={styles.card}>
                <h2 className={styles.cardTitle}>
                  <FaClipboardList /> Before you submit
                </h2>
                <ul className={styles.tipList}>
                  <li>Name, email and mobile number are required.</li>
                  <li>
                    Expertise, registration number and work experience are
                    required.
                  </li>
                  <li>Overview and at least one language are required.</li>
                  <li>
                    Select the consultation type(s) and the services offered.
                  </li>
                  <li>Pick at least one work day.</li>
                  <li>
                    Passwords are optional; if set, both fields must match.
                  </li>
                </ul>
              </section>

              <section className={styles.card}>
                <h2 className={styles.cardTitle}>
                  <FaUserMd /> Tips
                </h2>
                <ul className={styles.tipList}>
                  <li>Blank education and language rows are ignored.</li>
                  <li>
                    Documents can be re-uploaded later from the doctor profile.
                  </li>
                </ul>
              </section>
            </div>
          </aside>
        </div>

        <div className={styles.actionBar}>
          <span className={styles.actionNote}>
            <span className={styles.req}>*</span> Mandatory fields must be
            filled before the doctor can be registered.
          </span>
          <button
            type="button"
            className={styles.ghostBtn}
            onClick={handleReset}
          >
            Reset
          </button>
          <button className={styles.primaryBtn} type="submit">
            Add Doctor
          </button>
        </div>

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
