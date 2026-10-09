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
import LanguageInput from "../LanguageInput";
import { formatWorkDays, parseWorkDays } from "../../../customUtils/workDays";
import { parseEducationTraining } from "../../../customUtils/educationTraining";
import { doctorDisplayName } from "../../../utils/doctorName";
import { parseLanguages } from "../../../customUtils/languages";
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
  const [profilePicturePreview, setProfilePicturePreview] = useState(
    doctor.profilePictureUrl
  );
  const [diplomasCertificatesPreview, setDiplomasCertificatesPreview] =
    useState(doctor.diplomasCertificatesUrls);

  const [slotStartTime, setSlotStartTime] = useState(
    convertDateIntoTime(editedDoctor.slotStartTime)
  );
  const [slotEndTime, setSlotEndTime] = useState(
    convertDateIntoTime(editedDoctor.slotEndTime)
  );

  const [selectedTypes, setSelectedTypes] = useState(
    Array.isArray(editedDoctor.consultationType)
      ? editedDoctor.consultationType
      : []
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

  // Draft rows for the repeatable language inputs.
  const [languageItems, setLanguageItems] = useState(
    parseLanguages(doctor.language)
  );
  const [languageError, setLanguageError] = useState("");

  // The registration number is compulsory, so it gets its own inline error - the
  // same pattern the work-day chips and the language rows use.
  const [regNoError, setRegNoError] = useState("");

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
      if (name === "doctorRegistrationNo" && value.trim()) setRegNoError("");
      setEditedDoctor({ ...editedDoctor, [name]: value });
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditedDoctor({
        ...editedDoctor,
        profilePictureUrl: file,
      });
      setProfilePicturePreview(URL.createObjectURL(file));
    }
  };

  const handleDiplomasCertificatesChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      const urls = Array.from(files).map((file) => file);
      setEditedDoctor({ ...editedDoctor, diplomasCertificatesUrls: urls });
      setDiplomasCertificatesPreview(urls);
    }
  };

  const handleDeleteProfilePicture = () => {
    setEditedDoctor({ ...editedDoctor, profilePictureUrl: "" });
    setProfilePicturePreview(null);
  };

  const handleDeleteDiplomasCertificate = (index) => {
    const updatedUrls = [...(editedDoctor.diplomasCertificatesUrls || [])];
    updatedUrls.splice(index, 1);
    setEditedDoctor({ ...editedDoctor, diplomasCertificatesUrls: updatedUrls });
    setDiplomasCertificatesPreview(updatedUrls);
  };

  const handleRemoveType = (type) => {
    const updatedTypes = selectedTypes.filter((item) => item !== type);
    setSelectedTypes(updatedTypes);
    setEditedDoctor({ ...editedDoctor, consultationType: updatedTypes });
  };

  // Consultation type - picked from the fixed list (Audio, Video, Home visit,
  // Clinic)
  const handleAddType = (value) => {
    const trimmed = String(value || "").trim();
    if (!trimmed) return;
    // Duplicate check (case-insensitive)
    if (selectedTypes.some((t) => t.toLowerCase() === trimmed.toLowerCase()))
      return;
    const updatedTypes = [...selectedTypes, trimmed];
    setSelectedTypes(updatedTypes);
    setEditedDoctor({ ...editedDoctor, consultationType: updatedTypes });
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
    // Compulsory - the native `required` on the control catches an empty input,
    // this also catches a whitespace-only one.
    if (!String(editedDoctor.doctorRegistrationNo || "").trim()) {
      setRegNoError("Please enter the registration number");
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
                      value={editedDoctor.location || ""}
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
                      isInvalid={Boolean(regNoError)}
                      required
                    />
                    {regNoError ? (
                      <div
                        style={{
                          color: "#c62828",
                          fontSize: "0.8rem",
                          marginTop: 6,
                        }}
                      >
                        {regNoError}
                      </div>
                    ) : (
                      <p className={styles.hint}>
                        Compulsory - printed as the third line of the prescription
                        stamp.
                      </p>
                    )}
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
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="workExperience"
                      value={editedDoctor.workExperience || ""}
                      onChange={handleChange}
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
                      min="09:00"
                      max="21:00"
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
                      min="09:00"
                      max="21:00"
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
                            {type}
                            <FaTrash
                              className={styles.tagRemove}
                              onClick={() => handleRemoveType(type)}
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
                              disabled={selectedTypes.includes(option.name)}
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
                      Consultation Price
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="price"
                      value={editedDoctor.price || ""}
                      onChange={handleChange}
                    />
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
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className={styles.label}>
                        Diplomas Certificates
                      </Form.Label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleDiplomasCertificatesChange}
                        className={styles.fileInput}
                      />
                      <div className={styles.docGrid}>
                        {(diplomasCertificatesPreview || []).map(
                          (url, index) => (
                            <div key={index} className={styles.docThumbWrap}>
                              <img
                                src={url}
                                alt={`Diploma ${index + 1}`}
                                className={styles.docThumb}
                              />
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
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className={styles.label}>
                        Profile Picture
                      </Form.Label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePictureChange}
                        className={styles.fileInput}
                      />
                      <p className={styles.hint}>
                        Shown in the panel header and on the prescription sheet.
                      </p>
                      {profilePicturePreview ? (
                        <button
                          type="button"
                          className={styles.smallBtn}
                          onClick={handleDeleteProfilePicture}
                        >
                          Remove picture
                        </button>
                      ) : null}
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
                  Your photo and diploma certificates are managed by the clinic
                  admin - ask the super admin to update them.
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
