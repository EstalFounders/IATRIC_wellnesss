// ServiceFields.js - the field grid shared by the "Add new service" card
// (ServiceFormCard.js) and the edit dialog (EditServiceModal.js).
//
// It renders SERVICE_FIELDS (from ./serviceForm.js) against a `draft`, shows an
// inline error under any field present in `errors`, and hands every change back
// through onChange(fieldName, value). `idPrefix` keeps the <label for> ids unique
// when the add form and the modal are mounted at the same time.
import React from "react";
import { Form } from "react-bootstrap";
import styles from "../css/ServiceOffered.module.css";
import { SERVICE_FIELDS } from "./serviceForm";

const ServiceFields = ({ draft, errors = {}, idPrefix, onChange }) => (
  <div className={styles.formGrid}>
    {SERVICE_FIELDS.map((field) => {
      const id = `${idPrefix}-${field.name}`;
      const error = errors[field.name];
      const value = draft[field.name];

      if (field.type === "select") {
        return (
          <div className={styles.formGroup} key={field.name}>
            <label className={styles.formLabel} htmlFor={id}>
              {field.label}
            </label>
            <select
              id={id}
              className={styles.input}
              value={value || ""}
              onChange={(event) => onChange(field.name, event.target.value)}
            >
              {field.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );
      }

      if (field.type === "toggle") {
        return (
          <div className={`${styles.formGroup} ${styles.formGroupFull}`} key={field.name}>
            <div className={styles.switch}>
              <Form.Check
                type="switch"
                id={id}
                checked={Boolean(value)}
                label={value ? "Active — shown and bookable" : "Inactive — hidden from booking"}
                onChange={(event) => onChange(field.name, event.target.checked)}
              />
            </div>
          </div>
        );
      }

      const isTextarea = field.type === "textarea";
      const Control = isTextarea ? "textarea" : "input";

      return (
        <div
          className={`${styles.formGroup}${field.span ? ` ${styles.formGroupFull}` : ""}`}
          key={field.name}
        >
          <label className={styles.formLabel} htmlFor={id}>
            {field.label}
            {field.required ? (
              <span className={styles.reqMark} aria-hidden="true">
                *
              </span>
            ) : null}
          </label>
          <Control
            id={id}
            className={isTextarea ? styles.textarea : styles.input}
            type={isTextarea ? undefined : field.type}
            inputMode={field.type === "number" ? "decimal" : undefined}
            rows={isTextarea ? 3 : undefined}
            value={value ?? ""}
            placeholder={field.placeholder}
            aria-invalid={error ? true : undefined}
            onChange={(event) => onChange(field.name, event.target.value)}
          />
          {error ? (
            <span className={styles.fieldError} role="alert">
              {error}
            </span>
          ) : field.help ? (
            <span className={styles.fieldHelp}>{field.help}</span>
          ) : null}
        </div>
      );
    })}
  </div>
);

export default ServiceFields;
