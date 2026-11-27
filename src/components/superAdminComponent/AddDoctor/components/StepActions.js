// components/StepActions.js
//
// The sticky footer of the wizard: where you are, how much is left, and the one
// obvious next action. Every control is `type="button"` on purpose - pressing
// Enter inside a text input must never register the doctor half way through.

import React from "react";
import styles from "../AddDoctorForm.module.css";
import { WIZARD_STEPS } from "../lib/addDoctorSteps";

const StepActions = ({
  currentStep,
  submitting = false,
  onBack,
  onNext,
  onSkip,
  onSubmit,
}) => {
  const isLastStep = currentStep === WIZARD_STEPS.length - 1;
  const step = WIZARD_STEPS[currentStep];

  return (
    <div className={styles.footer}>
      <div className={styles.footerInfo}>
        <span className={styles.footerStep}>
          Step {currentStep + 1} of {WIZARD_STEPS.length} · {step.title}
        </span>
        <span className={styles.footerNote}>{step.description}</span>
      </div>

      <div className={styles.footerButtons}>
        {onSkip ? (
          <button
            type="button"
            className={styles.linkBtn}
            onClick={onSkip}
            disabled={submitting}
          >
            Skip for now
          </button>
        ) : null}

        {currentStep > 0 ? (
          <button
            type="button"
            className={styles.ghostBtn}
            onClick={onBack}
            disabled={submitting}
          >
            Back
          </button>
        ) : null}

        {isLastStep ? (
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={onSubmit}
            disabled={submitting}
          >
            {submitting ? "Saving…" : "Add doctor"}
          </button>
        ) : (
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={onNext}
            disabled={submitting}
          >
            Save &amp; continue
          </button>
        )}
      </div>
    </div>
  );
};

export default StepActions;
