// steps/Step4Banking.js
//
// Step 4 of 6 - PAN + payout account, plus the doctor's revenue share and type.
// Entirely OPTIONAL by product decision: the footer offers "Skip for now" and an
// empty step never blocks the registration. What IS typed here is format-checked
// (see customUtils/bankDetails.js) because a wrong IFSC would only surface weeks
// later, when a payout fails.

import React from "react";
import { Col, Row } from "react-bootstrap";
import { FaPencilAlt, FaUniversity } from "react-icons/fa";
import styles from "../AddDoctorForm.module.css";
import StepHeader from "../components/StepHeader";
import Field, { Select, TextInput } from "../components/Field";
import ImageUploader from "../../../../lib/ImageUploader";
import { DoctorType } from "../../../../constant";

const Step4Banking = ({
  values,
  errors = {},
  handleChange,
  handleImagesChange,
  uploaderKey,
  isShareEditable,
  setIsShareEditable,
}) => (
  <section className={styles.card}>
    <StepHeader
      icon={FaUniversity}
      title="Banking & statutory"
      description="PAN card and the account payouts go to. Optional - these can be added later."
    >
      <p className={styles.stepHeaderNote}>
        Nothing on this page is required. Fill in what you have; to do it later,
        use <strong>Skip for now</strong> - the doctor is registered either way
        and the details can be added from the edit form.
      </p>
    </StepHeader>

    <Row>
      <Col md={6}>
        <Field
          label="PAN number"
          htmlFor="panNumber"
          error={errors.panNumber}
          hint="Format ABCDE1234F. Stored privately, never shown on the website."
        >
          <TextInput
            id="panNumber"
            name="panNumber"
            type="text"
            autoComplete="off"
            maxLength={10}
            style={{ textTransform: "uppercase" }}
            value={values.panNumber}
            onChange={handleChange}
            error={errors.panNumber}
          />
        </Field>
      </Col>

      <Col md={6}>
        <div className={styles.field}>
          <span className={styles.label}>PAN card scan</span>
          <ImageUploader
            id="panCard"
            key={uploaderKey}
            multiple={false}
            onImagesChange={handleImagesChange}
          />
          <span className={styles.hint}>
            Optional. A photograph or a PDF scan is fine.
          </span>
        </div>
      </Col>

      <Col md={6}>
        <Field
          label="Account holder name"
          htmlFor="bankAccountHolderName"
          error={errors.bankAccountHolderName}
          hint="Exactly as printed on the bank account."
        >
          <TextInput
            id="bankAccountHolderName"
            name="bankAccountHolderName"
            type="text"
            autoComplete="off"
            value={values.bankAccountHolderName}
            onChange={handleChange}
            error={errors.bankAccountHolderName}
          />
        </Field>
      </Col>

      <Col md={6}>
        <Field
          label="Bank name"
          htmlFor="bankName"
          hint="Optional, e.g. HDFC Bank."
        >
          <TextInput
            id="bankName"
            name="bankName"
            type="text"
            autoComplete="off"
            value={values.bankName}
            onChange={handleChange}
          />
        </Field>
      </Col>

      <Col md={6}>
        <Field
          label="Account number"
          htmlFor="bankAccountNumber"
          error={errors.bankAccountNumber}
          hint="9 to 18 digits."
        >
          <TextInput
            id="bankAccountNumber"
            name="bankAccountNumber"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            maxLength={18}
            value={values.bankAccountNumber}
            onChange={handleChange}
            error={errors.bankAccountNumber}
          />
        </Field>
      </Col>

      <Col md={6}>
        <Field
          label="Confirm account number"
          htmlFor="bankAccountNumberConfirm"
          error={errors.bankAccountNumberConfirm}
        >
          <TextInput
            id="bankAccountNumberConfirm"
            name="bankAccountNumberConfirm"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            maxLength={18}
            value={values.bankAccountNumberConfirm}
            onChange={handleChange}
            error={errors.bankAccountNumberConfirm}
          />
        </Field>
      </Col>

      <Col md={6}>
        <Field
          label="IFSC code"
          htmlFor="bankIfscCode"
          error={errors.bankIfscCode}
          hint="Format HDFC0001234, printed on the cheque book."
        >
          <TextInput
            id="bankIfscCode"
            name="bankIfscCode"
            type="text"
            autoComplete="off"
            maxLength={11}
            style={{ textTransform: "uppercase" }}
            value={values.bankIfscCode}
            onChange={handleChange}
            error={errors.bankIfscCode}
          />
        </Field>
      </Col>

      <Col md={6}>
        <Field label="Branch" htmlFor="bankBranch" hint="Optional.">
          <TextInput
            id="bankBranch"
            name="bankBranch"
            type="text"
            autoComplete="off"
            value={values.bankBranch}
            onChange={handleChange}
          />
        </Field>
      </Col>

      <Col md={6}>
        <Field
          label="Doctor share (%)"
          htmlFor="doctorShare"
          error={errors.doctorShare}
          hint="What the doctor keeps from every consultation."
        >
          <div className={styles.inlineControl}>
            <TextInput
              id="doctorShare"
              name="doctorShare"
              type="number"
              min="0"
              max="100"
              readOnly={!isShareEditable}
              value={values.doctorShare}
              onChange={handleChange}
              error={errors.doctorShare}
              className={isShareEditable ? "" : styles.readonlyInput}
            />
            <button
              type="button"
              className={styles.iconBtn}
              onClick={() => setIsShareEditable((previous) => !previous)}
              title={isShareEditable ? "Lock doctor share" : "Edit doctor share"}
              aria-label={
                isShareEditable ? "Lock doctor share" : "Edit doctor share"
              }
            >
              <FaPencilAlt />
            </button>
          </div>
        </Field>
      </Col>

      <Col md={6}>
        <Field
          label="Doctor type"
          htmlFor="doctorType"
          hint="Company for a clinic or a corporate entity."
        >
          <Select
            id="doctorType"
            name="doctorType"
            value={values.doctorType}
            onChange={handleChange}
          >
            <option value={DoctorType.individual}>{DoctorType.individual}</option>
            <option value={DoctorType.company}>{DoctorType.company}</option>
          </Select>
        </Field>
      </Col>
    </Row>
  </section>
);

export default Step4Banking;

