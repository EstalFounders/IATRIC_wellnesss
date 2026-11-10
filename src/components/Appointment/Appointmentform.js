import React, { useState } from "react";
import {
  Card,
  Form,
  Row,
  Col,
  InputGroup,
  ToggleButtonGroup,
  ToggleButton,
  Alert,
} from "react-bootstrap";
import { useLanguage } from "../../i18n/LanguageContext";
import { richText } from "../../i18n/richText";
import { ConsultationButton } from "../Common/commonUi";
import styles from "./css/appointmentPage.module.css";
import { CHOOSE_TIME, IS_NOW, price_symbol, superAdminConsultationtype, color_schema } from "../../constant";
import { useGlobalData } from "../../customUtils/useGlobalData";
import { formatTime } from "../helper";
import { doctorDisplayName } from "../../utils/doctorName";
import { matchesServiceOffered } from "../filterbar/filterDoctors";

// Common complaints offered as quick-select pills on the form.
const COMMON_DISEASES = [
  "Fever",
  "Cough & Cold",
  "Headache",
  "Stomach Ache / Digestion Issue",
  "Skin Problem / Rashes",
  "Body Pain / Weakness",
];

// Value used for the "Other" pill (reveals the free-text description box).
const SYMPTOM_OTHER = "__other__";

// Value the parent's handleDoctorChoiceChange expects for "no specific doctor".
const DOCTOR_CHOICE_ANY = "any";

// MUI-free severity -> react-bootstrap Alert variant.
const ALERT_VARIANTS = {
  success: "success",
  error: "danger",
  warning: "warning",
  info: "info",
};

// --- Speciality <-> doctor matching ------------------------------------------
// Doctor docs carry no `speciality` field: what a doctor practises is stored in
// `serviceOffered`, and only that list decides whether the doctor is listed under
// the selected speciality (`matchesServiceOffered`; a free-text `expertise` alone
// must not put a doctor under a speciality).
const CONSULTATION_TYPES = superAdminConsultationtype.map((type) =>
  String(type.name || "").trim().toLowerCase()
);

const normalizeValue = (value) => String(value || "").trim().toLowerCase();

