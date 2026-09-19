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
import { ConsultationButton } from "../Common/commonUi";
import styles from "./css/appointmentPage.module.css";
import {
  CHOOSE_TIME,
  IS_NOW,
  price_symbol,
  speciality as SPECIALTIES,
} from "../../constant";
import { formatTime } from "../helper";

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
  const [specialityFilter, setSpecialityFilter] = useState("");
  const { t } = useLanguage();

  const handleDescriptionChange = (e) => setter.setSymptoms(e.target.value);

  // ToggleButtonGroup hands us the value directly (not an event).
  const handleSymptomSelection = (value) => {
    setSelectedSymptom(value);
    setter.setSymptoms(value === SYMPTOM_OTHER ? "" : value);
  };

  const handleDateChange = (e) => {
    const [year, month, day] = e.target.value.split("-");
    setter.setSelectedDate(new Date(year, month - 1, day));
  };

  // Reuse the parent's event-based handlers with the toggle value.
  const handleConsultationTypeChange = (value) =>
    handleConsultationChange({ target: { value } });

  const handleWhenChange = (value) =>
    handleTimeSelection({ target: { value } });

  const handleSpecialityChange = (e) => {
    setSpecialityFilter(e.target.value);
    // Reuse the parent's handler to fall back to "Any Doctor".
    handleDoctorChoiceChange({ target: { value: DOCTOR_CHOICE_ANY } });
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

  // SPECIALTIES (src/constant.js) drives the dropdown. Any extra speciality found
  // on the doctor records is appended so filtering can never hide a bookable doctor.
  const specialityOptions = [
    ...new Set([
      ...SPECIALTIES,
      ...doctorOptions.map((doctor) => doctor.speciality).filter(Boolean),
    ]),
  ];

  // Doctor list narrowed by the selected speciality.
  const visibleDoctors = specialityFilter
    ? scopedDoctors.filter((doctor) => doctor.speciality === specialityFilter)
    : scopedDoctors;

  const futureSlots = (appointmentState.locallyCreatedSlots || []).filter(
    (slot) => new Date(slot.startTime) > new Date()
  );
  const slotValue = appointmentState.selectedSlot?._id || "";

  return (
    <Card
      className="border-0 mx-auto"
      style={{
        maxWidth: 780,
        width: "100%",
        borderRadius: 14,
        boxShadow: "0 6px 24px rgba(15, 23, 42, 0.08)",
      }}
    >
      <Card.Body className="p-2" style={{ fontSize: "0.9375rem" }}>
        <h4
          className="text-center mb-2"
          style={{ fontWeight: 600, color: "#0f172a" }}
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
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        color: "#3b5f1d",
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
                    style={{ fontSize: "0.9375rem" }}
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
                      {option.fee ? ` · ${price_symbol}${option.fee}` : ""}
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
                      className={`mb-2 mb-sm-0 ${styles.field}`}
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
                    <Col xs={12} sm={6} className={styles.field}>
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
                          style={{ fontSize: "0.875rem" }}
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
                      value={specialityFilter}
                      onChange={handleSpecialityChange}
                    >
                      <option value="">{t("af.allSpecialities")}</option>
                      {specialityOptions.map((speciality) => (
                        <option key={speciality} value={speciality}>
                          {speciality}
                        </option>
                      ))}
                    </Form.Control>
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
                          {doctor.name}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </Col>
              </Row>

            </Col>
          </Row>

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
              style={{ fontSize: "0.875rem", paddingLeft: 0 }}
              label={
                <span style={{ color: "#475569" }}>
                  {t("af.terms")}{" "}
                  <a
                    href="/terms-of-service"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t("af.viewTerms")}
                    style={{ color: "#3b5f1d", fontWeight: 600 }}
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
              onClick={() =>
                appointmentState.isLoading ? null : sendWhatsAppConfirmation()
              }
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
              style={{ fontSize: "0.875rem" }}
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
