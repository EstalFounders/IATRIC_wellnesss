// AddDoctorForm.js
//
// The Super Admin "Add doctor" page as a SIX-STEP WIZARD. The form does the same
// thing as before - same fields, same payload, same POST - but it is no longer a
// 1,000-line wall: each step lives in `steps/`, the shared inputs in
// `components/` and the per-step rules in `lib/addDoctorSteps.js`.
//
// Steps
//   1 Profile & contact     2 Qualifications & speciality   3 Timings & services
//   4 Banking & statutory   5 Documents & pictures         6 Preview & submit
//
// Only steps 1-3 are gated; 4 and 5 can be skipped ("Skip for now") because a
// payout account and a photo can be added later from the edit form. Step 4 is
// still format-checked when anything is typed into it - here, and again in
// pages/api/addDoctor.js (400 with a friendly message).
//
// The submitted FormData is byte-identical to the old single-page form for every
// pre-existing field; the only additions are the optional bank/PAN parts, sent
// when non-empty.

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { FaCheckCircle, FaUserMd } from "react-icons/fa";
import styles from "./AddDoctorForm.module.css";
import Preloader from "../../Preloader.js";
import { api, DoctorType } from "../../../constant.js";
import { validateWeeklyAvailability } from "../../../customUtils/weeklyAvailability.js";
import {
  appendEducationTraining,
  parseEducationTraining,
} from "../../../customUtils/educationTraining.js";
import {
  appendWorkExperience,
  parseWorkExperience,
} from "../../../customUtils/workExperience.js";
import {
  appendLanguages,
  parseLanguages,
} from "../../../customUtils/languages.js";
import {
  BANK_TEXT_FIELDS,
  normaliseAccountNumber,
  normaliseIfsc,
  normalisePan,
} from "../../../customUtils/bankDetails.js";
import CustomDialog from "../../CustomPopup.js";
import { useDispatch, useSelector } from "react-redux";
import { setServiceOffered } from "../../../store/slices/superAdmin/homepageSlice.js";
import { fetchAllDoctors } from "../../../store/slices/bookingWebsite/allDoctorsPageSlice.js";
import { formatDoctorNameForAdd } from "../../../utils/doctorName.js";
import { useGlobalData } from "../../../customUtils/useGlobalData.js";
import {
  SERVICES_OFFERED_ENABLED,
  WIZARD_STEPS,
  isStepComplete,
  validateStep,
} from "./lib/addDoctorSteps.js";
import WizardStepper from "./components/WizardStepper.js";
import StepActions from "./components/StepActions.js";
import CompletenessChecklist from "./components/CompletenessChecklist.js";
import Step1Profile from "./steps/Step1Profile.js";
import Step2Qualifications from "./steps/Step2Qualifications.js";
import Step3Schedule from "./steps/Step3Schedule.js";
import Step4Banking from "./steps/Step4Banking.js";
import Step5Documents from "./steps/Step5Documents.js";
import Step6Preview from "./steps/Step6Preview.js";

const STEP_COMPONENTS = [
  Step1Profile,
  Step2Qualifications,
  Step3Schedule,
  Step4Banking,
  Step5Documents,
  Step6Preview,
];

// Draft of an unfinished registration, so a reload / a closed tab on step 5 does
// not lose the details. Uploads are never stored (a File cannot be serialised).
const DRAFT_KEY = "superadmin:addDoctor:draft";

// Typing normalisers: the admin should never have to care about capitals or
// spaces in a PAN / IFSC, and an account number is digits only.
const FIELD_NORMALISERS = {
  panNumber: normalisePan,
  bankIfscCode: normaliseIfsc,
  bankAccountNumber: normaliseAccountNumber,
  bankAccountNumberConfirm: normaliseAccountNumber,
};

// Blank form state, also used by Reset / "Add another doctor" so the second
// registration starts from a clean slate. `location` starts empty so the India
// location picker shows its "Select state" placeholders.
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
  totalyearofexperience: "",
  consultationType: "",
  serviceOffered: "",
  doctorType: DoctorType.individual,
  doctorShare: "70",
  slotStartTime: "",
  slotEndTime: "",
  mobileNumber: "",
  // Step 4 - optional statutory / payout details.
  panNumber: "",
  bankAccountHolderName: "",
  bankAccountNumber: "",
  bankAccountNumberConfirm: "",
  bankIfscCode: "",
  bankName: "",
  bankBranch: "",
};

