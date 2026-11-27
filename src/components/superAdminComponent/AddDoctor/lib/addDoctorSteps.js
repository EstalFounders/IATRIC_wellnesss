// lib/addDoctorSteps.js
//
// The six steps of the "Add doctor" wizard: their labels and - more importantly -
// ONE validator per step, used for three things:
//   1. the ✓ marks in the stepper,
//   2. `Save & continue` (inline errors under the fields),
//   3. `Add doctor` (re-runs every step and jumps back to the first one that is
//      still incomplete).
// Keeping the rules here means the wizard and the API cannot drift apart: the
// payload is unchanged, this is only the client-side gate.

import { isMobileValid } from "../../../../helper";
import { parseLanguages } from "../../../../customUtils/languages";
import { parseWorkExperience } from "../../../../customUtils/workExperience";
import { validateWeeklyAvailability } from "../../../../customUtils/weeklyAvailability";
import { validateBankDetails } from "../../../../customUtils/bankDetails";

// "Services offered" is turned off for now: the field is still rendered in step
// 3 (disabled) and still part of the payload, it is simply optional. Flip to
// `true` to restore the previous required behaviour - nothing was removed.
export const SERVICES_OFFERED_ENABLED = false;

export const WIZARD_STEPS = [
  {
    id: "profile",
    title: "Profile & contact",
    short: "Profile",
    description: "Who the doctor is and how patients reach them.",
  },
  {
    id: "qualifications",
    title: "Qualifications & speciality",
    short: "Qualifications",
    description: "Speciality, degrees, experience, languages and the overview.",
  },
  {
    id: "schedule",
    title: "Timings & services",
    short: "Timings",
    description: "Working days, consultation types, fees and services offered.",
  },
  {
    id: "banking",
    title: "Banking & statutory",
    short: "Banking",
    description: "PAN card and payout account. Optional - can be added later.",
  },
  {
    id: "documents",
    title: "Documents & pictures",
    short: "Documents",
    description: "Profile picture, signature and diploma certificates.",
  },
  {
    id: "preview",
    title: "Preview & submit",
    short: "Preview",
    description: "Check what patients will see, then register the doctor.",
  },
];

// Loose on purpose: a doctor's email may be on a company domain with unusual
// parts. It only catches an obvious typo, the API keeps its own rule.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Validates one step. Returns an object keyed by the field the step renders
 * (`{}` = the step is complete). Steps 4 and 5 have nothing mandatory, so they
 * are complete until an invalid value is typed into them.
 */
export function validateStep(
  stepId,
  {
    values = {},
    weeklyAvailability = [],
    languageItems = [""],
    workExperienceItems = [""],
    selectedTypes = [],
    selectedService = [],
    uniqueErrors = {},
  } = {}
) {
  const errors = {};

  switch (stepId) {
    case "profile": {
      if (!String(values.name ?? "").trim()) {
        errors.name = "Name is required";
      }

      const email = String(values.email ?? "").trim();
      if (!email) {
        errors.email = "Email is required";
      } else if (!EMAIL_PATTERN.test(email)) {
        errors.email = "Enter a valid email address";
      }

      const mobile = String(values.mobileNumber ?? "").trim();
      if (!mobile) {
        errors.mobileNumber = "Mobile number is required";
      } else if (!isMobileValid(mobile)) {
        errors.mobileNumber = "Enter a valid 10-digit mobile number";
      }

      // A clash already reported by the on-blur check blocks the step.
      if (uniqueErrors.email) errors.email = uniqueErrors.email;
      if (uniqueErrors.mobileNumber) errors.mobileNumber = uniqueErrors.mobileNumber;
      break;
    }

    case "qualifications": {
      if (!String(values.expertise ?? "").trim()) {
        errors.expertise = "Add at least one speciality";
      }
      if (parseWorkExperience(workExperienceItems).length === 0) {
        errors.workExperience = "Please add at least one work experience";
      }
      if (!String(values.overview ?? "").trim()) {
        errors.overview = "Overview is required";
      }
      if (parseLanguages(languageItems).length === 0) {
        errors.language = "Please add at least one language";
      }
      break;
    }

    case "schedule": {
      const scheduleError = validateWeeklyAvailability(weeklyAvailability);
      if (scheduleError) errors.workDays = scheduleError;
      if (selectedTypes.length === 0) {
        errors.consultationType = "Select at least one consultation type";
      }
      // Optional while the field is turned off (see SERVICES_OFFERED_ENABLED).
      if (SERVICES_OFFERED_ENABLED && selectedService.length === 0) {
        errors.serviceOffered = "Select at least one service";
      }
      break;
    }

    case "banking": {
      // Only the values that ARE provided are checked; a blank step is valid.
      const bankErrors = validateBankDetails({
        panNumber: values.panNumber,
        accountHolderName: values.bankAccountHolderName,
        accountNumber: values.bankAccountNumber,
        confirmAccountNumber: values.bankAccountNumberConfirm,
        ifscCode: values.bankIfscCode,
      });
      if (bankErrors.panNumber) errors.panNumber = bankErrors.panNumber;
      if (bankErrors.accountHolderName) {
        errors.bankAccountHolderName = bankErrors.accountHolderName;
      }
      if (bankErrors.accountNumber) {
        errors.bankAccountNumber = bankErrors.accountNumber;
      }
      if (bankErrors.confirmAccountNumber) {
        errors.bankAccountNumberConfirm = bankErrors.confirmAccountNumber;
      }
      if (bankErrors.ifscCode) errors.bankIfscCode = bankErrors.ifscCode;

      const share = String(values.doctorShare ?? "").trim();
      const numericShare = Number(share);
      if (
        share !== "" &&
        (!Number.isFinite(numericShare) || numericShare < 0 || numericShare > 100)
      ) {
        errors.doctorShare = "Doctor share must be between 0 and 100";
      }
      break;
    }

    // Documents (step 5) and the preview (step 6) have nothing mandatory.
    default:
      break;
  }

  return errors;
}

/** `true` when every value the step asks for is in place. */
export function isStepComplete(stepId, context) {
  return Object.keys(validateStep(stepId, context)).length === 0;
}