const toLocalDateString = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const AppointmentForm = ({
  appointmentState,
  setter,
  doctors,
  handleDoctorChoiceChange,
  handleDoctorSelection,
  handleCloseSnackBar,
  sendWhatsAppConfirmation,
  handleTimeSelection,
  handleSlotSelection,
  handleConsultationChange,
}) => {
  const [selectedSymptom, setSelectedSymptom] = useState("");
  // The chosen speciality itself lives in the parent (it is a required field, so
  // the booking guard in AppointmentPage.js has to see it); this flag only paints
  // the dropdown red after an attempt to book without one.
  const [specialityError, setSpecialityError] = useState(false);
  const { t } = useLanguage();
  // Single source of truth for the speciality list (globalData slice -> SUB items).
  const { specialityNames } = useGlobalData();
  const specialityFilter = appointmentState.speciality || "";
  const handleDescriptionChange = (e) => setter.setSymptoms(e.target.value);

  // ToggleButtonGroup hands us the value directly (not an event).
  const handleSymptomSelection = (value) => {
    setSelectedSymptom(value);
    setter.setSymptoms(value === SYMPTOM_OTHER ? "" : value);
  };

  const handleDateChange = (e) => {
    const [year, month, day] = e.target.value.split("-");
    // Noon UTC of the picked day - see `todayAtNoonUTC` in AppointmentPage.js. A
    // local-midnight Date is the previous UTC day for IST users, and fetchSlot
    // windows its query on the UTC day, so the day's slots came back empty.
    setter.setSelectedDate(
      new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), 12))
    );
  };

  // Reuse the parent's event-based handlers with the toggle value.
  const handleConsultationTypeChange = (value) =>
    handleConsultationChange({ target: { value } });

  const handleWhenChange = (value) =>
    handleTimeSelection({ target: { value } });

  const handleSpecialityChange = (e) => {
    setter.setSpeciality ? setter.setSpeciality(e.target.value) : null;
    setSpecialityError(false);
    // Reuse the parent's handler to fall back to "Any Doctor".
    handleDoctorChoiceChange({ target: { value: DOCTOR_CHOICE_ANY } });
  };

  // A speciality is mandatory, so the attempt is stopped here (the parent's own
  // guard stays as a second line of defence) and the dropdown is marked invalid.
  const handleBookClick = () => {
    if (appointmentState.isLoading) return;
    if (!specialityFilter.trim()) {
      setSpecialityError(true);
      return;
    }
    setSpecialityError(false);
    sendWhatsAppConfirmation();
  };

  const handleDoctorChange = (e) => {
    if (e.target.value === DOCTOR_CHOICE_ANY) {
      handleDoctorChoiceChange(e);
    } else {
      handleDoctorSelection(e);
    }
  };

  const today = toLocalDateString(new Date());
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 5);
  // The weekly timetable can hand over a day beyond that horizon; never leave
  // the preselected day outside the picker's range.
  if (
    appointmentState.selectedDate instanceof Date &&
    appointmentState.selectedDate > maxDate
  ) {
    maxDate.setTime(appointmentState.selectedDate.getTime());
  }
  const maxDateStr = toLocalDateString(maxDate);

  const selectedDateStr =
    appointmentState.selectedDate instanceof Date
      ? toLocalDateString(appointmentState.selectedDate)
      : today;

  const consultationOptions = appointmentState.consultationOptions || [];

  // Doctor list supplied by the parent (already fetched from /api/addDoctor).
  const doctorOptions = Array.isArray(doctors) ? doctors : [];
  const scopedDoctors = appointmentState.filteredDoctors?.length
    ? appointmentState.filteredDoctors
    : doctorOptions;

  // Speciality list: only the canonical specialities (globalData SUB items, with
  // the static fallback for first paint), minus consultation types (Audio/Video).
  // Doctor records are deliberately not merged in - their free-text `expertise`
  // and service names would flood the list with near-duplicates.
  const specialityOptions = [...new Set(specialityNames)].filter(
    (name) => name && !CONSULTATION_TYPES.includes(normalizeValue(name))
  );

  // Doctor list narrowed by the selected speciality: a doctor is listed only when
  // the speciality appears in their `serviceOffered` (see matchesServiceOffered).
  const visibleDoctors = specialityFilter
    ? scopedDoctors.filter((doctor) => matchesServiceOffered(doctor, specialityFilter))
    : scopedDoctors;

  const futureSlots = (appointmentState.locallyCreatedSlots || []).filter(
    (slot) => new Date(slot.startTime) > new Date()
  );
  const slotValue = appointmentState.selectedSlot?._id || "";

  return (
    <Card
      className={`border-0 mx-auto ${styles.card}`}
      style={{
        borderRadius: 14,
        boxShadow: "0 6px 24px rgba(15, 23, 42, 0.08)",
      }}
    >
      <Card.Body className="p-3 p-md-4" style={{ fontSize: "1rem" }}>
        <h4
          className="text-center mb-3"
          style={{ fontWeight: 600, color: "#0f172a", fontSize: "1.6rem" }}
        >
          {t("af.title")}
        </h4>

        <Form
          className={`appointment-form ${styles.form}`}
          onSubmit={(e) => e.preventDefault()}
        >
          {/* Two columns keep the whole form within a single screen */}
          <Row>
            {/* LEFT — patient details + reason */}
            <Col xs={12} md={6} className="mb-2 mb-md-0">
              <Form.Group
                className={`mb-2 ${styles.field}`}
                controlId="af-name"
              >
                <Form.Label className={styles.label}>{t("af.name")}</Form.Label>
                <Form.Control
                  size="sm"
                  type="text"
                  placeholder={t("af.name")}
                  value={appointmentState.name}
                  onChange={(e) => setter.setName(e.target.value)}
                />
              </Form.Group>

              <Form.Group
                className={`mb-2 ${styles.field}`}
                controlId="af-mobile"
              >
                <Form.Label className={styles.label}>{t("af.mobile")}</Form.Label>
                <InputGroup size="sm">
                  {/* BS4 only applies its -sm metrics to a prefix wrapped in
                      .input-group-prepend, otherwise +91 stays taller than the input. */}
                  <InputGroup.Prepend>
                    <InputGroup.Text
                      style={{
                        fontSize: "1rem",
                        fontWeight: 600,
                        color: color_schema.green,
                        background: "#f7f8ee",
                        borderColor: "#e2e8f0",
                      }}
                    >
                      +91
                    </InputGroup.Text>
                  </InputGroup.Prepend>
                  <Form.Control
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder={t("af.mobile")}
                    value={appointmentState.mobNo}
                    onChange={(e) => setter.setMobNo(e.target.value)}
                  />
                </InputGroup>
              </Form.Group>

              {/* Email — optional, no validation required to book */}
              <Form.Group
                className={`mb-2 ${styles.field}`}
                controlId="af-email"
              >
                <Form.Label className={styles.label}>{t("af.email")}</Form.Label>
                <Form.Control
                  size="sm"
                  type="email"
                  placeholder={t("af.emailPlaceholder")}
                  value={appointmentState.email}
                  onChange={(e) => setter.setEmail(e.target.value)}
                />
              </Form.Group>

              {/* Reason for Consultation — minimalist outline pills */}
              <Form.Group className="mb-2">
                <Form.Label className={`d-block ${styles.label}`}>
                  {t("af.reason")}
                </Form.Label>
                {/* Scrollable option list — keeps the form compact */}
                <div className={styles.optionArea}>
                  <ToggleButtonGroup
                    type="radio"
                    name="symptom"
                    value={selectedSymptom}
                    onChange={handleSymptomSelection}
                    className={styles.pillStack}
                  >
                    {COMMON_DISEASES.map((disease) => (
                      <ToggleButton
                        key={disease}
                        id={`symptom-${disease}`}
                        value={disease}
                        size="sm"
                        variant="outline-secondary"
                        className={`${styles.pill} ${
                          selectedSymptom === disease ? styles.pillOn : ""
                        }`}
                      >
                        {disease}
                      </ToggleButton>
                    ))}
                    <ToggleButton
                      id="symptom-other"
                      value={SYMPTOM_OTHER}
                      size="sm"
                      variant="outline-secondary"
                      className={`${styles.pill} ${
                        selectedSymptom === SYMPTOM_OTHER ? styles.pillOn : ""
                      }`}
                    >
                      {t("af.other")}
                    </ToggleButton>
                  </ToggleButtonGroup>
                </div>

                {selectedSymptom === SYMPTOM_OTHER && (
                  <Form.Control
                    as="textarea"
                    rows={2}
                    size="sm"
                    className="mt-2"
                    placeholder={t("af.symptoms")}
                    style={{ fontSize: "1rem" }}
                    value={appointmentState.symptoms}
                    onChange={handleDescriptionChange}
                  />
                )}
              </Form.Group>
            </Col>

            {/* RIGHT — consultation, timing, doctor */}
            <Col xs={12} md={6}>
              {/* Consultation Type — subtle outline tiles */}
              <Form.Group className="mb-2">
                <Form.Label className={`d-block ${styles.label}`}>
                  {t("af.consultType")}
                </Form.Label>
                <ToggleButtonGroup
                  type="radio"
                  name="consultationType"
                  value={appointmentState.consultationType}
                  onChange={handleConsultationTypeChange}
                  className="w-100"
                >
                  {consultationOptions.map((option) => (
                    <ToggleButton
                      key={option.name}
                      id={`consultation-${option.name}`}
                      value={option.name}
                      size="sm"
                      variant="outline-secondary"
                      className={`flex-fill ${styles.seg} ${
                        appointmentState.consultationType === option.name
                          ? styles.segOn
                          : ""
                      }`}
                    >
                      {option.name}
                      {option.fee === 0 || option.fee === "0"
                        ? " · Free"
                        : option.fee
                        ? ` · ${price_symbol}${option.fee}`
                        : ""}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Form.Group>

              {/* Timing — subtle outline tiles, date/slot underneath */}
              <Form.Group className="mb-2">
                <Form.Label className={`d-block ${styles.label}`}>
                  {t("af.when")}
                </Form.Label>
                <ToggleButtonGroup
                  type="radio"
                  name="when"
                  value={appointmentState.timeSelection}
                  onChange={handleWhenChange}
                  className="w-100"
                >
                  <ToggleButton
                    id="when-now"
                    value={IS_NOW}
                    size="sm"
                    variant="outline-secondary"
                    className={`flex-fill ${styles.seg} ${
                      appointmentState.timeSelection === IS_NOW
                        ? styles.segOn
                        : ""
                    }`}
                  >
                    {t("af.now")}
                  </ToggleButton>
                  <ToggleButton
                    id="when-later"
                    value={CHOOSE_TIME}
                    size="sm"
                    variant="outline-secondary"
                    className={`flex-fill ${styles.seg} ${
                      appointmentState.timeSelection === CHOOSE_TIME
                        ? styles.segOn
                        : ""
                    }`}
                  >
                    {t("af.chooseTime")}
                  </ToggleButton>
                </ToggleButtonGroup>

                {appointmentState.timeSelection === CHOOSE_TIME && (
                  <Row className="mt-2">
                    <Col
                      xs={12}
                      sm={6}
                      className={`mb-2 mb-sm-0 ${styles.field} ${styles.slotPicker}`}
                    >
                      <Form.Control
                        size="sm"
                        type="date"
                        min={today}
                        max={maxDateStr}
                        value={selectedDateStr}
                        onChange={handleDateChange}
                      />
                    </Col>
                    <Col xs={12} sm={6} className={`${styles.field} ${styles.slotPicker}`}>
                      {futureSlots.length > 0 ? (
                        <Form.Control
                          as="select"
                          size="sm"
                          name="slot"
                          value={slotValue}
                          onChange={(e) => {
                            const slot = futureSlots.find(
                              (s) => s._id === e.target.value
                            );
                            if (slot) handleSlotSelection(slot);
                          }}
                        >
                          <option value="" disabled>
                            {t("af.selectSlot")}
                          </option>
                          {futureSlots.map((slot) => (
                            <option key={slot._id} value={slot._id}>
                              {formatTime(slot.startTime)} –{" "}
                              {formatTime(slot.endTime)}
                            </option>
                          ))}
                        </Form.Control>
                      ) : (
                        <small
                          className="text-muted"
                          style={{ fontSize: "1rem" }}
                        >
                          {t("af.noSlots")}
                        </small>
                      )}
                    </Col>
                  </Row>
                )}
              </Form.Group>

              {/* Speciality & Doctor — 2-column grid, compact dropdowns */}
              <Row className="mb-2">
                <Col md={6} className={`mb-2 mb-md-0 ${styles.field}`}>
                  <Form.Group controlId="af-speciality">
                    <Form.Label className={styles.label}>
                      {t("af.speciality")}
                    </Form.Label>
                    <Form.Control
                      as="select"
                      size="sm"
                      required
                      aria-required="true"
                      isInvalid={specialityError}
                      value={specialityFilter}
                      onChange={handleSpecialityChange}
                    >
                      <option value="">{t("af.selectSpeciality")}</option>
                      {specialityOptions.map((speciality) => (
                        <option key={speciality} value={speciality}>
                          {speciality}
                        </option>
                      ))}
                    </Form.Control>
                    {/* `isInvalid` already flips the Bootstrap sibling rule
                        (`.form-control.is-invalid ~ .invalid-feedback`), but that
                        reveal depends on the combinator alone. `d-block` states the
                        intent explicitly and wins even if a wrapper or another
                        stylesheet ever changes the structure. */}
                    <Form.Control.Feedback
                      type="invalid"
                      className={specialityError ? "d-block" : undefined}
                    >
                      {t("af.selectSpecialityError")}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6} className={styles.field}>
                  <Form.Group controlId="af-doctor">
                    <Form.Label className={styles.label}>
                      {t("af.doctor")}
                    </Form.Label>
                    <Form.Control
                      as="select"
                      size="sm"
                      value={
                        appointmentState.selectedDoctorId || DOCTOR_CHOICE_ANY
                      }
                      onChange={handleDoctorChange}
                    >
                      <option value={DOCTOR_CHOICE_ANY}>
                        {t("af.anyDoctor")}
                      </option>
                      {visibleDoctors.map((doctor) => (
                        <option key={doctor._id} value={doctor._id}>
                          {doctorDisplayName(doctor.name)}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </Col>
              </Row>

              {/* Kept outside the two columns and full width: the card is a
                  shrink-to-fit flex item, so a long line inside a column used to
                  widen the whole form. */}
              {specialityFilter && visibleDoctors.length === 0 ? (
                <p
                  className="mb-2 text-center"
                  style={{
                    color: "#b45309",
                    fontSize: "0.85rem",
                    overflowWrap: "anywhere",
                  }}
                >
                  {t("af.noDoctorForSpeciality")}
                </p>
              ) : null}

            </Col>
          </Row>

          {/* Emergency disclaimer - shown with the booking CTA */}
          <p className="text-center mb-2" style={{ color: "#b45309", fontSize: "0.9rem" }}>
            {richText(t("af.emergency"))}
          </p>

          {/* Agreement — directly above the submit button */}
          <Form.Group className="mb-2 text-center">
            <Form.Check
              type="checkbox"
              id="af-terms"
              checked={!!appointmentState.agreedToTerms}
              onChange={(e) =>
                setter.setAgreedToTerms
                  ? setter.setAgreedToTerms(e.target.checked)
                  : null
              }
              style={{ fontSize: "1rem", paddingLeft: 0 }}
              label={
                <span style={{ color: "#475569" }}>
                  {t("af.terms")}{" "}
                  <a
                    href="/terms-of-service"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t("af.viewTerms")}
                    style={{ color: color_schema.green, fontWeight: 600 }}
                  >
                    ↗
                  </a>
                </span>
              }
            />
          </Form.Group>

          {/* Action */}
          <div className={styles.ctaWrap}>
            <ConsultationButton
              // ConsultationButton has no `disabled` prop, so keep the
              // double-submit guard while the booking request is in flight.
              onClick={handleBookClick}
            >
              {appointmentState.isLoading
                ? t("af.loading")
                : t("af.bookConsultation")}
            </ConsultationButton>
          </div>

          {appointmentState.openSnackBar && (
            <Alert
              variant={ALERT_VARIANTS[appointmentState.severity] || "info"}
              dismissible
              onClose={handleCloseSnackBar}
              className="mt-2 mb-0"
              style={{ fontSize: "1rem" }}
            >
              {appointmentState.snackBarMessage}
            </Alert>
          )}
        </Form>
      </Card.Body>
    </Card>
  );
};

export default AppointmentForm;
