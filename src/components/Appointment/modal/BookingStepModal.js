import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { useLanguage } from "../../../i18n/LanguageContext";
import styles from "../css/AppointmentModel.module.css";

/**
 * Shell for the booking step modals (OTP -> appointment details -> payment).
 *
 * One shell for every step keeps the sequence visually consistent and solves the
 * two things the old per-modal wrappers got wrong on small screens:
 *   * the dialog is capped at 90vh and only its body scrolls, so the header
 *     (step counter + close) stays reachable on a phone in landscape;
 *   * it renders through a portal, so a modal opened from inside a scrolled
 *     container is still positioned against the viewport.
 *
 * The page owns the step state, so closing a step never drops what the patient
 * already typed - it only closes the dialog.
 *
 * `step` is 1-based and counts the whole sequence (1 = the form on the page,
 * 2 = OTP, 3 = details, 4 = payment), which is what the progress dots show.
 */
const BookingStepModal = ({
  isOpen,
  onClose,
  step,
  totalSteps = 4,
  size = "md",
  title,
  subtitle,
  children,
}) => {
  const { t } = useLanguage();

  // Background must not scroll behind the dialog; restored on unmount so a step
  // switch (unmount + remount) never leaves the page locked.
  useEffect(() => {
    if (!isOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  // Escape closes the current step (not the whole flow - form state survives).
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const dots = Array.from({ length: totalSteps }, (_, index) => index + 1);

  return ReactDOM.createPortal(
    <div
      className={styles.stepBackdrop}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className={`${styles.stepDialog} ${
          size === "lg" ? styles.stepDialogLg : ""
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.stepHeader}>
          <div className={styles.stepHeading}>
            <span className={styles.stepCounter}>
              {t("af.step")} {step}/{totalSteps}
            </span>
            {title && <h3 className={styles.stepTitle}>{title}</h3>}
            {subtitle && <p className={styles.stepSubtitle}>{subtitle}</p>}
          </div>
          <button
            type="button"
            className={styles.stepClose}
            onClick={onClose}
            aria-label={t("common.close")}
          >
            &times;
          </button>
        </div>

        <div
          className={styles.stepProgress}
          role="progressbar"
          aria-valuenow={step}
          aria-valuemin={1}
          aria-valuemax={totalSteps}
          aria-valuetext={`${t("af.step")} ${step}/${totalSteps}`}
        >
          {dots.map((dot) => (
            <span
              key={dot}
              className={`${styles.stepDot} ${
                dot <= step ? styles.stepDotOn : ""
              }`}
            />
          ))}
        </div>

        <div className={styles.stepBody}>{children}</div>
      </div>
    </div>,
    document.body
  );
};

export default BookingStepModal;
