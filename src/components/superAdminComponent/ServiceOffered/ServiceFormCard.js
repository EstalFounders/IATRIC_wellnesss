// ServiceFormCard.js - the "Add new service" card of the super-admin
// "Service offered" page.
//
// Same field grid as the edit dialog (ServiceFields.js) on a blank draft. The
// page owns the draft, its validation errors and the busy/note state and passes
// them in, so both forms behave identically.
import React from "react";
import { Button } from "react-bootstrap";
import { MdAdd } from "react-icons/md";
import styles from "../css/ServiceOffered.module.css";
import ServiceFields from "./ServiceFields";

const ServiceFormCard = ({
  draft,
  errors,
  busy,
  note,
  onChange,
  onSubmit,
  onReset,
}) => (
  <section className={styles.card}>
    <h2 className={styles.cardTitle}>
      <MdAdd aria-hidden="true" />
      Add new service
    </h2>
    <p className={styles.cardHint}>
      Fields marked <span className={styles.reqMark}>*</span> are required. A new
      service appears in the booking flow and on the homepage speciality tabs as
      soon as it is added.
    </p>

    <ServiceFields
      draft={draft}
      errors={errors}
      idPrefix="new-service"
      onChange={onChange}
    />

    {note ? (
      <p
        className={`${styles.note} ${
          note.type === "ok" ? styles.noteOk : styles.noteErr
        }`}
        role="status"
      >
        {note.text}
      </p>
    ) : null}

    <div className={styles.formActions}>
      <Button className={styles.primaryBtn} onClick={onSubmit} disabled={busy}>
        {busy ? "Adding…" : "Add service"}
      </Button>
      <Button className={styles.ghostBtn} onClick={onReset} disabled={busy}>
        Clear
      </Button>
    </div>
  </section>
);

export default ServiceFormCard;
