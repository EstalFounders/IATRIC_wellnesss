// ServiceFields.js - the field grid shared by the "Add new service" card
// (ServiceFormCard.js) and the edit dialog (EditServiceModal.js).
//
// It renders SERVICE_FIELDS (from ./serviceForm.js) against a `draft`, shows an
// inline error under any field present in `errors`, and hands every change back
// through onChange(fieldName, value). `idPrefix` keeps the <label for> ids unique
// when the add form and the modal are mounted at the same time.
import React, { useEffect, useMemo, useRef } from "react";
import { Form } from "react-bootstrap";
import styles from "../css/ServiceOffered.module.css";
import { SERVICE_FIELDS } from "./serviceForm";

const ACCEPT_IMAGES = "image/jpeg,image/png,image/webp,image/gif";

const ImageField = ({ id, draft, error, help, onChange }) => {
  const inputRef = useRef(null);
  const objectUrl = useMemo(() => {
    if (!draft.imageFile) return null;
    return URL.createObjectURL(draft.imageFile);
  }, [draft.imageFile]);

  useEffect(
    () => () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    },
    [objectUrl]
  );

  const preview = objectUrl || draft.image || "";

  const handlePick = (event) => {
    const file = event.target.files && event.target.files[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type || !file.type.startsWith("image/")) {
      onChange("imageFile", null);
      return;
    }
    onChange("imageFile", file);
  };

  const handleClearNew = () => {
    onChange("imageFile", null);
  };

  return (
    <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
      <label className={styles.formLabel} htmlFor={id}>
        Image
      </label>
      <div className={styles.imagePicker}>
        {preview ? (
          <img src={preview} alt="" className={styles.imagePreview} />
        ) : (
          <span className={styles.imagePreviewEmpty} aria-hidden="true">
            No image
          </span>
        )}
        <div className={styles.imagePickerActions}>
          <input
            ref={inputRef}
            id={id}
            type="file"
            accept={ACCEPT_IMAGES}
            className={styles.fileInput}
            onChange={handlePick}
          />
          <button
            type="button"
            className={styles.rowBtn}
            onClick={() => inputRef.current && inputRef.current.click()}
          >
            {preview ? "Change image" : "Upload image"}
          </button>
          {draft.imageFile ? (
            <button
              type="button"
              className={styles.ghostBtn}
              onClick={handleClearNew}
            >
              Undo new file
            </button>
          ) : null}
          {help ? <span className={styles.fieldHelp}>{help}</span> : null}
        </div>
      </div>
      {error ? (
        <span className={styles.fieldError} role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
};

const ServiceFields = ({ draft, errors = {}, idPrefix, onChange }) => (
  <div className={styles.formGrid}>
    {SERVICE_FIELDS.map((field) => {
      const id = `${idPrefix}-${field.name}`;
      const error = errors[field.name];
      const value = draft[field.name];

      if (field.type === "image") {
        return (
          <ImageField
            key={field.name}
            id={id}
            draft={draft}
            error={error}
            help={field.help}
            onChange={onChange}
          />
        );
      }

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
