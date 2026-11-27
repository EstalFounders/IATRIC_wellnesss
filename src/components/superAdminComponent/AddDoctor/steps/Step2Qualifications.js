// steps/Step2Qualifications.js
//
// Step 2 of 6 - the professional story: speciality, registration number, degrees,
// work experience, languages and the overview patients read on the profile.
// Education is optional; the speciality, experience, languages and the overview
// are not (the Doctor schema requires them).
//
// "Speciality" is still the free-text `expertise` field on the schema: a doctor
// can pick several specialities (each becomes a removable chip) or type one that
// is not listed, and they are stored comma-joined in the same String. Nothing
// about the submitted payload changes.

import React, { useMemo, useState } from "react";
import { Col, Row } from "react-bootstrap";
import { FaStethoscope } from "react-icons/fa";
import styles from "../AddDoctorForm.module.css";
import StepHeader from "../components/StepHeader";
import Field, { Select, TextArea, TextInput } from "../components/Field";
import EducationTrainingInput from "../../../Common/EducationTrainingInput";
import WorkExperienceInput from "../../../Common/WorkExperienceInput";
import LanguageInput from "../../../Common/LanguageInput";
import {
  DEGREE_SUGGESTIONS,
  LANGUAGE_OPTIONS,
  LANGUAGE_SUGGESTIONS,
  buildSpecialityGroups,
  formatSpecialities,
  hasSpeciality,
  parseSpecialities,
} from "../../../../customUtils/doctorSuggestions";

const Step2Qualifications = ({
  values,
  errors = {},
  handleChange,
  setFieldValue,
  specialityOptions = [],
  educationItems,
  setEducationItems,
  workExperienceItems,
  handleWorkExperienceChange,
  workExperienceError,
  languageItems,
  handleLanguagesChange,
  languageError,
}) => (
  <section className={styles.card}>
    <StepHeader
      icon={FaStethoscope}
      title="Qualifications & speciality"
      description="The speciality, credentials and experience behind the doctor."
    />

    <Row>
      <Col md={6}>
        <SpecialityField
          value={values.expertise}
          error={errors.expertise}
          departmentNames={specialityOptions}
          onChange={setFieldValue}
        />
      </Col>

      <Col md={6}>
        <Field
          label="Registration number"
          htmlFor="doctorRegistrationNo"
          hint='Optional. Printed on the prescription stamp as "Reg. No:".'
        >
          <TextInput
            id="doctorRegistrationNo"
            name="doctorRegistrationNo"
            type="text"
            value={values.doctorRegistrationNo}
            onChange={handleChange}
          />
        </Field>
      </Col>

      <Col md={12}>
        <div className={styles.field} data-invalid={errors.workExperience ? "true" : undefined}>
          <span className={styles.label}>
            Work experience <span className={styles.req}>*</span>
          </span>
          <WorkExperienceInput
            value={workExperienceItems}
            onChange={handleWorkExperienceChange}
            error={workExperienceError || errors.workExperience}
          />
        </div>
      </Col>

      <Col md={6}>
        <Field
          label="Total years of experience"
          htmlFor="totalyearofexperience"
          hint="Optional. Displayed next to the experience list."
        >
          <TextInput
            id="totalyearofexperience"
            name="totalyearofexperience"
            type="number"
            min="0"
            step="1"
            inputMode="numeric"
            value={values.totalyearofexperience}
            onChange={handleChange}
          />
        </Field>
      </Col>

      <Col md={12}>
        <div className={styles.field}>
          <span className={styles.label}>Education + training</span>
          <EducationTrainingInput
            value={educationItems}
            onChange={setEducationItems}
            suggestions={DEGREE_SUGGESTIONS}
          />
        </div>
      </Col>

      <Col md={12}>
        <div className={styles.field} data-invalid={errors.language ? "true" : undefined}>
          <span className={styles.label}>
            Languages <span className={styles.req}>*</span>
          </span>
          <LanguageInput
            value={languageItems}
            onChange={handleLanguagesChange}
            error={languageError || errors.language}
            suggestions={LANGUAGE_SUGGESTIONS}
            options={LANGUAGE_OPTIONS}
          />
        </div>
      </Col>

      <Col md={12}>
        <Field
          label="Overview"
          htmlFor="overview"
          required
          error={errors.overview}
          hint={`${String(values.overview ?? "").length} characters - 3 to 5 sentences work best.`}
        >
          <TextArea
            id="overview"
            name="overview"
            value={values.overview}
            onChange={handleChange}
            error={errors.overview}
          />
        </Field>
      </Col>
    </Row>
  </section>
);

