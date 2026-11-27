// steps/Step1Profile.js
//
// Step 1 of 6 - who the doctor is and how patients reach them. Only these three
// values are mandatory to register a doctor (name, email, mobile); everything
// else can be filled in later, which is why this step stays short.

import React from "react";
import { Col, Row } from "react-bootstrap";
import { FaUserCircle } from "react-icons/fa";
import styles from "../AddDoctorForm.module.css";
import StepHeader from "../components/StepHeader";
import Field, { TextInput } from "../components/Field";
import IndiaLocationPicker from "../../../Common/IndiaLocationPicker";

const Step1Profile = ({
  values,
  errors = {},
  handleChange,
  handleDoctorNameBlur,
  handleUniqueBlur,
  handleLocationChange,
  uploaderKey,
}) => (
  <section className={styles.card}>
    <StepHeader
      icon={FaUserCircle}
      title="Profile & contact"
      description="The doctor's name, how they log in and how patients reach them."
    />

    <Row>
      <Col md={6}>
        <Field
          label="Name"
          htmlFor="name"
          required
          error={errors.name}
          hint={'Saved as "Dr. First Last".'}
        >
          <TextInput
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            value={values.name}
            onChange={handleChange}
            onBlur={handleDoctorNameBlur}
            error={errors.name}
          />
        </Field>
      </Col>

      <Col md={6}>
        <Field
          label="Email"
          htmlFor="email"
          required
          error={errors.email}
          hint="Used as the login id. Must not be used by another doctor."
        >
          <TextInput
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleUniqueBlur}
            error={errors.email}
          />
        </Field>
      </Col>

      <Col md={6}>
        <Field
          label="Mobile number"
          htmlFor="mobileNumber"
          required
          error={errors.mobileNumber}
          hint="10 digits. The temporary password is sent to this number on WhatsApp."
        >
          <TextInput
            id="mobileNumber"
            name="mobileNumber"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            maxLength={10}
            value={values.mobileNumber}
            onChange={handleChange}
            onBlur={handleUniqueBlur}
            error={errors.mobileNumber}
          />
        </Field>
      </Col>

      <Col md={6}>
        <div className={styles.field}>
          <IndiaLocationPicker
            key={uploaderKey}
            value={values.location}
            onChange={handleLocationChange}
            selectClassName={styles.select}
          />
        </div>
      </Col>

      <Col md={12}>
        <div className={styles.field}>
          <span className={styles.label}>Gender</span>
          <div className={styles.choiceRow}>
            {[
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
            ].map((option) => (
              <label
                key={option.value}
                className={`${styles.choiceCard} ${
                  values.gender === option.value ? styles.choiceCardSelected : ""
                }`}
              >
                <input
                  type="radio"
                  name="gender"
                  value={option.value}
                  checked={values.gender === option.value}
                  onChange={handleChange}
                />
                {option.label}
              </label>
            ))}
          </div>
          <span className={styles.hint}>Optional. Shown on the doctor profile.</span>
        </div>
      </Col>
    </Row>
  </section>
);

export default Step1Profile;
