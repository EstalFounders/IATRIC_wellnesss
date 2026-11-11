import React from "react";
import { Card, Form, InputGroup, Alert } from "react-bootstrap";
import { useLanguage } from "../../i18n/LanguageContext";
import { ConsultationButton } from "../Common/commonUi";
import styles from "./css/appointmentPage.module.css";
import { color_schema } from "../../constant";

// MUI-free severity -> react-bootstrap Alert variant.
const ALERT_VARIANTS = {
  success: "success",
  error: "danger",
  warning: "warning",
  info: "info",
};

/**
 * Step 1 of the booking sequence: contact details only.
 *
 * The old single-screen form asked for the doctor, the slot and the reason
 * before the patient had even been verified. This card now collects just the
 * name + mobile number and hands over to the modal sequence
 * (OTP -> appointment details -> payment, see AppointmentPage.js).
 *
 * Every value still lives in AppointmentPage (`appointmentState`/`setter`), so
 * closing a modal and coming back here never loses what was typed. The rest of
 * the fields were moved, unchanged, into `AppointmentDetailsStep.js`.
 */
const AppointmentForm = ({
  appointmentState,
  setter,
  handleContactContinue,
  handleCloseSnackBar,
}) => {
  const { t } = useLanguage();

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
          className="text-center mb-2"
          style={{ fontWeight: 600, color: "#0f172a", fontSize: "1.6rem" }}
        >
          {t("af.title")}
        </h4>
        <p className={styles.stepHint}>{t("af.contactSubtitle")}</p>

        <Form
          className={`appointment-form ${styles.form}`}
          onSubmit={(event) => {
            event.preventDefault();
            handleContactContinue();
          }}
        >
          {/* Single-column stack: one full-width control per row, spacing owned
              by the grid `gap` so both fields and the CTA line up exactly. */}
          <div className={styles.contactFields}>
            <Form.Group className={`mb-0 w-100 ${styles.field}`} controlId="af-name">
              <Form.Label className={styles.label}>{t("af.name")}</Form.Label>
              <Form.Control
                className="w-100"
                size="sm"
                type="text"
                autoComplete="name"
                placeholder={t("af.name")}
                value={appointmentState.name}
                onChange={(e) => setter.setName(e.target.value)}
              />
            </Form.Group>

            <Form.Group className={`mb-0 w-100 ${styles.field}`} controlId="af-mobile">
              <Form.Label className={styles.label}>{t("af.mobile")}</Form.Label>
              <InputGroup size="sm" className="w-100">
                {/* BS4 only applies its -sm metrics to a prefix wrapped in
                    .input-group-prepend, otherwise +91 stays taller than the input.
                    No `w-100` on the control itself: `.w-100` is `width:100%!important`
                    and overrides the group's `flex:1 1 auto`, which wrapped +91 onto
                    its own line above the input. */}
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
                  autoComplete="tel-national"
                  maxLength={10}
                  placeholder={t("af.mobilePlaceholder")}
                  value={appointmentState.mobNo}
                  onChange={(e) => setter.setMobNo(e.target.value)}
                />
              </InputGroup>
            </Form.Group>
          </div>

          {/* CTA directly under the mobile number, then the helper note. */}
          <div className={`${styles.ctaWrap} ${styles.ctaField} mt-3`}>
            <ConsultationButton onClick={handleContactContinue}>
              {t("af.continue")}
            </ConsultationButton>
          </div>

          <p className={styles.stepNote}>{t("af.contactNote")}</p>

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