// The two fields the API and the Doctor schema enforce as unique. Each one is
// checked against `GET /api/addDoctor?checkUnique=1` when it loses focus, so the
// admin sees the clash before submitting; the POST/PUT 409 repeats it.
const UNIQUE_TEXT_FIELDS = ["email", "mobileNumber"];

// The two optional clinic fields every consultation type can carry (step 3).
const TYPE_CLINIC_FIELDS = ["clinicName", "clinicLocation"];

// Human labels for the dialog that summarises what is still missing on submit.
const FIELD_LABELS = {
  name: "Name",
  email: "Email",
  mobileNumber: "Mobile number",
  expertise: "Speciality",
  workExperience: "Work experience",
  overview: "Overview",
  language: "Language",
  workDays: "Work days",
  consultationType: "Consultation type",
  serviceOffered: "Services offered",
  panNumber: "PAN number",
  bankAccountHolderName: "Account holder name",
  bankAccountNumber: "Account number",
  bankAccountNumberConfirm: "Confirm account number",
  bankIfscCode: "IFSC code",
  doctorShare: "Doctor share",
};

const describeProblems = (problems) =>
  Object.keys(problems)
    .map((field) => FIELD_LABELS[field] || field)
    .join(", ");


const AddDoctorForm = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  // The panel-curated departments (SUB services). They seed the "Speciality"
  // dropdown so a value picked here always matches an option in the public
  // speciality filter; `src/constant.js` is the offline fallback.
  const { specialityNames } = useGlobalData();

  // Wizard position + inline errors for the CURRENT step.
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  // Set once the doctor is registered; switches the page to the success panel.
  const [submitted, setSubmitted] = useState(false);

  const [diplomasCertificates, setDiplomasCertificates] = useState([]);
  const [profilePicture, setprofilePicture] = useState("");
  // Object URL of the picked picture, so step 6 can show the real photo before
  // it is uploaded.
  const [profilePreviewUrl, setProfilePreviewUrl] = useState("");
  // PAN card scan (step 4), uploaded as-is by the API.
  const [panCard, setPanCard] = useState(null);
  const [doctorSignature, setDoctorSignature] = useState("");
  const [loader, setLoader] = useState(false);
  const [weeklyAvailability, setWeeklyAvailability] = useState([]);
  const [message, setMessage] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedService, setSelectedService] = useState([]);
  // Array of canonical day names; mirrored into doctorDetails.workDays as a
  // comma-joined string, which is what the API stores.
  const [workDaysError, setWorkDaysError] = useState("");
  // Draft rows for the repeatable education/training inputs; blank rows are
  // filtered out on submit by `appendEducationTraining`.
  const [educationItems, setEducationItems] = useState([""]);
  // Draft rows for the repeatable work-experience inputs; blank rows are
  // filtered out on submit by `appendWorkExperience`. At least one is required.
  const [workExperienceItems, setWorkExperienceItems] = useState([""]);
  const [workExperienceError, setWorkExperienceError] = useState("");
  // Draft rows for the repeatable language inputs; at least one is required.
  const [languageItems, setLanguageItems] = useState([""]);
  const [languageError, setLanguageError] = useState("");

  const [doctorDetails, setDoctorDetails] = useState(EMPTY_DOCTOR);
  // Doctor share defaults to 70% and stays locked until the admin clicks the pencil.
  const [isShareEditable, setIsShareEditable] = useState(false);
  // Bumped by Reset / "Add another doctor" so the <ImageUploader />s and the
  // location picker remount (their preview state lives inside those components).
  const [uploaderKey, setUploaderKey] = useState(0);
  // Inline "already registered" messages for email / mobile number, keyed by name.
  const [uniqueErrors, setUniqueErrors] = useState({});
  // A restored draft is announced once, with a "start fresh" escape hatch.
  const [draftRestored, setDraftRestored] = useState(false);
  // False until the saved draft has been read. The form (and the location picker,
  // which keeps its own state) is rendered only afterwards, so a restored state /
  // city can never disagree with what the picker shows.
  const [hydrated, setHydrated] = useState(false);

  // Latest form values, so a slow uniqueness response cannot overwrite a message
  // for a value the admin has changed in the meantime.
  const latestDetails = useRef(doctorDetails);
  latestDetails.current = doctorDetails;

  const formRef = useRef(null);
  const previewUrlRef = useRef("");
  const draftCheckedRef = useRef(false);

  const storedService = useSelector(
    (state) => state.superAdminHomePage.serviceOffered
  );

  // Everything the step validators need, in one place: the stepper, "Save &
  // continue" and "Add doctor" all read the same object.
  const validationContext = {
    values: doctorDetails,
    weeklyAvailability,
    languageItems,
    workExperienceItems,
    selectedTypes,
    selectedService,
    uniqueErrors,
  };

  const currentStep = WIZARD_STEPS[step];
  const StepComponent = STEP_COMPONENTS[step];


  useEffect(() => {
    if (!storedService || storedService.length === 0) {
      fetch(api.serviceOffered)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) dispatch(setServiceOffered(data));
        })
        .catch((err) => console.error("Failed to fetch services:", err));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The local picture URL must be released when the page unmounts.
  useEffect(
    () => () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    },
    []
  );

  // Restore an unfinished registration ONCE, on mount. Only a draft with at least
  // one identifying value is restored - an empty draft is discarded so a fresh
  // visit never starts on step 4 with blank fields.
  useEffect(() => {
    if (draftCheckedRef.current) return;
    draftCheckedRef.current = true;
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw);
      if (!draft || typeof draft !== "object") return;

      const restored =
        draft.values && typeof draft.values === "object" ? draft.values : null;
      if (
        !restored ||
        (!restored.name && !restored.email && !restored.mobileNumber)
      ) {
        window.localStorage.removeItem(DRAFT_KEY);
        return;
      }

      setDoctorDetails({
        ...EMPTY_DOCTOR,
        ...restored,
        location: { ...EMPTY_DOCTOR.location, ...(restored.location || {}) },
      });
      if (Array.isArray(draft.weeklyAvailability)) {
        setWeeklyAvailability(draft.weeklyAvailability);
      }
      if (Array.isArray(draft.educationItems) && draft.educationItems.length) {
        setEducationItems(draft.educationItems);
      }
      if (
        Array.isArray(draft.workExperienceItems) &&
        draft.workExperienceItems.length
      ) {
        setWorkExperienceItems(draft.workExperienceItems);
      }
      if (Array.isArray(draft.languageItems) && draft.languageItems.length) {
        setLanguageItems(draft.languageItems);
      }
      if (Array.isArray(draft.selectedTypes)) setSelectedTypes(draft.selectedTypes);
      if (Array.isArray(draft.selectedService)) {
        setSelectedService(draft.selectedService);
      }
      const restoredStep = Number(draft.step);
      if (Number.isInteger(restoredStep)) {
        setStep(Math.min(Math.max(restoredStep, 0), WIZARD_STEPS.length - 1));
      }
      setDraftRestored(true);
    } catch (error) {
      console.error("Could not restore the doctor draft:", error);
    } finally {
      setHydrated(true);
    }
  }, []);

  // Keep the draft up to date. Uploads are deliberately excluded - a File cannot
  // be serialised, and a stale one would be worse than none. Nothing is written
  // before the stored draft has been read, so the first paint cannot overwrite a
  // resumable draft with the blank form.
  useEffect(() => {
    if (!hydrated || submitted) return;
    try {
      window.localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          values: doctorDetails,
          weeklyAvailability,
          educationItems,
          workExperienceItems,
          languageItems,
          selectedTypes,
          selectedService,
          step,
        })
      );
    } catch (error) {
      // Private mode / full quota: the wizard still works, it just cannot resume.
      console.error("Could not save the doctor draft:", error.message);
    }
  }, [
    doctorDetails,
    weeklyAvailability,
    educationItems,
    workExperienceItems,
    languageItems,
    selectedTypes,
    selectedService,
    step,
    hydrated,
    submitted,
  ]);

  // Warn before a reload / tab close once the admin has typed something.
  useEffect(() => {
    const dirty = Boolean(
      doctorDetails.name ||
        doctorDetails.email ||
        doctorDetails.mobileNumber ||
        weeklyAvailability.length ||
        selectedTypes.length
    );
    if (!dirty || submitted) return undefined;

    const warn = (event) => {
      event.preventDefault();
      event.returnValue = "";
      return "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [
    doctorDetails.name,
    doctorDetails.email,
    doctorDetails.mobileNumber,
    weeklyAvailability.length,
    selectedTypes.length,
    submitted,
  ]);

  const clearDraft = () => {
    try {
      window.localStorage.removeItem(DRAFT_KEY);
    } catch (error) {
      console.error("Could not clear the doctor draft:", error.message);
    }
  };

  const handleAddType = (e) => {
    const value = String(e.target.value || "").trim();
    if (!value) return;

    if (!selectedTypes.some((item) => item.name === value)) {
      setSelectedTypes((prevTypes) => {
        const updatedTypes = [
          ...prevTypes,
          { name: value, price: null, clinicName: "", clinicLocation: "" },
        ];

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

  // Clinic name / location typed for one consultation type. Both are optional
  // free text; the key is whitelisted so a caller cannot write any other one.
  const handleTypeClinicChange = (type, field, value) => {
    if (!TYPE_CLINIC_FIELDS.includes(field)) return;
    const updatedTypes = selectedTypes.map((item) =>
      item.name === type ? { ...item, [field]: value } : item
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

        // Update doctorDetails with the new serviceOffered
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

  // <WeeklyAvailabilityEditor /> already returns a Monday -> Sunday ordered array.
  const handleWeeklyAvailabilityChange = (availability) => {
    setWeeklyAvailability(availability);
    setDoctorDetails((prevDetails) => ({
      ...prevDetails,
      workDays: availability.map(({ day }) => day).join(","),
    }));
    if (availability.length > 0) {
      setWorkDaysError("");
      setErrors((previous) =>
        previous.workDays ? { ...previous, workDays: "" } : previous
      );
    }
  };

  // Languages - draft rows in, array out; the FormData body is built on submit
  // by `appendLanguages`.
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



  // Clears the whole form and starts again on step 1. `uploaderKey` is bumped so
  // the <ImageUploader />s and the location picker remount, which empties their
  // internal state.
  const handleReset = () => {
    setDoctorDetails(EMPTY_DOCTOR);
    setIsShareEditable(false);
    setSelectedTypes([]);
    setSelectedService([]);
    setWeeklyAvailability([]);
    setEducationItems([""]);
    setWorkExperienceItems([""]);
    setLanguageItems([""]);
    setprofilePicture("");
    setDoctorSignature("");
    setDiplomasCertificates([]);
    setPanCard(null);
    setWorkDaysError("");
    setLanguageError("");
    setWorkExperienceError("");
    setUniqueErrors({});
    setStep(0);
    setErrors({});
    setSubmitted(false);
    setDraftRestored(false);
    clearDraft();
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = "";
    }
    setProfilePreviewUrl("");
    setUploaderKey((key) => key + 1);
  };

  // "Clear form" wipes every step - it is deliberately behind a confirm, because
  // a mis-click on step 5 would otherwise lose the whole registration.
  const handleClearForm = () => {
    if (typeof window !== "undefined") {
      const confirmed = window.confirm(
        "Clear the whole form? Everything typed so far will be lost."
      );
      if (!confirmed) return;
    }
    handleReset();
  };

  /**
   * Single place a field is written from: an input event (`handleChange`) or a
   * control that computes its own value (the speciality dropdown). Clears the
   * field's error and the stale "already taken" note on the way.
   */
  const setFieldValue = (name, value) => {
    const normalise = FIELD_NORMALISERS[name];
    const nextValue = normalise ? normalise(value) : value;

    if (UNIQUE_TEXT_FIELDS.includes(name) && uniqueErrors[name]) {
      // The admin is fixing the value - drop the stale "already taken" note.
      setUniqueErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (errors[name]) {
      setErrors((previous) => ({ ...previous, [name]: "" }));
    }

    setDoctorDetails((previous) => ({ ...previous, [name]: nextValue }));
  };

  const handleChange = (e) => setFieldValue(e.target.name, e.target.value);

  const handleDoctorNameBlur = () => {
    setDoctorDetails((previous) => ({
      ...previous,
      name: formatDoctorNameForAdd(previous.name),
    }));
  };

  /**
   * Asks the API whether the value of `name` is still free. Runs on blur so the
   * admin is warned before submitting, without a request per keystroke.
   */
  const checkUniqueField = async (name, value) => {
    const trimmed = String(value ?? "").trim();
    if (!trimmed) {
      setUniqueErrors((prev) => ({ ...prev, [name]: "" }));
      return;
    }

    const params = new URLSearchParams({ checkUnique: "1" });
    params.set(name, trimmed);

    try {
      const response = await fetch(`${api.addDoctor}?${params.toString()}`);
      if (!response.ok) return;

      const data = await response.json();
      // Ignore stale answers: the field may have been edited while in flight.
      if (String(latestDetails.current[name] ?? "").trim() !== trimmed) return;

      const duplicate = (data.duplicates || []).find(
        (entry) => entry.field === name
      );
      setUniqueErrors((prev) => ({
        ...prev,
        [name]: duplicate ? duplicate.message : "",
      }));
    } catch (error) {
      console.error("Could not check the doctor details:", error);
    }
  };

  const handleUniqueBlur = (e) => {
    const { name, value } = e.target;
    if (UNIQUE_TEXT_FIELDS.includes(name)) checkUniqueField(name, value);
  };

  const handleImagesChange = (id, newImages) => {
    if (id === "profilePicture") {
      const file = newImages.length > 0 ? newImages[0] : "";
      setprofilePicture(file);
      // Refresh the preview URL, releasing the previous one.
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = file ? URL.createObjectURL(file) : "";
      setProfilePreviewUrl(previewUrlRef.current);
    } else if (id === "diplomasCertificates") {
      setDiplomasCertificates(newImages);
    } else if (id === "doctorSignature") {
      setDoctorSignature(newImages.length > 0 ? newImages[0] : "");
    } else if (id === "panCard") {
      setPanCard(newImages.length > 0 ? newImages[0] : null);
    }
  };


  // ── Navigation ─────────────────────────────────────────────────────────────

  // Scrolls to (and focuses) the first control the validator marked invalid.
  const focusFirstError = () => {
    if (typeof window === "undefined") return;
    window.requestAnimationFrame(() => {
      const container = formRef.current;
      if (!container) return;
      const marked = container.querySelector('[aria-invalid="true"]');
      const wrapper = container.querySelector('[data-invalid="true"]');
      const target =
        marked ||
        (wrapper && wrapper.querySelector("input, select, textarea, button")) ||
        wrapper;
      if (!target) return;
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      if (typeof target.focus === "function") {
        target.focus({ preventScroll: true });
      }
    });
  };

  const goToStep = (index) => {
    setStep(index);
    setErrors({});
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Clicking a step: back is always allowed, forward only when everything before
  // it is complete (otherwise the wizard silently "loses" the missing fields).
  const handleStepSelect = (index) => {
    if (index === step) return;

    if (index > step) {
      for (let cursor = step; cursor < index; cursor += 1) {
        const problems = validateStep(
          WIZARD_STEPS[cursor].id,
          validationContext
        );
        if (Object.keys(problems).length > 0) {
          setStep(cursor);
          setErrors(problems);
          handleShowDialog(
            `Complete "${WIZARD_STEPS[cursor].title}" before moving ahead.`
          );
          focusFirstError();
          return;
        }
      }
    }

    goToStep(index);
  };

  const handleNext = () => {
    const problems = validateStep(currentStep.id, validationContext);
    setErrors(problems);

    if (Object.keys(problems).length > 0) {
      // The repeatable inputs keep their own error state - keep it in sync so the
      // message appears next to the rows, not only in the dialog.
      if (currentStep.id === "schedule") {
        setWorkDaysError(problems.workDays || "");
      }
      if (currentStep.id === "qualifications") {
        setWorkExperienceError(problems.workExperience || "");
        setLanguageError(problems.language || "");
      }
      focusFirstError();
      return;
    }

    if (step < WIZARD_STEPS.length - 1) goToStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) goToStep(step - 1);
  };

  // "Skip for now" on step 4. Nothing typed = straight through. Something typed
  // = the same gate as "Save & continue", so a half-finished IFSC can never ride
  // along on a "skipped" step.
  const handleSkipBanking = () => {
    const hasBankValue = BANK_TEXT_FIELDS.some((field) =>
      String(doctorDetails[field] ?? "").trim()
    );
    if (!hasBankValue) {
      goToStep(step + 1);
      return;
    }
    handleNext();
  };

  // ── Derived data for the preview + the completeness rail ──────────────────

  const previewDoctor = useMemo(
    () => ({
      name: formatDoctorNameForAdd(doctorDetails.name),
      email: doctorDetails.email,
      mobileNumber: doctorDetails.mobileNumber,
      expertise: doctorDetails.expertise,
      serviceOffered: selectedService,
      consultationType: selectedTypes,
      educationTraining: parseEducationTraining(educationItems),
      workExperience: parseWorkExperience(workExperienceItems),
      language: parseLanguages(languageItems),
      totalyearofexperience: doctorDetails.totalyearofexperience,
      location: doctorDetails.location,
      overview: doctorDetails.overview,
      weeklyAvailability,
      profilePictureUrl: profilePreviewUrl,
    }),
    [
      doctorDetails,
      selectedService,
      selectedTypes,
      educationItems,
      workExperienceItems,
      languageItems,
      weeklyAvailability,
      profilePreviewUrl,
    ]
  );

  const completenessItems = [
    { step: 0, label: "Name", done: Boolean(doctorDetails.name.trim()) },
    {
      step: 0,
      label: "Email",
      done: Boolean(doctorDetails.email.trim()) && !uniqueErrors.email,
    },
    {
      step: 0,
      label: "Mobile number",
      done:
        Boolean(doctorDetails.mobileNumber.trim()) && !uniqueErrors.mobileNumber,
    },
    {
      step: 1,
      label: "Speciality",
      done: Boolean(doctorDetails.expertise.trim()),
    },
    {
      step: 1,
      label: "Work experience",
      done: parseWorkExperience(workExperienceItems).length > 0,
    },
    {
      step: 1,
      label: "Languages",
      done: parseLanguages(languageItems).length > 0,
    },
    { step: 1, label: "Overview", done: Boolean(doctorDetails.overview.trim()) },
    {
      step: 2,
      label: "Work days & hours",
      done: !validateWeeklyAvailability(weeklyAvailability),
    },
    { step: 2, label: "Consultation types", done: selectedTypes.length > 0 },
    {
      step: 2,
      label: "Services offered",
      // Optional while the field is turned off (SERVICES_OFFERED_ENABLED).
      done: !SERVICES_OFFERED_ENABLED || selectedService.length > 0,
    },
    {
      step: 3,
      label: "PAN & bank account",
      optional: true,
      done:
        Boolean(doctorDetails.panNumber || doctorDetails.bankAccountNumber) &&
        isStepComplete("banking", validationContext),
    },
    {
      step: 4,
      label: "Profile picture",
      optional: true,
      done: Boolean(profilePicture),
    },
    {
      step: 4,
      label: "Digital signature",
      optional: true,
      done: Boolean(doctorSignature),
    },
    {
      step: 4,
      label: "Certificates",
      optional: true,
      done: diplomasCertificates.length > 0,
    },
  ];

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    // Final gate: every step is re-validated and the wizard jumps to the first
    // one that is still incomplete.
    for (let index = 0; index < WIZARD_STEPS.length; index += 1) {
      const problems = validateStep(WIZARD_STEPS[index].id, validationContext);
      if (Object.keys(problems).length === 0) continue;

      setStep(index);
      setErrors(problems);
      if (WIZARD_STEPS[index].id === "schedule") {
        setWorkDaysError(problems.workDays || "");
      }
      if (WIZARD_STEPS[index].id === "qualifications") {
        setWorkExperienceError(problems.workExperience || "");
        setLanguageError(problems.language || "");
      }
      handleShowDialog(
        `Please complete "${WIZARD_STEPS[index].title}": ${describeProblems(
          problems
        )}`
      );
      focusFirstError();
      return;
    }

    // A known clash from the on-blur check blocks the submit; the server checks
    // both fields again, so a stale message cannot stop a valid doctor.
    const knownDuplicates = UNIQUE_TEXT_FIELDS.map(
      (field) => uniqueErrors[field]
    ).filter(Boolean);
    if (knownDuplicates.length > 0) {
      setStep(0);
      setErrors(validateStep("profile", validationContext));
      handleShowDialog(knownDuplicates[0]);
      focusFirstError();
      return;
    }

    setLoader(true);

    // Unchanged payload: the keys below are exactly what the single-page form
    // sent. The optional banking/PAN parts are appended at the end.
    const formData = new FormData();
    const formattedDoctorName = formatDoctorNameForAdd(doctorDetails.name);
    setDoctorDetails((previous) => ({
      ...previous,
      name: formattedDoctorName,
    }));
    formData.append("name", formattedDoctorName);
    formData.append("email", doctorDetails.email);
    formData.append("gender", doctorDetails.gender);
    formData.append("mobileNumber", doctorDetails.mobileNumber);
    formData.append("expertise", doctorDetails.expertise);
    // Optional - a blank value is stored as-is and can be filled in later.
    formData.append("doctorRegistrationNo", doctorDetails.doctorRegistrationNo);
    // One field per entry; a blank field clears the list on the API side.
    appendLanguages(formData, languageItems);
    formData.append("workDays", doctorDetails.workDays);
    formData.append("weeklyAvailability", JSON.stringify(weeklyAvailability));
    formData.append("overview", doctorDetails.overview);
    // One field per entry; a blank field clears the list on the API side.
    appendEducationTraining(formData, educationItems);
    appendWorkExperience(formData, workExperienceItems);
    formData.append("totalyearofexperience", doctorDetails.totalyearofexperience);
    formData.append("consultationType", JSON.stringify(selectedTypes));
    formData.append("serviceOffered", selectedService.join(","));
    formData.append("digitalSignature", doctorSignature);
    const location = doctorDetails.location || {};
    formData.append("locationState", location.state || "");
    formData.append("locationCity", location.city || "");
    formData.append("profilePicture", profilePicture);
    formData.append("doctorType", doctorDetails.doctorType);
    formData.append("doctorShare", doctorDetails.doctorShare);
    diplomasCertificates.forEach((certificate, index) => {
      formData.append(`diplomasCertificates[${index}]`, certificate);
    });

    // Step 4 (optional). Blank values are sent too - the API treats "all blank"
    // as "nothing to store", which keeps this branch free of conditionals.
    BANK_TEXT_FIELDS.forEach((field) => {
      formData.append(field, String(doctorDetails[field] ?? "").trim());
    });
    if (panCard) formData.append("panCard", panCard);

    try {
      const response = await fetch(api.addDoctor, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        // The roster is shared redux state - refresh it so every page (public
        // listing, panels) sees the new doctor without a reload.
        dispatch(fetchAllDoctors({ force: true }));
        clearDraft();
        setSubmitted(true);
        if (typeof window !== "undefined") {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      } else {
        // The API answers a duplicate with 409 + a friendly `message` and the
        // clashing field(s); show that instead of a generic failure.
        let payload = null;
        try {
          payload = await response.json();
        } catch (error) {
          console.error("Could not read the error response:", error);
        }

        if (Array.isArray(payload?.duplicates) && payload.duplicates.length > 0) {
          setUniqueErrors((prev) => {
            const next = { ...prev };
            payload.duplicates.forEach((duplicate) => {
              if (UNIQUE_TEXT_FIELDS.includes(duplicate.field)) {
                next[duplicate.field] = duplicate.message;
              }
            });
            return next;
          });
          // Back to step 1, where those fields live.
          setStep(0);
          setErrors(validateStep("profile", validationContext));
          focusFirstError();
        } else if (payload?.fields) {
          // A rejected PAN / IFSC / account number (400): back to step 4 with the
          // messages on the fields.
          setStep(3);
          setErrors(validateStep("banking", validationContext));
          focusFirstError();
        }

        console.error("Error adding doctor:", response.statusText);
        handleShowDialog(
          payload?.message ||
            payload?.error ||
            "Something went wrong, please try again"
        );
      }
    } catch (error) {
      console.error("Error adding doctor:", error.message);
      handleShowDialog("Something went wrong, please try again");
    }
    setLoader(false);
  };


  // ── Render ────────────────────────────────────────────────────────────────

  if (submitted) {
    return (
      <div className={styles.page}>
        <section className={styles.card}>
          <div className={styles.successPanel}>
            <span className={styles.successIcon} aria-hidden="true">
              <FaCheckCircle />
            </span>
            <h1 className={styles.heroTitle}>Doctor registered</h1>
            <p className={styles.heroSubtitle}>
              {formatDoctorNameForAdd(doctorDetails.name) ||
                "The doctor"}{" "}
              has been added and is live on the website. The login details were
              sent on WhatsApp to {doctorDetails.mobileNumber || "their number"}.
            </p>
            <div className={styles.successActions}>
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={handleReset}
              >
                Add another doctor
              </button>
              <button
                type="button"
                className={styles.ghostBtn}
                onClick={() => router.push("/superAdmin/homepage")}
              >
                Go to dashboard
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const stepProps = {
    values: doctorDetails,
    errors,
    handleChange,
    setFieldValue,
    specialityOptions: specialityNames,
    handleDoctorNameBlur,
    handleUniqueBlur,
    handleLocationChange,
    uniqueErrors,
    uploaderKey,
    weeklyAvailability,
    handleWeeklyAvailabilityChange,
    workDaysError,
    educationItems,
    setEducationItems,
    workExperienceItems,
    handleWorkExperienceChange,
    workExperienceError,
    languageItems,
    handleLanguagesChange,
    languageError,
    selectedTypes,
    handleAddType,
    handleRemoveType,
    handleServicePriceChange,
    handleTypeClinicChange,
    selectedService,
    handleAddService,
    handleRemoveService,
    storedService,
    isShareEditable,
    setIsShareEditable,
    handleImagesChange,
    previewDoctor,
    profilePreviewUrl,
  };

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">
          <FaUserMd />
        </span>
        <div className={styles.heroText}>
          <h1 className={styles.heroTitle}>Add a new doctor</h1>
          <p className={styles.heroSubtitle}>
            Six short steps. Steps 1 to 3 are required - banking, documents and
            pictures can be skipped and added later.
          </p>
        </div>
        <button
          type="button"
          className={styles.linkBtn}
          onClick={handleClearForm}
        >
          Clear form
        </button>
      </header>

      {draftRestored ? (
        <div className={styles.notice} role="status">
          <span>Draft restored from your last visit.</span>
          <button type="button" className={styles.linkBtn} onClick={handleReset}>
            Start fresh
          </button>
          <button
            type="button"
            className={styles.linkBtn}
            onClick={() => setDraftRestored(false)}
          >
            Dismiss
          </button>
        </div>
      ) : null}

      <WizardStepper
        currentStep={step}
        isComplete={(id) => isStepComplete(id, validationContext)}
        onSelect={handleStepSelect}
      />

      <div className={styles.layout}>
        <div className={styles.main}>
          {hydrated ? (
            <form
              ref={formRef}
              onSubmit={(event) => event.preventDefault()}
              noValidate
              aria-label={`${currentStep.title} - add doctor`}
            >
              <StepComponent {...stepProps} />
            </form>
          ) : (
            <section className={styles.card}>
              <p className={styles.hint}>Restoring your draft…</p>
            </section>
          )}
        </div>

        <aside className={styles.rail}>
          <div className={styles.railCard}>
            <CompletenessChecklist
              items={completenessItems}
              onJump={handleStepSelect}
            />

            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Tips</h2>
              <ul className={styles.tipList}>
                <li>Blank education and language rows are ignored.</li>
                <li>
                  Documents can be re-uploaded later from the doctor profile.
                </li>
                <li>Your progress is kept in this browser as a draft.</li>
              </ul>
            </section>
          </div>
        </aside>
      </div>

      <StepActions
        currentStep={step}
        submitting={loader}
        onBack={handleBack}
        onNext={handleNext}
        onSkip={currentStep.id === "banking" ? handleSkipBanking : undefined}
        onSubmit={handleSubmit}
      />

      <CustomDialog
        show={showDialog}
        handleClose={handleCloseDialog}
        message={message}
      />

      {loader && <Preloader />}
    </div>
  );
};

export default AddDoctorForm;

