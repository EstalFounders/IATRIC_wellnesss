// pages/homepage.js

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import { Button, Col, Row } from "react-bootstrap";
import MedicineForm from "../registerDocComponent/lib/MedicineForm";
import { FaPlus } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import DocPrescriptionGeneratePdf from "../registerDocComponent/lib/DoctorPrescriptionGenerator";
import { api, appointment_status, doctor_info_local_storage } from "../../constant";
import { doctorDisplayName } from "../../utils/doctorName";
import bcrypt from "bcryptjs";
import DoctorPasswordPopup from "../registerDocComponent/lib/DoctorPasswordPopup";
import { useSelector } from "react-redux";
import {
  ADVICES,
  CHIEF_COMPLAINTS_TXT,
  HISTORY_KNOWN_ALLERGY_TXT,
  KNOWN_CASES_TXT,
  LAST_HEALTH_TEXT_DONE_TXT,
  NOTES,
  UNDER_TREATMENT_TXT,
} from "./utils/constant";
import { IoIosClose } from "react-icons/io";
import { BiSolidPencil, BiPlus } from "react-icons/bi";
import {
  FaCheckCircle,
  FaNotesMedical,
  FaPills,
  FaRedoAlt,
  FaStethoscope,
  FaUserInjured,
  FaUserMd,
  FaVial,
} from "react-icons/fa";
import styles from "./css/Prescription.module.css";

// Common findings / advice a doctor repeats all day - one click appends them
// to the matching free-text field instead of typing the same words again.
const CHIEF_COMPLAINT_PRESETS = [
  "Fever",
  "Cough",
  "Cold",
  "Sore throat",
  "Headache",
  "Body ache",
  "Loose motions",
  "Acidity",
];

const ADVICE_PRESETS = [
  "Take plenty of fluids",
  "Take complete rest",
  "Avoid oily and spicy food",
  "Complete the antibiotic course",
  "Review after 5 days",
];

// ── Doctor identity for the standard prescription sheet ─────────────────────
// `lib/DoctorPrescriptionGenerator.js` is the single template used by every
// doctor profile, so it may only read fields that ANY doctor is guaranteed to
// have - including one added after today.
// `doctor.degree` was removed from the doctor model, so the degree line is
// built from the repeatable `educationTraining` list instead.
const joinDoctorQualifications = (educationTraining) =>
  (Array.isArray(educationTraining) ? educationTraining : [educationTraining])
    .map((entry) => (entry || "").trim())
    .filter(Boolean)
    .join(", ");

// `doctorSepecialization` used to be hard-coded to "" so every prescription
// printed the "Family Physician" fallback; use the doctor's specialities now.
const joinDoctorSpecialities = (serviceOffered) =>
  (Array.isArray(serviceOffered) ? serviceOffered : [serviceOffered])
    .map((entry) => (entry || "").trim())
    .filter(Boolean)
    .join(", ");

// Single source of truth for the form shape - used for the initial state and
// for "Clear form", so a reset can never drift from the original defaults.
const buildInitialFormDetails = (doctor) => ({
  doctorName: "",
  doctorDegree: joinDoctorQualifications(doctor.educationTraining),
  doctorSepecialization: joinDoctorSpecialities(doctor.serviceOffered),
  // The stamp (name / specialization / Reg. No) reads its own pair of fields:
  // `expertise` is the area the doctor is stamped with, while the sheet header
  // keeps the joined `serviceOffered` list above. They only differ on a profile
  // whose `expertise` and `serviceOffered` disagree.
  doctorExpertise: doctor.expertise || "",
  // Compulsory on the doctor profile: this drives the sheet header's `Reg no :`
  // line (hidden while blank) and the stamp's `Reg. No:` row (always printed -
  // the stamp shows "Reg. No: Not provided" until the number is entered).
  doctorRegNo: doctor.doctorRegistrationNo || "",
  doctorMobNo: doctor.mobileNumber,
  patientName: "",
  age: "",
  gender: "Male",
  patientNo: "",
  patientId: "",
  anyDrugAllergy: "No known allergy from medicine",
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
  doctorId: "",
});

// Builds a fresh, valid 24-hex Mongo ObjectId for manual (doctor-typed) entries.
// A random id never matches a real appointment, so the previously selected
// appointment is left untouched and the typed name/number are used instead.
const generateObjectId = () =>
  Math.floor(Date.now() / 1000)
    .toString(16)
    .padStart(8, "0") +
  Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join("");