/**
 * The "Speciality" control.
 *
 * Several specialities can be picked - each becomes a removable chip - and one
 * that is not in the list can be typed in and added. Everything is stored back
 * into the single `expertise` String ("Cardiology, Diabetology"), so the schema,
 * the API and every screen that reads the field stay untouched.
 */
const SpecialityField = ({ value, error, departmentNames = [], onChange }) => {
  // Departments first (`HealthPath departments`), then the grouped list. Memoised
  // so typing in the free-text field does not rebuild ~60 options per keystroke.
  const groups = useMemo(
    () => buildSpecialityGroups(departmentNames),
    [departmentNames]
  );

  const selected = useMemo(() => parseSpecialities(value), [value]);
  const [draft, setDraft] = useState("");

  const commit = (next) => onChange("expertise", formatSpecialities(next));

  const handleSelect = (event) => {
    const next = event.target.value;
    if (!next) return;
    commit([...selected, next]);
  };

  const handleRemove = (name) => {
    commit(selected.filter((entry) => entry !== name));
  };

  const handleAddDraft = () => {
    const entry = draft.trim();
    setDraft("");
    // Already picked - the chip is right there, so nothing to add.
    if (!entry || hasSpeciality(selected, entry)) return;
    commit([...selected, entry]);
  };

  // Enter adds the typed speciality instead of submitting the wizard, which is
  // what a form-level Enter would otherwise do on this step.
  const handleDraftKeyDown = (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    handleAddDraft();
  };

  return (
    <Field
      label="Speciality"
      htmlFor="expertise"
      required
      error={error}
      hint={
        selected.length > 1
          ? `${selected.length} specialities selected - each one matches the speciality filter.`
          : "Pick as many as the doctor practises, or add one that is not listed."
      }
    >
      <Select
        id="expertise"
        value=""
        onChange={handleSelect}
        error={error}
      >
        <option value="" disabled>
          {selected.length > 0 ? "Add another speciality" : "Select a speciality"}
        </option>
        {groups.map((group) => (
          <optgroup key={group.label} label={group.label}>
            {group.items.map((item) => (
              <option
                key={`${group.label}-${item}`}
                value={item}
                disabled={hasSpeciality(selected, item)}
              >
                {item}
              </option>
            ))}
          </optgroup>
        ))}
      </Select>

      {selected.length > 0 ? (
        <div className={styles.tagsContainer}>
          {selected.map((name) => (
            <div key={name} className={styles.tag}>
              {name}
              <button
                type="button"
                className={styles.removeButton}
                aria-label={`Remove ${name}`}
                onClick={() => handleRemove(name)}
              >
                ✖
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <div className={styles.inlineAdd}>
        <TextInput
          id="expertise-custom"
          type="text"
          placeholder="Not listed? Type it, e.g. Cardiologist"
          aria-label="Add a speciality manually"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleDraftKeyDown}
          onBlur={handleAddDraft}
        />
        <button
          type="button"
          className={styles.inlineAddButton}
          onClick={handleAddDraft}
          disabled={!draft.trim()}
        >
          Add
        </button>
      </div>
    </Field>
  );
};

export default Step2Qualifications;
