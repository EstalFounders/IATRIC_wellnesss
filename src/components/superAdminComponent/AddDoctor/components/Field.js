// components/Field.js
//
// The small building block every step uses: a label, the control, an optional
// hint and an inline error. It replaces the ~200 lines of repeated
// label/input/hint/error markup the old single-page form carried.
//
// `data-invalid` / `aria-invalid` are what the wizard's "focus the first
// problem" helper looks for after a failed `Save & continue`.

import React from "react";
import styles from "../AddDoctorForm.module.css";

const Field = ({ label, htmlFor, required = false, hint, error, children }) => (
  <div className={styles.field} data-invalid={error ? "true" : undefined}>
    {label ? (
      <label className={styles.label} htmlFor={htmlFor}>
        {label} {required ? <span className={styles.req}>*</span> : null}
      </label>
    ) : null}
    {children}
    {error ? (
      <span className={styles.fieldError} role="alert">
        {error}
      </span>
    ) : (
      hint ? <span className={styles.hint}>{hint}</span> : null
    )}
  </div>
);

const invalidProps = (error) => ({
  "aria-invalid": error ? "true" : undefined,
  "aria-describedby": undefined,
});

export const TextInput = ({ error, className, ...props }) => (
  <input
    {...invalidProps(error)}
    {...props}
    className={className ? `${styles.input} ${className}` : styles.input}
  />
);

export const TextArea = ({ error, className, ...props }) => (
  <textarea
    {...invalidProps(error)}
    {...props}
    className={className ? `${styles.textarea} ${className}` : styles.textarea}
  />
);

export const Select = ({ error, className, children, ...props }) => (
  <select
    {...invalidProps(error)}
    {...props}
    className={className ? `${styles.select} ${className}` : styles.select}
  >
    {children}
  </select>
);

export default Field;
