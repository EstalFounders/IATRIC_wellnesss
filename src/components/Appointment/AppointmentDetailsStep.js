import React, { useState } from "react";
import {
  Form,
  Row,
  Col,
  ToggleButtonGroup,
  ToggleButton,
  Alert,
} from "react-bootstrap";
import { useLanguage } from "../../i18n/LanguageContext";
import { richText } from "../../i18n/richText";
import { ConsultationButton } from "../Common/commonUi";
import pageStyles from "./css/appointmentPage.module.css";
import modalStyles from "./css/AppointmentModel.module.css";
import {
  CHOOSE_TIME,
  IS_NOW,
  price_symbol,
  superAdminConsultationtype,
  color_schema,
} from "../../constant";
import { useGlobalData } from "../../customUtils/useGlobalData";
import { formatTime } from "../helper";
import { doctorDisplayName } from "../../utils/doctorName";
import { matchesServiceOffered } from "../filterbar/filterDoctors";

// Value the parent's handleDoctorChoiceChange expects for "no specific doctor".
const DOCTOR_CHOICE_ANY = "any";

// MUI-free severity -> react-bootstrap Alert variant.
const ALERT_VARIANTS = {
  success: "success",
  error: "danger",
  warning: "warning",
  info: "info",
};

const CONSULTATION_TYPES = superAdminConsultationtype.map((type) =>
  String(type.name || "").trim().toLowerCase()
);

const normalizeValue = (value) => String(value || "").trim().toLowerCase();

const toLocalDateString = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/**
 * Step 3 of the booking sequence: speciality, doctor, date and time.
 *
 * The fields are the ones the old single-screen form rendered (same controls,
 * same handlers, same `appointmentState`/`setter` contract with
 * AppointmentPage) - they are only re-hosted inside the modal so the patient
 * reaches them after the mobile number has been verified.
 *
 * `onBack` returns to the contact step, `onProceed` runs the parent's details
 * guard and then creates the appointment / opens the payment step.
 */
const AppointmentDetailsStep = ({
  appointmentState,
  setter,
  doctors,
  handleDoctorChoiceChange,
  handleDoctorSelection,
  handleTimeSelection,
  handleSlotSelection,
  handleConsultationChange,
  handleCloseSnackBar,
  onBack,
  onProceed,
}) => {
  // The chosen speciality itself lives in the parent (it is a required field, so
  // the booking guard in AppointmentPage.js has to see it); this flag only paints
  // the dropdown red after an attempt to continue without one.
  const [specialityError, setSpecialityError] = useState(false);
  const { t } = useLanguage();
  // Single source of truth for the speciality list (globalData slice -> SUB items).
  const { specialityNames } = useGlobalData();
  const specialityFilter = appointmentState.speciality || "";

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
    // The same name is sent as `serviceType` and stored on the appointment, so the
    // post-payment summary can show the speciality (see /api/payment/status).
    setter.setServiceType ? setter.setServiceType(e.target.value) : null;
    setSpecialityError(false);
    // Reuse the parent's handler to fall back to "Any Doctor".
    handleDoctorChoiceChange({ target: { value: DOCTOR_CHOICE_ANY } });
  };

  // A speciality is mandatory, so the attempt is stopped here (the parent's own
  // guard stays as a second line of defence) and the dropdown is marked invalid.
  const handleProceedClick = () => {
    if (appointmentState.isLoading) return;
    if (!specialityFilter.trim()) {
      setSpecialityError(true);
      return;
    }
    setSpecialityError(false);
    onProceed();
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
    ? scopedDoctors.filter((doctor) =>
        matchesServiceOffered(doctor, specialityFilter)
      )
    : scopedDoctors;

  const futureSlots = (appointmentState.locallyCreatedSlots || []).filter(
    (slot) => new Date(slot.startTime) > new Date()
  );
  const slotValue = appointmentState.selectedSlot?._id || "";

  return (
    <Form
      className={`appointment-form ${pageStyles.form}`}
      onSubmit={(e) => {
        e.preventDefault();
        handleProceedClick();
      }}
    >
      {/* Verified contact details - read-only here, editable via Back. */}
      <div className={pageStyles.contactStrip}>
        <div className={pageStyles.contactStripText}>
          <span className={pageStyles.contactStripName}>
            {appointmentState.name}
          </span>
          <span className={pageStyles.contactStripPhone}>
            +91 {appointmentState.mobNo}
          </span>
        </div>
        <button
          type="button"
          className={pageStyles.contactStripEdit}
          onClick={onBack}
        >
          {t("af.edit")}
        </button>
      </div>

      <Row>
        {/* Consultation, timing and doctor. The old left column (email + reason
            for consultation) is gone, so the fields use the modal's full width. */}
        <Col xs={12}>
          {/* Consultation Type — subtle outline tiles */}
          <Form.Group className="mb-2">
            <Form.Label className={`d-block ${pageStyles.label}`}>
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
                  className={`flex-fill ${pageStyles.seg} ${
                    appointmentState.consultationType === option.name
                      ? pageStyles.segOn
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
            <Form.Label className={`d-block ${pageStyles.label}`}>
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
                className={`flex-fill ${pageStyles.seg} ${
                  appointmentState.timeSelection === IS_NOW
                    ? pageStyles.segOn
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
                className={`flex-fill ${pageStyles.seg} ${
                  appointmentState.timeSelection === CHOOSE_TIME
                    ? pageStyles.segOn
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
                  className={`mb-2 mb-sm-0 ${pageStyles.field} ${pageStyles.slotPicker}`}
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
                <Col
                  xs={12}
                  sm={6}
                  className={`${pageStyles.field} ${pageStyles.slotPicker}`}
                >
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
                    <small className="text-muted" style={{ fontSize: "1rem" }}>
                      {t("af.noSlots")}
                    </small>
                  )}
                </Col>
              </Row>
            )}
          </Form.Group>

          {/* Speciality & Doctor — 2-column grid, compact dropdowns */}
          <Row className="mb-2">
            <Col md={6} className={`mb-2 mb-md-0 ${pageStyles.field}`}>
              <Form.Group controlId="af-speciality">
                <Form.Label className={pageStyles.label}>
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
            <Col md={6} className={pageStyles.field}>
              <Form.Group controlId="af-doctor">
                <Form.Label className={pageStyles.label}>
                  {t("af.doctor")}
                </Form.Label>
                <Form.Control
                  as="select"
                  size="sm"
                  value={appointmentState.selectedDoctorId || DOCTOR_CHOICE_ANY}
                  onChange={handleDoctorChange}
                >
                  <option value={DOCTOR_CHOICE_ANY}>{t("af.anyDoctor")}</option>
                  {visibleDoctors.map((doctor) => (
                    <option key={doctor._id} value={doctor._id}>
                      {doctorDisplayName(doctor.name)}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>
          </Row>

          {/* Kept outside the two columns and full width: a long line inside a
              column used to widen the whole form. */}
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
      <p
        className="text-center mb-2"
        style={{ color: "#b45309", fontSize: "0.9rem" }}
      >
        {richText(t("af.emergency"))}
      </p>

      {/* Agreement — directly above the actions */}
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

      <div className={modalStyles.stepActions}>
        <ConsultationButton variant="outline" onClick={onBack}>
          {t("af.back")}
        </ConsultationButton>
        {/* ConsultationButton has no `disabled` prop, so the in-flight guard
            lives in `handleProceedClick` / the parent guard. */}
        <ConsultationButton onClick={handleProceedClick}>
          {appointmentState.isLoading ? t("af.loading") : t("af.proceedToPay")}
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
  );
};

export default AppointmentDetailsStep;