const PrescriptionComp = () => {
  const [availableTests, setAvailableTests] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [medicineForms, setMedicineForms] = useState([]);
  const [showPasswordPopup, setPasswordPopup] = useState(false);
  const doctorInfo = JSON.parse(
    sessionStorage.getItem(doctor_info_local_storage),
  );
  const [doctors, setDoctors] = useState(doctorInfo.user);

  const appointments = useSelector((state) => state.appointment.appointments);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [selectedName, setSelectedName] = useState("");
  const [testAdviceSearchTerm, setTestAdviceSearchTerm] = useState("");
  const [testAdviceSuggestions, setTestAdviceSuggestions] = useState([]);
  const [showTestAdviceDropdown, setShowTestAdviceDropdown] = useState(false);
  const [allTestNames, setAllTestNames] = useState([]);
  const [testAdviceDropdownStyle, setTestAdviceDropdownStyle] = useState({});
  const testAdviceContainerRef = useRef(null);
  const editSnapshotRef = useRef(null);

  const [formError, setFormError] = useState("");
  // Bumped by "Clear form" so every MedicineForm remounts with empty inputs.
  const [formResetKey, setFormResetKey] = useState(0);

  const [updatedFormDetails, setUpdatedFormDetails] = useState(() =>
    buildInitialFormDetails(doctorInfo.user),
  );

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

  // The password is checked on the server against the stored bcrypt hash.
  const doctorPasswordValidation = async (password) => {
    let isPasswordCorrect = false;
    try {
      const response = await fetch("/api/registerDoc/verifyPassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorId: doctors._id, password }),
      });
      const data = await response.json();
      isPasswordCorrect = Boolean(data.valid);
    } catch (error) {
      console.error("Password check failed:", error);
    }

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
    setPasswordPopup(true);
    setUpdatedFormDetails((prev) => ({
      ...prev,
      medicineInfo: [...medicineForms],
      doctorId: doctors._id,
      doctorName: doctors.name,
      doctorStampUrl: doctors.doctorStampUrl,
      doctorSignatureUrl: doctors.doctorSignatureUrl,
      // Manual entry (doctor clicked edit / + and typed their own name & number):
      // use a fresh appointmentId so the previously selected appointment is not
      // touched and the typed name/number are used for the WhatsApp message.
      ...(isManualEntry ? { appointmentId: generateObjectId() } : {}),
    }));
  };

  // ── Layout / UX helpers ───────────────────────────────────────────────
  // Smooth-scrolls to a section card (used by the quick nav and by the
  // checklist when a required field is still missing).
  const scrollToSection = (sectionId) => {
    if (typeof document === "undefined") return;
    document
      .getElementById(sectionId)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Appends a preset phrase to a free-text field, skipping duplicates so the
  // same chip can be clicked twice without repeating the text.
  const appendPreset = (field, value) => {
    setUpdatedFormDetails((prev) => {
      const current = (prev[field] || "").trim();
      if (current.toLowerCase().includes(value.toLowerCase())) return prev;
      return { ...prev, [field]: current ? `${current}, ${value}` : value };
    });
  };

  const addMedicineForm = () => {
    setMedicineForms((prev) => [...prev, {}]);
    setTimeout(() => scrollToSection("medicines-section"), 0);
  };

  const medicineNamesCount = medicineForms.filter((form) =>
    Boolean(form?.medicineName?.trim()),
  ).length;

  // Live checklist rendered in the action bar. Only the patient name is a hard
  // requirement (the PDF, the WhatsApp message and the saved appointment all
  // key off it) - the rest is surfaced as a gentle reminder.
  const requiredItems = useMemo(
    () => [
      {
        key: "patient",
        label: "Patient name",
        done: Boolean((selectedName || searchTerm).trim()),
        section: "patient-section",
      },
      {
        key: "age",
        label: "Age",
        done: Boolean(String(updatedFormDetails.age || "").trim()),
        section: "patient-section",
      },
      {
        key: "complaints",
        label: "Chief complaints",
        done: Boolean(updatedFormDetails.cheifCompalaints?.trim()),
        section: "history-section",
      },
      {
        key: "medicines",
        label: "At least one medicine",
        done: medicineNamesCount > 0,
        section: "medicines-section",
      },
      {
        key: "tests",
        label: "At least one test advice",
        done: updatedFormDetails.testAdvices.length > 0,
        section: "tests-section",
      },
    ],
    [
      selectedName,
      searchTerm,
      updatedFormDetails.age,
      updatedFormDetails.cheifCompalaints,
      updatedFormDetails.testAdvices.length,
      medicineNamesCount,
    ],
  );

  const pendingItems = requiredItems.filter((item) => !item.done);

  // "Create prescription" is gated by the two things that would silently
  // produce a bad prescription: no patient on the form, or a bad mobile number.
  const handleCreatePrescription = () => {
    if (!(selectedName || searchTerm).trim()) {
      setFormError("Choose a patient from the list (or add a name) first.");
      scrollToSection("patient-section");
      return;
    }

    // `patientNo` can arrive as a Number (Mongo stores the mobile number as a
    // double) when a booked patient is selected from the list, so it must be
    // stringified before any string method - `.trim()` on a Number throws.
    const mobile = String(updatedFormDetails.patientNo ?? "").trim();
    if (mobile && !/^\d{10}$/.test(mobile)) {
      setFormError("Mobile number must be exactly 10 digits.");
      scrollToSection("patient-section");
      return;
    }

    setFormError("");
    handlePreview();
  };

  const handleResetForm = () => {
    if (
      typeof window !== "undefined" &&
      !window.confirm("Clear every field and start a new prescription?")
    ) {
      return;
    }
    setUpdatedFormDetails(buildInitialFormDetails(doctorInfo.user));
    setMedicineForms([]);
    setSearchTerm("");
    setSelectedName("");
    setSuggestions(appointments);
    setIsEditing(false);
    setIsManualEntry(false);
    setShowDropdown(false);
    setTestAdviceSearchTerm("");
    setFormError("");
    setFormResetKey((key) => key + 1);
    scrollToSection("patient-section");
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
    const value = event?.target?.value;
    if (value == null) return;
    console.log(value, "value in handle input change 149");
    setSearchTerm(value);
    // Show dropdown immediately when input changes
    setShowDropdown(true);

    const filteredAppointments = (appointments || []).filter(
      (appointment) =>
        appointment?.name &&
        appointment.name.toLowerCase().includes(value.toLowerCase()),
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
  };

  const handleSuggestionClick = (appointment) => {
    setSearchTerm(appointment.name);
    setSelectedName(appointment.name); // Store the selected name
    setShowDropdown(false);
    setIsEditing(false); // Go to view mode after selection
    setIsManualEntry(false); // Choosing from the list is not a manual entry
    handleOtherFormDetailsChange({
      patientName: appointment.name,
      patientId: appointment._id,
      // Mongo returns `patientMobNo` as a number, so it is cast to a string
      // here - downstream code calls `.trim()` / `.slice()` on this value.
      patientNo:
        appointment.patientMobNo != null
          ? String(appointment.patientMobNo)
          : "",
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

  // Enters edit mode and remembers the current patient so it can be restored.
  const startEdit = () => {
    editSnapshotRef.current = { ...updatedFormDetails };
    setIsManualEntry(true);
    setIsEditing(true);
  };

  // Leaves edit mode: discards any typing and restores the previous selection.
  const cancelEdit = () => {
    const snapshot = editSnapshotRef.current;
    if (snapshot) {
      handleOtherFormDetailsChange({
        patientName: snapshot.patientName,
        patientNo: snapshot.patientNo,
        patientId: snapshot.patientId,
        appointmentId: snapshot.appointmentId,
      });
      setSearchTerm(snapshot.patientName || "");
      setSelectedName(snapshot.patientName || "");
    }
    setShowDropdown(false);
    setIsManualEntry(false);
    setIsEditing(false);
  };

  useEffect(() => {
    // Initialize suggestions with all appointments on initial load
    setSuggestions(appointments);
  }, [appointments]);

  useEffect(() => {
    // Initialize suggestions with all appointments on initial load
    if (!isEditing) {
      // Extract the last 4 digits of the mobile number if it exists, otherwise use a fallback string
      // The mobile number lives on `patientNo` (it used to be read from the
      // non-existent `patientMobNo` form field, which always produced "0000").
      const lastDigits = updatedFormDetails.patientNo
        ? String(updatedFormDetails.patientNo).slice(-4)
        : "0000";

      // Fallback ID format: PatientName_1234 (sanitized to remove spaces)
      const fallbackId = `${(updatedFormDetails.patientName || "Patient").replace(/\s+/g, "")}_${lastDigits}`;

      handleOtherFormDetailsChange({
        patientId: updatedFormDetails.patientId || fallbackId,
      });
    }
  }, [isEditing]);

  const updateTestAdviceDropdownPosition = useCallback(() => {
    if (testAdviceContainerRef.current) {
      const rect = testAdviceContainerRef.current.getBoundingClientRect();
      setTestAdviceDropdownStyle({
        position: "fixed",
        top: `${rect.bottom + 2}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        zIndex: 10000,
        backgroundColor: "white",
        border: "1px solid #ccc",
        borderRadius: "5px",
        maxHeight: "200px",
        overflowY: "auto",
        boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
      });
    }
  }, []);

  const handleTestAdviceInputChange = (event) => {
    const value = event.target.value;
    setTestAdviceSearchTerm(value);
    setShowTestAdviceDropdown(true);
    setTimeout(updateTestAdviceDropdownPosition, 0);

    if (!value.trim()) {
      // Show all available tests when search is empty
      setTestAdviceSuggestions(allTestNames.slice(0, 50));
      return;
    }

    const searchLower = value.toLowerCase();
    const filteredAdvices = (allTestNames || []).filter(
      (name) =>
        name &&
        typeof name === "string" &&
        name.toLowerCase().includes(searchLower),
    );

    setTestAdviceSuggestions(filteredAdvices.slice(0, 50));
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

  const handleTestAdviceFocus = () => {
    if (testAdviceSearchTerm || allTestNames.length > 0) {
      setShowTestAdviceDropdown(true);
      if (!testAdviceSearchTerm.trim()) {
        setTestAdviceSuggestions(allTestNames.slice(0, 50));
      }
      setTimeout(updateTestAdviceDropdownPosition, 0);
    }
  };

  const handleInputKeyDown = (event) => {
    if (event.key === "Enter" && testAdviceSearchTerm) {
      const matchingTest = allTestNames.find(
        (name) => name.toLowerCase() === testAdviceSearchTerm.toLowerCase(),
      );
      if (matchingTest) {
        setUpdatedFormDetails((prevDetails) => ({
          ...prevDetails,
          testAdvices: [...prevDetails.testAdvices, matchingTest],
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
    // Increased timeout to allow suggestion click to register
    setTimeout(() => {
      setShowTestAdviceDropdown(false);
    }, 200);
  };

  const handleRemoveAdvice = (index) => {
    setUpdatedFormDetails((prevDetails) => ({
      ...prevDetails,
      testAdvices: prevDetails.testAdvices.filter((_, i) => i !== index),
    }));
  };

  const fetchAvailableTests = async () => {
    try {
      const response = await fetch(`${api.labTestDetails}?t=${Date.now()}`);
      const data = await response.json();
      console.log("Lab test data:", data);

      const extractedTests = [];

      if (Array.isArray(data)) {
        data.forEach((labTest) => {
          // If test_included exists (nested structure)
          if (labTest.test_included && Array.isArray(labTest.test_included)) {
            labTest.test_included.forEach((test) => {
              if (test.testName) {
                extractedTests.push(test.testName);
              }
            });
          }
          // If title exists directly (flat structure)
          if (labTest.title) {
            extractedTests.push(labTest.title);
          }
        });
      }

      console.log("Extracted test names:", extractedTests);
      setAvailableTests(extractedTests.map((name) => ({ testName: name })));
      setAllTestNames(extractedTests);
    } catch (error) {
      console.error("Error fetching available tests:", error);
    }
  };

  useEffect(() => {
    fetchAvailableTests();
  }, []);

  // Reposition dropdown on scroll/resize while visible, to keep it anchored to the input
  useEffect(() => {
    if (!showTestAdviceDropdown) return;
    const handleScrollOrResize = () => {
      updateTestAdviceDropdownPosition();
    };
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);
    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [showTestAdviceDropdown, updateTestAdviceDropdownPosition]);

  // Quick jump targets rendered above the form.
  const sectionLinks = [
    { id: "patient-section", label: "Patient", icon: FaUserInjured },
    { id: "history-section", label: "History", icon: FaNotesMedical },
    {
      id: "medicines-section",
      label: "Medicines",
      icon: FaPills,
      count: medicineForms.length,
    },
    {
      id: "diagnosis-section",
      label: "Diagnosis & advice",
      icon: FaStethoscope,
    },
    {
      id: "tests-section",
      label: "Test advices",
      icon: FaVial,
      count: updatedFormDetails.testAdvices.length,
    },
  ];

  const patientReady = Boolean((selectedName || searchTerm).trim());
  const mobileValue = String(updatedFormDetails.patientNo ?? "").trim();
  const mobileInvalid = Boolean(mobileValue) && !/^\d{10}$/.test(mobileValue);

  return (
    <div className={styles.page}>
      {/* ── Page header ── */}
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Doctor Prescription</h1>
          <p className={styles.pageSubtitle}>
            Pick the patient, record the findings, add medicines and advice, then
            create the signed prescription PDF.
          </p>
        </div>
        <div className={styles.doctorChip}>
          <FaUserMd className={styles.doctorChipIcon} />
          <div>
            <strong>{doctorDisplayName(doctorInfo?.user?.name) || "Doctor"}</strong>
            {joinDoctorQualifications(doctorInfo?.user?.educationTraining) && (
              <span>
                {joinDoctorQualifications(doctorInfo?.user?.educationTraining)}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* ── Section quick nav ── */}
      <nav className={styles.sectionNav} aria-label="Prescription sections">
        {sectionLinks.map((link) => {
          const Icon = link.icon;
          return (
            <button
              key={link.id}
              type="button"
              className={styles.navPill}
              onClick={() => scrollToSection(link.id)}
            >
              <Icon className={styles.navPillIcon} />
              {link.label}
              {typeof link.count === "number" && (
                <span className={styles.navPillCount}>{link.count}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className={styles.grid}>
        {/* ── 1. Patient ── */}
        <section
          id="patient-section"
          className={`${styles.card} ${styles.cardWide}`}
        >
          <div className={styles.cardHeader}>
            <span className={styles.cardIndex}>1</span>
            <div>
              <h2 className={styles.cardTitle}>
                <FaUserInjured /> Patient details
              </h2>
              <p className={styles.cardHint}>
                Search an appointment to auto-fill the name and mobile number, or
                add a walk-in patient manually.
              </p>
            </div>
            <span
              className={`${styles.cardBadge} ${
                patientReady ? styles.cardBadgeOk : ""
              }`}
            >
              {patientReady ? "Patient ready" : "No patient yet"}
            </span>
          </div>
          <div className={styles.cardBody}>
            <Row className={styles.formGrid}>
              <Col xs={12} lg={5}>
                <label className={styles.label} htmlFor="patientName">
                  Patient name<span className={styles.required}>*</span>
                </label>
                <div className={styles.autocomplete}>
                  {isEditing ? (
                    <div className={styles.nameRow}>
                      <input
                        id="patientName"
                        type="text"
                        name="patientName"
                        className={styles.input}
                        value={searchTerm}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        placeholder="Type or pick a name"
                        autoComplete="off"
                      />
                      <button
                        type="button"
                        className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                        title="Cancel editing"
                        onClick={cancelEdit}
                      >
                        <IoIosClose />
                      </button>
                    </div>
                  ) : (
                    <div
                      className={`${styles.displayField} ${
                        selectedName ? "" : styles.displayFieldEmpty
                      }`}
                      onClick={handleInputClick}
                    >
                      <span>{selectedName || "Select patient"}</span>
                      {selectedName ? (
                        <BiSolidPencil size={16} title="Edit patient" />
                      ) : (
                        <BiPlus
                          size={18}
                          title="Add a new patient"
                          onClick={(event) => {
                            event.stopPropagation();
                            startEdit();
                          }}
                        />
                      )}
                    </div>
                  )}
                  {showDropdown && (
                    <div className={styles.dropdown}>
                      {(suggestions || [])
                        .filter(
                          (appointment) =>
                            appointment.status !== appointment_status.completed,
                        )
                        .map((appointment) => (
                          <div
                            key={appointment.id || appointment.name}
                            className={styles.dropdownItem}
                            onClick={() => handleSuggestionClick(appointment)}
                          >
                            {appointment.name}
                            {appointment.patientMobNo && (
                              <span className={styles.dropdownMeta}>
                                {appointment.patientMobNo}
                              </span>
                            )}
                          </div>
                        ))}
                      {suggestions?.length === 0 && (
                        <div className={styles.dropdownEmpty}>
                          {searchTerm
                            ? "No matching patients"
                            : "No appointments available"}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <small className={styles.helper}>
                  {isEditing
                    ? "Type to filter appointments, or keep the typed name for a walk-in patient."
                    : "Click the field to list the available appointments."}
                </small>
              </Col>
              <Col xs={6} lg={2}>
                <label className={styles.label} htmlFor="age">
                  Age<span className={styles.required}>*</span>
                </label>
                <input
                  id="age"
                  type="text"
                  name="age"
                  inputMode="numeric"
                  className={styles.input}
                  placeholder="e.g. 32"
                  value={updatedFormDetails.age}
                  onChange={handleOtherFormDetailsChange}
                />
              </Col>
              <Col xs={6} lg={2}>
                <label className={styles.label} htmlFor="gender">
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  className={styles.select}
                  value={updatedFormDetails.gender}
                  onChange={handleOtherFormDetailsChange}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </Col>
              <Col xs={12} lg={3}>
                <label className={styles.label} htmlFor="patientNo">
                  Mobile number
                </label>
                <input
                  id="patientNo"
                  type="tel"
                  name="patientNo"
                  inputMode="numeric"
                  maxLength={10}
                  className={`${styles.input} ${
                    isEditing ? "" : styles.inputReadOnly
                  } ${mobileInvalid ? styles.fieldError : ""}`}
                  placeholder="10-digit mobile"
                  value={updatedFormDetails.patientNo || ""}
                  readOnly={!isEditing}
                  onChange={(event) =>
                    handleOtherFormDetailsChange({
                      patientNo: event.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10),
                    })
                  }
                />
                <small className={styles.helper}>
                  {isEditing
                    ? "Digits only - the prescription copy is sent to this number."
                    : "Auto-filled from the selected appointment."}
                </small>
              </Col>
            </Row>
          </div>
        </section>
        {/* ── 2. Medical history ── */}
        <section
          id="history-section"
          className={`${styles.card} ${styles.cardWide}`}
        >
          <div className={styles.cardHeader}>
            <span className={styles.cardIndex}>2</span>
            <div>
              <h2 className={styles.cardTitle}>
                <FaNotesMedical /> Medical history
              </h2>
              <p className={styles.cardHint}>
                Complaints print under HOPI, known case and allergies print in the
                right column of the prescription.
              </p>
            </div>
            <span
              className={`${styles.cardBadge} ${
                updatedFormDetails.cheifCompalaints?.trim()
                  ? styles.cardBadgeOk
                  : ""
              }`}
            >
              {updatedFormDetails.cheifCompalaints?.trim()
                ? "Complaints added"
                : "Complaints pending"}
            </span>
          </div>
          <div className={styles.cardBody}>
            <Row className={styles.formGrid}>
              <Col xs={12} lg={6}>
                <div className={styles.labelRow}>
                  <label className={styles.label} htmlFor="cheifCompalaints">
                    {CHIEF_COMPLAINTS_TXT}
                  </label>
                  <span className={styles.counter}>
                    {(updatedFormDetails.cheifCompalaints || "").length}/300
                  </span>
                </div>
                <textarea
                  id="cheifCompalaints"
                  name="cheifCompalaints"
                  rows={3}
                  maxLength={300}
                  className={styles.textarea}
                  placeholder="e.g. Fever since 2 days, dry cough"
                  value={updatedFormDetails.cheifCompalaints}
                  onChange={handleOtherFormDetailsChange}
                />
                <div className={styles.chipRow}>
                  {CHIEF_COMPLAINT_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      className={styles.chip}
                      onClick={() => appendPreset("cheifCompalaints", preset)}
                    >
                      <BiPlus size={12} />
                      {preset}
                    </button>
                  ))}
                </div>
                <div style={{ marginTop: "14px" }}>
                  <label className={styles.label} htmlFor="anyDrugAllergy">
                    {HISTORY_KNOWN_ALLERGY_TXT}
                  </label>
                  <select
                    id="anyDrugAllergy"
                    name="anyDrugAllergy"
                    className={styles.select}
                    value={updatedFormDetails.anyDrugAllergy}
                    onChange={handleOtherFormDetailsChange}
                  >
                    <option value="No known allergy from medicine">
                      No known allergy from medicine
                    </option>
                    <option value="Dust allergy">Dust allergy</option>
                    <option value="Food allergy">Food allergy</option>
                    <option value="Other allergies">Other allergies</option>
                  </select>
                </div>
              </Col>
              <Col xs={12} lg={6}>
                <label className={styles.label} htmlFor="knownCases">
                  {KNOWN_CASES_TXT}
                </label>
                <input
                  id="knownCases"
                  name="knownCases"
                  type="text"
                  className={styles.input}
                  placeholder="e.g. Diabetes, Hypertension, Thyroid"
                  value={updatedFormDetails.knownCases}
                  onChange={handleOtherFormDetailsChange}
                />
                <div style={{ marginTop: "14px" }}>
                  <label className={styles.label} htmlFor="underTreatmentSince">
                    {UNDER_TREATMENT_TXT}
                  </label>
                  <input
                    id="underTreatmentSince"
                    name="underTreatmentSince"
                    type="text"
                    className={styles.input}
                    placeholder="e.g. 3 months"
                    value={updatedFormDetails.underTreatmentSince}
                    onChange={handleOtherFormDetailsChange}
                  />
                </div>
                <div style={{ marginTop: "14px" }}>
                  <label className={styles.label} htmlFor="lastHealthTest">
                    {LAST_HEALTH_TEXT_DONE_TXT}
                  </label>
                  <select
                    id="lastHealthTest"
                    name="lastHealthTest"
                    className={styles.select}
                    value={updatedFormDetails.lastHealthTest}
                    onChange={handleOtherFormDetailsChange}
                  >
                    <option value="Within 6 months">Within 6 months</option>
                    <option value="Over 6 months ago">
                      Over 6 months ago
                    </option>
                  </select>
                </div>
              </Col>
            </Row>
          </div>
        </section>
        {/* ── 3. Medicines ── */}
        <section
          id="medicines-section"
          className={`${styles.card} ${styles.cardWide}`}
        >
          <div className={styles.cardHeader}>
            <span className={styles.cardIndex}>3</span>
            <div>
              <h2 className={styles.cardTitle}>
                <FaPills /> Medicines
              </h2>
              <p className={styles.cardHint}>
                One card per medicine. Unit, dosage, days and timing print in the
                Rx table.
              </p>
            </div>
            <button
              type="button"
              className={styles.addBtn}
              style={{ marginLeft: "auto" }}
              onClick={addMedicineForm}
            >
              <FaPlus /> Add medicine
            </button>
          </div>
          <div className={styles.cardBody}>
            {medicineForms.length === 0 ? (
              <div className={styles.emptyState}>
                <FaPills className={styles.emptyStateIcon} />
                No medicines added yet. Use &ldquo;Add medicine&rdquo; to start the
                Rx list.
              </div>
            ) : (
              <div className={styles.medicineList}>
                {medicineForms.map((form, index) => (
                  <div
                    className={styles.medicineCard}
                    key={`medicine-${formResetKey}-${index}`}
                  >
                    <div className={styles.medicineHeader}>
                      <span className={styles.cardIndex}>{index + 1}</span>
                      <h3 className={styles.medicineTitle}>
                        {form?.medicineName?.trim() ||
                          `Medicine ${index + 1} (untitled)`}
                      </h3>
                      <button
                        type="button"
                        className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                        title="Remove this medicine"
                        onClick={() => handleDeleteMedicineForm(index)}
                      >
                        <MdDelete />
                      </button>
                    </div>
                    <MedicineForm
                      onChange={(formValues) =>
                        handleMedicineFormChange(formValues, index)
                      }
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
        {/* ── 4. Diagnosis & advice ── */}
        <section id="diagnosis-section" className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardIndex}>4</span>
            <div>
              <h2 className={styles.cardTitle}>
                <FaStethoscope /> Diagnosis &amp; advice
              </h2>
              <p className={styles.cardHint}>
                One advice per line - every line prints as a separate point.
              </p>
            </div>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.labelRow}>
              <label className={styles.label} htmlFor="advices">
                {ADVICES}
              </label>
              <span className={styles.counter}>
                {(updatedFormDetails.advices || "").length}/500
              </span>
            </div>
            <textarea
              id="advices"
              name="advices"
              rows={4}
              maxLength={500}
              className={styles.textarea}
              placeholder={"Take complete rest\nPlenty of fluids\nReview after 5 days"}
              value={updatedFormDetails.advices}
              onChange={handleOtherFormDetailsChange}
            />
            <div className={styles.chipRow}>
              {ADVICE_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  className={styles.chip}
                  onClick={() => appendPreset("advices", preset)}
                >
                  <BiPlus size={12} />
                  {preset}
                </button>
              ))}
            </div>
            <div style={{ marginTop: "14px" }}>
              <div className={styles.labelRow}>
                <label className={styles.label} htmlFor="notes">
                  {NOTES}
                </label>
                <span className={styles.counter}>
                  {(updatedFormDetails.notes || "").length}/200
                </span>
              </div>
              <textarea
                id="notes"
                name="notes"
                rows={2}
                maxLength={200}
                className={styles.textarea}
                placeholder="Anything else to remember (optional)"
                value={updatedFormDetails.notes}
                onChange={handleOtherFormDetailsChange}
              />
            </div>
          </div>
        </section>
        {/* ── 5. Test advices ── */}
        <section id="tests-section" className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardIndex}>5</span>
            <div>
              <h2 className={styles.cardTitle}>
                <FaVial /> Test advices
              </h2>
              <p className={styles.cardHint}>
                Search the lab test list, press Enter or pick from the list.
              </p>
            </div>
            <span
              className={`${styles.cardBadge} ${
                updatedFormDetails.testAdvices.length
                  ? styles.cardBadgeOk
                  : ""
              }`}
            >
              {updatedFormDetails.testAdvices.length} added
            </span>
          </div>
          <div className={styles.cardBody}>
            <label className={styles.label} htmlFor="testAdvicesInput">
              Test / investigation
            </label>
            <div ref={testAdviceContainerRef} className={styles.autocomplete}>
              <input
                id="testAdvicesInput"
                name="testAdvicesInput"
                type="text"
                className={styles.input}
                placeholder="e.g. CBC, HbA1c, X-ray chest"
                value={testAdviceSearchTerm}
                onChange={handleTestAdviceInputChange}
                onKeyDown={handleInputKeyDown}
                onBlur={handleTestAdviceBlur}
                onFocus={handleTestAdviceFocus}
                autoComplete="off"
              />
              {showTestAdviceDropdown && testAdviceSuggestions.length > 0 && (
                <div style={testAdviceDropdownStyle}>
                  {testAdviceSuggestions.map((advice) => (
                    <div
                      key={advice}
                      className={styles.dropdownItem}
                      onClick={() => handleTestAdviceSuggestionClick(advice)}
                    >
                      {advice}
                    </div>
                  ))}
                </div>
              )}
              {showTestAdviceDropdown &&
                testAdviceSearchTerm &&
                testAdviceSuggestions.length === 0 && (
                  <div
                    style={{ ...testAdviceDropdownStyle, maxHeight: "auto" }}
                  >
                    <div
                      className={styles.dropdownEmpty}
                      style={{ display: "flex", alignItems: "center", gap: "10px" }}
                    >
                      <span style={{ flex: 1 }}>No matching tests</span>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setUpdatedFormDetails((prevDetails) => ({
                            ...prevDetails,
                            testAdvices: [
                              ...prevDetails.testAdvices,
                              testAdviceSearchTerm,
                            ],
                          }));
                          setTestAdviceSearchTerm("");
                          setShowTestAdviceDropdown(false);
                        }}
                      >
                        Add anyway
                      </Button>
                    </div>
                  </div>
                )}
            </div>
            {updatedFormDetails.testAdvices.length === 0 ? (
              <small className={styles.helper}>
                No tests advised yet - leave empty if none are needed.
              </small>
            ) : (
              <div className={styles.tagList}>
                {updatedFormDetails.testAdvices.map((advice, index) => (
                  <span className={styles.tag} key={`${advice}-${index}`}>
                    {advice}
                    <button
                      type="button"
                      className={styles.tagRemove}
                      title={`Remove ${advice}`}
                      onClick={() => handleRemoveAdvice(index)}
                    >
                      <IoIosClose />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
      {/* ── Sticky action bar ── */}
      <div className={styles.actionBar}>
        <div className={styles.checklist}>
          <span className={styles.checklistTitle}>
            {pendingItems.length === 0
              ? "All set - ready to create the prescription"
              : `${pendingItems.length} item${
                  pendingItems.length > 1 ? "s" : ""
                } still missing`}
          </span>
          <div className={styles.checklistItems}>
            {requiredItems.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`${styles.checkBtn} ${
                  item.done ? styles.checkItemDone : styles.checkItem
                }`}
                onClick={() => scrollToSection(item.section)}
              >
                {item.done ? "✓" : "○"} {item.label}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.actionButtons}>
          <button
            type="button"
            className={styles.ghostBtn}
            onClick={handleResetForm}
          >
            <FaRedoAlt /> Clear form
          </button>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={handleCreatePrescription}
          >
            <FaCheckCircle /> Create prescription
          </button>
        </div>
        {formError && <div className={styles.formError}>{formError}</div>}
      </div>

      {showPasswordPopup && (
        <DoctorPasswordPopup
          onClose={() => setPasswordPopup(false)}
          onSubmit={doctorPasswordValidation}
        />
      )}

      {/* ── Preview modal ── */}
      {previewVisible && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button
              type="button"
              className={styles.modalClose}
              onClick={togglePreview}
              aria-label="Close preview"
            >
              &times;
            </button>
            <h2 className={styles.modalTitle}>Prescription preview</h2>
            <DocPrescriptionGeneratePdf data={updatedFormDetails} />
          </div>
        </div>
      )}
    </div>
  );
};

export default PrescriptionComp;
