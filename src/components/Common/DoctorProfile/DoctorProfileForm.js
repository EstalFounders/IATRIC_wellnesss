// DoctorProfileForm.js
// The doctor profile form behind both dedicated profile pages:
//   * pages/registerDoc/profile.js      - doctor panel -> "Your Profile"
//   * pages/superAdmin/doctorProfile.js - super admin -> pencil on the doctor list
//
// It replaces the "Edit Doctor Details" popup (DoctorModalComp, kept in the repo
// for rollback): same fields, same validation, same approval semantics - only the
// presentation changed into a page (section cards, a live stamp preview and a
// sticky action bar). The field `name`s are unchanged, so the diff/PUT payloads
// are identical to the ones the popup produced.
import React, { useEffect, useMemo, useState } from "react";
import { Form, Row, Col } from "react-bootstrap";
import {
  FaCalendarCheck,
  FaClipboardList,
  FaClock,
  FaFileUpload,
  FaPencilAlt,
  FaStethoscope,
  FaTrash,
  FaUserCircle,
  FaUserMd,
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import {
  convertDateIntoTime,
  convertTimeIntoDate,
  isMobileValid,
} from "../../../helper";
import {
  api,
  DoctorType,
  superAdminConsultationtype,
  userTypeConstant,
} from "../../../constant";
import { setServiceOffered } from "../../../store/slices/superAdmin/homepageSlice";
import WorkDaysPicker from "../WorkDaysPicker";
import EducationTrainingInput from "../EducationTrainingInput";
import WorkExperienceInput from "../WorkExperienceInput";
import LanguageInput from "../LanguageInput";
import { formatWorkDays, parseWorkDays } from "../../../customUtils/workDays";
import { parseEducationTraining } from "../../../customUtils/educationTraining";
import { parseWorkExperience } from "../../../customUtils/workExperience";
import { doctorDisplayName } from "../../../utils/doctorName";
import { toConsultationTypeEntries } from "../../../utils/consultationFee";
import { parseLanguages } from "../../../customUtils/languages";
import {
  displayFileNameFromUrl,
  fileNameFromUrl,
  isPreviewableImage,
  isPreviewableImageUrl,
} from "../../../customUtils/imageUpload";
import StoredDocumentThumb from "../StoredDocumentThumb";
import { formatLocation } from "../../../customUtils/indiaLocations";
import { stampDataUrl } from "../../registerDocComponent/lib/DoctorStampGenerator";
import { buildChangedFields } from "./lib/doctorProfileSubmit";
import styles from "./DoctorProfileForm.module.css";

const DoctorProfileForm = ({
  doctor,
  origin,
  onSave,
  onCancel,
  saving = false,
  uploadStatus = "",
  banner = "",
  saveLabel = "Save changes",
  cancelLabel = "Cancel",
}) => {
  // Documents (diplomas + photo) stay super-admin only, exactly like the popup.
  // Flipping this to true also enables the Doctor Panel photo approval flow -
  // `buildChangedFields` already reports a picked File as `pendingPhoto`.
  const canEditDocuments = origin !== userTypeConstant.doctor;

  // `editedDoctor` starts as a copy of the stored document and only the touched
  // keys are rewritten, so an untouched legacy value ("mon-sunday", a joined
  // string) still reports "no change" in the approval diff.
  const [editedDoctor, setEditedDoctor] = useState({ ...doctor });
  // The stored picture is shown as an inline thumbnail; only an image can go into
  // an <img>, so a PDF (or an unrecognisable extension) is listed by file name.
  const [profilePicturePreview, setProfilePicturePreview] = useState(
    isPreviewableImageUrl(doctor.profilePictureUrl)
      ? doctor.profilePictureUrl
      : ""
  );
  const [profilePictureFileName, setProfilePictureFileName] = useState(
    doctor.profilePictureUrl &&
      !isPreviewableImageUrl(doctor.profilePictureUrl)
      ? fileNameFromUrl(doctor.profilePictureUrl) || "Picture on file"
      : ""
  );
  const [diplomasCertificatesPreview, setDiplomasCertificatesPreview] =
    useState(doctor.diplomasCertificatesUrls);

  // Digital signature slot (super admin only, like the other documents). An image
  // is previewed inline and a PDF/other document is shown by file name, exactly
  // like the Add Doctor form's uploader.
  const [signaturePreviewUrl, setSignaturePreviewUrl] = useState(
    isPreviewableImageUrl(doctor.doctorSignatureUrl)
      ? doctor.doctorSignatureUrl
      : ""
  );
  const [signatureFileName, setSignatureFileName] = useState(
    doctor.doctorSignatureUrl &&
      !isPreviewableImageUrl(doctor.doctorSignatureUrl)
      ? fileNameFromUrl(doctor.doctorSignatureUrl) || "Signature on file"
      : ""
  );

  const [slotStartTime, setSlotStartTime] = useState(
    convertDateIntoTime(editedDoctor.slotStartTime)
  );
  const [slotEndTime, setSlotEndTime] = useState(
    convertDateIntoTime(editedDoctor.slotEndTime)
  );

  const [selectedTypes, setSelectedTypes] = useState(() =>
    toConsultationTypeEntries(editedDoctor.consultationType)
  );
  const [selectedServices, setSelectedServices] = useState(
    Array.isArray(editedDoctor.serviceOffered) ? editedDoctor.serviceOffered : []
  );

  // Day chips. The array drives the picker, while `editedDoctor.workDays` stays
  // a comma-joined string: the doctor document stores a String and the approval
  // flow (`doctorUpdateReq`) compares strings. A legacy value (\"mon-sunday\") is
  // parsed here and only rewritten on a click.
  const [selectedWorkDays, setSelectedWorkDays] = useState(
    parseWorkDays(doctor.workDays)
  );
  const [workDaysError, setWorkDaysError] = useState("");

  // Draft rows for the repeatable education/training inputs.
  const [educationItems, setEducationItems] = useState(
    parseEducationTraining(doctor.educationTraining)
  );

  // Draft rows for the repeatable work-experience inputs.
  const [workExperienceItems, setWorkExperienceItems] = useState(
    parseWorkExperience(doctor.workExperience)
  );

  // Draft rows for the repeatable language inputs.
  const [languageItems, setLanguageItems] = useState(
    parseLanguages(doctor.language)
  );
  const [languageError, setLanguageError] = useState("");

  const [showAddInput, setShowAddInput] = useState(false);

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
    if (!file) return;

    // The picture is rendered inside an <img> everywhere (list, profile page,
    // prescription), so a document is refused here exactly like the API does it -
    // "any file type" only ever applied to the certificates.
    if (!isPreviewableImage(file)) {
      e.target.value = "";
      window.alert(
        "The profile picture must be an image (JPG, PNG or WEBP)."
      );
      return;
    }

    setEditedDoctor({
      ...editedDoctor,
      profilePictureUrl: file,
    });
    setProfilePicturePreview(URL.createObjectURL(file));
    setProfilePictureFileName("");
  };

  const handleDiplomasCertificatesChange = (e) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;

    // Newly picked certificates are ADDED to the ones already stored - adding a
    // diploma later must never drop the existing documents.
    const updated = [
      ...(editedDoctor.diplomasCertificatesUrls || []),
      ...selected,
    ];
    e.target.value = "";

    setEditedDoctor({ ...editedDoctor, diplomasCertificatesUrls: updated });
    setDiplomasCertificatesPreview(updated);
  };

  const handleDeleteProfilePicture = () => {
    setEditedDoctor({ ...editedDoctor, profilePictureUrl: "" });
    setProfilePicturePreview("");
    setProfilePictureFileName("");
  };

  const handleDeleteDiplomasCertificate = (index) => {
    const updatedUrls = [...(editedDoctor.diplomasCertificatesUrls || [])];
    updatedUrls.splice(index, 1);
    setEditedDoctor({ ...editedDoctor, diplomasCertificatesUrls: updatedUrls });
    setDiplomasCertificatesPreview(updatedUrls);
  };

  const handleSignatureChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // The signature is printed as an <img> on the prescription and the contract,
    // so a document is refused here too (the API answers the same 400).
    if (!isPreviewableImage(file)) {
      e.target.value = "";
      window.alert("The digital signature must be an image (JPG, PNG or WEBP).");
      return;
    }

    // Only the File goes into the form state (`buildChangedFields` reports it as a
    // change and `submitDoctorUpdate` uploads it); the preview stays local.
    setEditedDoctor({ ...editedDoctor, doctorSignatureUrl: file });
    setSignaturePreviewUrl(URL.createObjectURL(file));
    setSignatureFileName("");
  };

  const handleDeleteSignature = () => {
    // "" tells the API to clear the stored signature - a URL would keep it.
    setEditedDoctor({ ...editedDoctor, doctorSignatureUrl: "" });
    setSignaturePreviewUrl("");
    setSignatureFileName("");
  };

  const handleRemoveType = (type) => {
    const updatedTypes = selectedTypes.filter((item) => item.name !== type);
    setSelectedTypes(updatedTypes);
    setEditedDoctor((prev) => ({ ...prev, consultationType: updatedTypes }));
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
    setEditedDoctor((prev) => ({ ...prev, consultationType: updatedTypes }));
  };

  // Consultation type - picked from the fixed list (Audio, Video, Home visit,
  // Clinic)
  const handleAddType = (value) => {
    const trimmed = String(value || "").trim();
    if (!trimmed) return;
    // Duplicate check (case-insensitive)
    if (selectedTypes.some((t) => t.name.toLowerCase() === trimmed.toLowerCase()))
      return;
    const updatedTypes = [...selectedTypes, { name: trimmed, price: null }];
    setSelectedTypes(updatedTypes);
    setEditedDoctor((prev) => ({ ...prev, consultationType: updatedTypes }));
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
  const handleLanguagesChange = (items) => {
    setLanguageItems(items);
    setEditedDoctor({ ...editedDoctor, language: parseLanguages(items) });
    if (parseLanguages(items).length > 0) setLanguageError("");
  };

  // "You have unsaved changes" + a browser guard against a closed tab. The same
  // diff also drives the save flow, so the note can never disagree with it.
  const isDirty = useMemo(
    () => buildChangedFields(doctor, editedDoctor).hasChanges,
    [doctor, editedDoctor]
  );

  useEffect(() => {
    if (!isDirty) return undefined;
    const warn = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty]);

  // Live preview of the prescription stamp the doctor prints with - it uses the
  // edited name / expertise / registration number, so a typo is visible before
  // saving.
  const stampPreview = useMemo(
    () =>
      stampDataUrl({
        name: editedDoctor.name || "",
        specialization: editedDoctor.expertise || "",
        regNo: editedDoctor.doctorRegistrationNo || "",
      }),
    [
      editedDoctor.name,
      editedDoctor.expertise,
      editedDoctor.doctorRegistrationNo,
    ]
  );

  const handleCancel = () => {
    if (
      isDirty &&
      !window.confirm("Discard the changes you made to this profile?")
    ) {
      return;
    }
    onCancel?.();
  };

  const handleSubmit = (event) => {
    event?.preventDefault?.();
    if (selectedWorkDays.length === 0) {
      setWorkDaysError("Please select at least one workday");
      return;
    }
    if (parseLanguages(languageItems).length === 0) {
      setLanguageError("Please add at least one language");
      return;
    }
    if (!isMobileValid(editedDoctor.mobileNumber)) {
      window.alert("Please enter a valid mobile number");
      return;
    }
    onSave?.(editedDoctor);
  };

  const initial = (editedDoctor.name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div>
          {profilePicturePreview ? (
            <img
              src={profilePicturePreview}
              alt="Doctor profile"
              className={styles.avatar}
              // A document stored in the picture slot cannot be rendered; fall
              // back to the initials instead of a broken image.
              onError={() => setProfilePicturePreview("")}
            />
          ) : (
            <div className={styles.avatarFallback} aria-hidden="true">
              {initial || "DR"}
            </div>
          )}
        </div>

        <div className={styles.heroInfo}>
          <h1 className={styles.heroName}>
            {doctorDisplayName(editedDoctor.name) || "Unnamed doctor"}
          </h1>
          <p className={styles.heroSpeciality}>
            {editedDoctor.expertise || "No expertise set"}
          </p>
          <div className={styles.heroMeta}>
            <span className={styles.metaItem}>
              <strong>Reg. No:</strong>{" "}
              {editedDoctor.doctorRegistrationNo?.trim() || "Not provided"}
            </span>
            <span className={styles.metaItem}>
              <strong>Doctor type:</strong> {editedDoctor.doctorType || "-"}
            </span>
            <span
              className={`${styles.statusPill} ${
                editedDoctor.isActive === false
                  ? styles.statusInactive
                  : styles.statusActive
              }`}
            >
              {editedDoctor.isActive === false ? "Inactive" : "Active"}
            </span>
          </div>
        </div>
      </div>

      {banner ? (
        <div className={`${styles.banner} ${styles.bannerInfo}`}>{banner}</div>
      ) : null}

      <Form onSubmit={handleSubmit}>
        <div className={styles.layout}>
          <div className={styles.main}>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>
                <FaUserCircle /> Personal details
              </h2>
              <Row>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className={styles.label}>Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={editedDoctor.name || ""}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className={styles.label}>
                      Mobile Number
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="mobileNumber"
                      value={editedDoctor.mobileNumber || ""}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className={styles.label}>Location</Form.Label>
                    {/* The popup submitted this under `name="location,"` (stray
                        comma), so the value never reached the database. */}
                    <Form.Control
                      type="text"
                      name="location"
                      value={formatLocation(editedDoctor.location)}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className={styles.label}>Doctor Type</Form.Label>
                    <select
                      name="doctorType"
                      value={editedDoctor.doctorType || ""}
                      onChange={handleChange}
                      className={styles.selectInput}
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
              </Row>
            </div>

            <div className={styles.card}>
              <h2 className={styles.cardTitle}>
                <FaStethoscope /> Professional details
              </h2>
              <Row>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className={styles.label}>Expertise</Form.Label>
                    <Form.Control
                      type="text"
                      name="expertise"
                      value={editedDoctor.expertise || ""}
                      onChange={handleChange}
                    />
                    <p className={styles.hint}>
                      Printed as the second line of the prescription stamp.
                    </p>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className={styles.label}>
                      Registration Number
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="doctorRegistrationNo"
                      value={editedDoctor.doctorRegistrationNo || ""}
                      onChange={handleChange}
                    />
                    <p className={styles.hint}>
                      Optional - printed as the third line of the prescription
                      stamp and can be filled in at any time.
                    </p>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className={styles.label}>Overview</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="overview"
                      value={editedDoctor.overview || ""}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className={styles.label}>
                      Work Experience
                    </Form.Label>
                    <WorkExperienceInput
                      value={workExperienceItems}
                      onChange={handleWorkExperienceChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className={styles.label}>
                      Education Training
                    </Form.Label>
                    <EducationTrainingInput
                      value={educationItems}
                      onChange={handleEducationTrainingChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className={styles.label}>Language</Form.Label>
                    <LanguageInput
                      value={languageItems}
                      onChange={handleLanguagesChange}
                      error={languageError}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>

            <div className={styles.card}>
              <h2 className={styles.cardTitle}>
                <FaCalendarCheck /> Availability
              </h2>
              <Row>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className={styles.label}>Work Days</Form.Label>
                    <WorkDaysPicker
                      value={selectedWorkDays}
                      onChange={handleWorkDaysChange}
                      error={workDaysError}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label className={styles.label}>Start time</Form.Label>
                    <input
                      type="time"
                      id="slotStartTime"
                      name="slotStartTime"
                      value={slotStartTime}
                      onChange={handleChange}
                      min="07:00"
                      max="22:00"
                      className={styles.timeInput}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label className={styles.label}>End time</Form.Label>
                    <input
                      type="time"
                      id="slotEndTime"
                      name="slotEndTime"
                      value={slotEndTime}
                      onChange={handleChange}
                      min="07:00"
                      max="22:00"
                      className={styles.timeInput}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>

            <div className={styles.card}>
              <h2 className={styles.cardTitle}>
                <FaClipboardList /> Services &amp; consultation
              </h2>
              <Row>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className={styles.label}>
                      Consultation Type
                    </Form.Label>
                    <div className={styles.tagList}>
                      {selectedTypes.length === 0 ? (
                        <span className={styles.tagEmpty}>
                          No consultation types selected.
                        </span>
                      ) : (
                        selectedTypes.map((type, index) => (
                          <span key={index} className={styles.tag}>
                            {type.name}
                            <FaTrash
                              className={styles.tagRemove}
                              onClick={() => handleRemoveType(type.name)}
                            />
                          </span>
                        ))
                      )}
                    </div>
                    {showAddInput ? (
                      <div className={styles.addRow}>
                        <select
                          value=""
                          onChange={(e) => handleAddType(e.target.value)}
                          className={styles.selectInput}
                          autoFocus
                        >
                          <option value="" disabled>
                            Select consultation type
                          </option>
                          {superAdminConsultationtype.map((option) => (
                            <option
                              key={option.name}
                              value={option.name}
                              disabled={selectedTypes.some(
                                (t) => t.name === option.name
                              )}
                            >
                              {option.name}
                            </option>
                          ))}
                        </select>
                        <div>
                          <button
                            type="button"
                            className={styles.smallBtn}
                            onClick={() => setShowAddInput(false)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className={styles.addBtn}
                        title="Add consultation type"
                        onClick={() => setShowAddInput(true)}
                      >
                        +
                      </button>
                    )}
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className={styles.label}>
                      Services Offered
                    </Form.Label>
                    <div className={styles.tagList}>
                      {selectedServices.length === 0 ? (
                        <span className={styles.tagEmpty}>
                          No services selected.
                        </span>
                      ) : (
                        selectedServices.map((service, index) => (
                          <span key={index} className={styles.tag}>
                            {service}
                            <FaTrash
                              className={styles.tagRemove}
                              onClick={() => handleRemoveService(service)}
                            />
                          </span>
                        ))
                      )}
                    </div>
                    <select
                      value=""
                      onChange={(e) => handleAddService(e.target.value)}
                      className={styles.selectInput}
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
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className={styles.label}>
                      Price per service (₹)
                    </Form.Label>
                    {selectedTypes.length === 0 ? (
                      <p className={styles.tagEmpty}>
                        Select a consultation type to set its price.
                      </p>
                    ) : (
                      selectedTypes.map((type) => (
                        <div key={type.name} className={styles.priceRow}>
                          <span className={styles.priceName}>{type.name}</span>
                          <Form.Control
                            type="number"
                            min="0"
                            value={type.price ?? ""}
                            onChange={(e) =>
                              handleServicePriceChange(type.name, e.target.value)
                            }
                            placeholder="e.g. 500"
                          />
                          <FaPencilAlt
                            className={styles.pricePencil}
                            title={`Edit ${type.name} price`}
                          />
                        </div>
                      ))
                    )}
                  </Form.Group>
                </Col>
              </Row>
            </div>

            {canEditDocuments ? (
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>
                  <FaFileUpload /> Documents
                </h2>
                <Row>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className={styles.label}>
                        Diplomas Certificates
                      </Form.Label>
                      <input
                        type="file"
                        multiple
                        onChange={handleDiplomasCertificatesChange}
                        className={styles.fileInput}
                      />
                      <p className={styles.hint}>
                        Any file type (PDF, JPG, PNG...). Newly added certificates
                        are kept together with the existing ones.
                      </p>
                      <div className={styles.docGrid}>
                        {(diplomasCertificatesPreview || []).map(
                          (entry, index) => (
                            <div key={index} className={styles.docThumbWrap}>
                              {entry instanceof File ? (
                                isPreviewableImage(entry) ? (
                                  <img
                                    src={URL.createObjectURL(entry)}
                                    alt={`Diploma ${index + 1}`}
                                    className={styles.docThumb}
                                  />
                                ) : (
                                  <p className={styles.docFileName}>
                                    {entry.name}
                                  </p>
                                )
                              ) : (
                                <StoredDocumentThumb
                                  url={entry}
                                  alt={`Diploma ${index + 1}`}
                                  className={styles.docThumb}
                                  chipStyle={{ minHeight: "90px" }}
                                />
                              )}
                              <FaTrash
                                className={styles.docRemove}
                                onClick={() =>
                                  handleDeleteDiplomasCertificate(index)
                                }
                              />
                            </div>
                          )
                        )}
                      </div>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className={styles.label}>
                        Profile Picture
                      </Form.Label>
                      <input
                        type="file"
                        onChange={handleProfilePictureChange}
                        className={styles.fileInput}
                      />
                      <p className={styles.hint}>
                        Shown in the panel header and on the prescription sheet.
                        Must be an image (JPG, PNG or WEBP) - a PDF cannot be shown
                        as a picture.
                      </p>
                      {profilePicturePreview || profilePictureFileName ? (
                        <div className={styles.docGrid}>
                          <div className={styles.docThumbWrap}>
                            {profilePicturePreview ? (
                              <img
                                src={profilePicturePreview}
                                alt="Doctor profile picture"
                                className={styles.docThumb}
                                // A stored document can never be rendered - fall
                                // back to the file name card.
                                onError={() => {
                                  setProfilePicturePreview("");
                                  setProfilePictureFileName(
                                    displayFileNameFromUrl(
                                      doctor.profilePictureUrl,
                                      "Picture on file"
                                    )
                                  );
                                }}
                              />
                            ) : (
                              <p className={styles.docFileName}>
                                {profilePictureFileName}
                              </p>
                            )}
                            <FaTrash
                              className={styles.docRemove}
                              title="Remove picture"
                              onClick={handleDeleteProfilePicture}
                            />
                          </div>
                        </div>
                      ) : (
                        <p className={styles.hint}>No picture uploaded.</p>
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className={styles.label}>
                        Digital Signature
                      </Form.Label>
                      <input
                        type="file"
                        onChange={handleSignatureChange}
                        className={styles.fileInput}
                      />
                      <p className={styles.hint}>
                        Printed next to the name on prescriptions and on the
                        doctor contract. Must be an image (JPG, PNG or WEBP) - a PDF
                        cannot be printed.
                      </p>
                      <div className={styles.docGrid}>
                        {signaturePreviewUrl || signatureFileName ? (
                          <div className={styles.docThumbWrap}>
                            {signaturePreviewUrl ? (
                              <img
                                src={signaturePreviewUrl}
                                alt="Doctor signature"
                                className={styles.docThumb}
                                onError={() => {
                                  setSignaturePreviewUrl("");
                                  setSignatureFileName(
                                    displayFileNameFromUrl(
                                      doctor.doctorSignatureUrl,
                                      "Signature on file"
                                    )
                                  );
                                }}
                              />
                            ) : (
                              <p className={styles.docFileName}>
                                {signatureFileName}
                              </p>
                            )}
                            <FaTrash
                              className={styles.docRemove}
                              title="Remove signature"
                              onClick={handleDeleteSignature}
                            />
                          </div>
                        ) : (
                          <p className={styles.hint}>No signature uploaded.</p>
                        )}
                      </div>
                    </Form.Group>
                  </Col>
                </Row>
              </div>
            ) : (
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>
                  <FaFileUpload /> Documents
                </h2>
                <p className={styles.hint}>
                  Your photo, diploma certificates and digital signature are
                  managed by the clinic admin - ask the super admin to update
                  them.
                </p>
              </div>
            )}
          </div>

          <div className={styles.rail}>
            <div className={`${styles.card} ${styles.railCard}`}>
              <h2 className={styles.cardTitle}>
                <FaUserMd /> Prescription stamp
              </h2>
              <img
                src={stampPreview}
                alt="Prescription stamp preview"
                className={styles.stampImg}
              />
              <p className={styles.stampCaption}>
                Live preview - name, expertise and registration number exactly as
                they print. The registration number is compulsory: while it is
                blank the stamp shows &quot;Reg. No: Not provided&quot;.
              </p>
            </div>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>
                <FaClock /> Good to know
              </h2>
              <ul className={styles.tipList}>
                {canEditDocuments ? (
                  <li>
                    Changes are applied to the doctor profile immediately.
                  </li>
                ) : (
                  <li>
                    Changes are sent to the super admin and applied once approved.
                  </li>
                )}
                <li>At least one work day and one language are required.</li>
                <li>Blank education / language rows are dropped when you save.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className={styles.actionBar}>
          <span className={styles.dirtyNote}>
            {uploadStatus ||
              (isDirty ? "You have unsaved changes." : "No changes yet.")}
          </span>
          <button
            type="button"
            className={styles.ghostBtn}
            onClick={handleCancel}
            disabled={saving}
          >
            {cancelLabel}
          </button>
          <button type="submit" className={styles.primaryBtn} disabled={saving}>
            {saving ? "Saving..." : saveLabel}
          </button>
        </div>
      </Form>

    </div>
  );


};

export default DoctorProfileForm;
