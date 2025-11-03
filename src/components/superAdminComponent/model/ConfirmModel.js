import React from "react";
import { Modal, Button } from "react-bootstrap";

const ConfirmModal = ({ show, onClose, onConfirm }) => (
  <Modal show={show} onHide={onClose} centered>
    <Modal.Header closeButton>
      <Modal.Title>Confirmation</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <p>Are you sure?</p>
    </Modal.Body>
    <Modal.Footer>
      <div className="btn clickable-div bg-secondary" onClick={onClose}>
        Cancel
      </div>
      <div className="btn clickable-div bg-danger" onClick={onConfirm}>
        Confirm
      </div>
    </Modal.Footer>
  </Modal>
);

export default ConfirmModal;
