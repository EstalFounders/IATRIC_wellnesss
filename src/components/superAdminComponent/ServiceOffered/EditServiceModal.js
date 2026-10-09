// EditServiceModal.js - the edit dialog of the super-admin "Service offered" page.
//
// Replaces the old inline card-edit: the whole record (including the Category
// select and the Active switch) is edited in one react-bootstrap Modal, exactly
// like the other super-admin panels. The draft and its errors live in the page
// (ServiceOfferedComp.js); this component only renders them and forwards changes.
import React from "react";
import { Button, Modal } from "react-bootstrap";
import styles from "../css/ServiceOffered.module.css";
import ServiceFields from "./ServiceFields";

const EditServiceModal = ({
  show,
  draft,
  errors,
  busy,
  note,
  onChange,
  onClose,
  onSave,
}) => {
  if (!draft) return null;

  return (
    <Modal
      show={show}
      onHide={busy ? undefined : onClose}
      centered
      size="lg"
      scrollable
    >
      <Modal.Header closeButton={!busy}>
        <Modal.Title>Edit service</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ServiceFields
          draft={draft}
          errors={errors}
          idPrefix="edit-service"
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
      </Modal.Body>
      <Modal.Footer>
        <Button
          className={styles.ghostBtn}
          onClick={onClose}
          disabled={busy}
        >
          Cancel
        </Button>
        <Button
          className={styles.primaryBtn}
          onClick={onSave}
          disabled={busy}
        >
          {busy ? "Saving…" : "Save changes"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditServiceModal;
