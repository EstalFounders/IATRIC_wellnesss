// components/WizardStepper.js
//
// The numbered step rail above the form. A step shows a ✓ as soon as its
// required values are in place, the current step is highlighted and every
// visited step can be clicked to go back. Moving FORWARD is guarded by the form
// (`handleStepSelect`), so clicking step 6 on an empty form explains what is
// missing instead of jumping.

import React from "react";
import {
  FaCalendarAlt,
  FaCheck,
  FaEye,
  FaFolderOpen,
  FaGraduationCap,
  FaUniversity,
  FaUserAlt,
} from "react-icons/fa";
import styles from "../AddDoctorForm.module.css";
import { WIZARD_STEPS } from "../lib/addDoctorSteps";

const STEP_ICONS = {
  profile: FaUserAlt,
  qualifications: FaGraduationCap,
  schedule: FaCalendarAlt,
  banking: FaUniversity,
  documents: FaFolderOpen,
  preview: FaEye,
};

const WizardStepper = ({ currentStep, isComplete, onSelect }) => {
  const progress = ((currentStep + 1) / WIZARD_STEPS.length) * 100;

  return (
    <nav className={styles.stepper} aria-label="Add doctor steps">
      <ol className={styles.stepList}>
        {WIZARD_STEPS.map((step, index) => {
          const Icon = STEP_ICONS[step.id] || FaUserAlt;
          // The preview has nothing to fill in, so it never shows a ✓.
          const done = step.id !== "preview" && isComplete(step.id);
          const active = index === currentStep;

          return (
            <li key={step.id} className={styles.stepItem}>
              <button
                type="button"
                className={`${styles.step} ${active ? styles.stepActive : ""} ${
                  done ? styles.stepDone : ""
                }`}
                aria-current={active ? "step" : undefined}
                title={step.description}
                onClick={() => onSelect(index)}
              >
                <span className={styles.stepNumber} aria-hidden="true">
                  {done ? <FaCheck /> : <Icon />}
                </span>
                <span className={styles.stepLabel}>{step.short}</span>
              </button>
            </li>
          );
        })}
      </ol>
      <div className={styles.progress}>
        <span
          className={styles.progressBar}
          style={{ width: `${progress}%` }}
          aria-hidden="true"
        />
      </div>
      {/* Screen readers get the position once instead of per button. */}
      <p className={styles.srOnly} aria-live="polite">
        Step {currentStep + 1} of {WIZARD_STEPS.length}:{" "}
        {WIZARD_STEPS[currentStep].title}
      </p>
    </nav>
  );
};

export default WizardStepper;
