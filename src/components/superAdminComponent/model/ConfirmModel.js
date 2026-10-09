import React from "react";
import { Button, Modal } from "react-bootstrap";

// Shared confirmation dialog. title, message, confirmLabel, confirmVariant and
// busy are optional, so the existing callers (AddLabComp, Labtest) keep working
// unchanged: `busy` disables the buttons while an action is in flight and
// `confirmVariant` lets a non-destructive action (approving a change request)
// confirm with a different button colour than the default red.
const ConfirmModal = ({
  show,
  onClose,
  onConfirm,
  title = "Confirmation",
  message = "Are you sure?",
  confirmLabel = "Confirm",
  confirmVariant = "danger",
  busy = false,
}) => (
  <Modal show={show} onHide={busy ? undefined : onClose} centered>
    <Modal.Header closeButton={!busy}>
      <Modal.Title>{title}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <p className="mb-0">{message}</p>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={onClose} disabled={busy}>
        Cancel
      </Button>
      <Button variant={confirmVariant} onClick={onConfirm} disabled={busy}>
        {confirmLabel}
      </Button>
    </Modal.Footer>
  </Modal>
);

export default ConfirmModal;
