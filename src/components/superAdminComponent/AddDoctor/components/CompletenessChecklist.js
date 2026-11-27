// components/CompletenessChecklist.js
//
// The live "what is still missing" panel in the right rail. Every row links back
// to the step that owns the value, which is the quickest way to fix a gap found
// on the preview step.

import React from "react";
import { FaCheckCircle, FaCircle } from "react-icons/fa";
import styles from "../AddDoctorForm.module.css";

const CompletenessChecklist = ({ items = [], onJump }) => {
  const required = items.filter((item) => !item.optional);
  const optional = items.filter((item) => item.optional);
  const doneRequired = required.filter((item) => item.done).length;

  const renderItem = (item) => (
    <li key={item.label} className={styles.checklistItem}>
      <span
        className={item.done ? styles.checklistDone : styles.checklistTodo}
        aria-hidden="true"
      >
        {item.done ? <FaCheckCircle /> : <FaCircle />}
      </span>
      <span className={styles.checklistLabel}>{item.label}</span>
      {!item.done && Number.isInteger(item.step) ? (
        <button
          type="button"
          className={styles.checklistLink}
          onClick={() => onJump(item.step)}
        >
          Fix
        </button>
      ) : null}
    </li>
  );

  return (
    <>
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Completeness</h2>
        <p className={styles.checklistCount}>
          {doneRequired} of {required.length} required details done
        </p>
        <ul className={styles.checklist}>{required.map(renderItem)}</ul>
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Can be added later</h2>
        <ul className={styles.checklist}>{optional.map(renderItem)}</ul>
      </section>
    </>
  );
};

export default CompletenessChecklist;
