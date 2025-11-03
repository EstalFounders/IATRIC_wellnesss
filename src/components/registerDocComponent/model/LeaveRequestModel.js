import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

const LeaveRequestModel = ({ show, onClose, onConfirm }) => {
  const [formData, setFormData] = useState({
    startTime: "",
    endTime: "",
    reason: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = () => {
    console.log("Leave Request Submitted:", formData);
    onConfirm(formData); // Pass form data to the onConfirm handler
    onClose(); // Close the modal
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Leave Request</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="startTime" className="mb-3">
            <Form.Label>Start Date</Form.Label>
            <Form.Control
              type="date"
              name="startTime"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group controlId="endTime" className="mb-3">
            <Form.Label>End Date</Form.Label>
            <Form.Control
              type="date"
              name="endTime"
              value={formData.endDate}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group controlId="reason" className="mb-3">
            <Form.Label>Reason for Time Off</Form.Label>
            <Form.Control
              as="textarea"
              name="reason"
              placeholder="Please provide a brief reason for your time off request"
              value={formData.reason}
              onChange={handleChange}
              rows={3}
              required
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <div className="btn clickable-div bg-primary"onClick={onClose}>
          Cancel
        </div>
        <div className="btn clickable-div bg-primary" onClick={handleSubmit}>
          Submit
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default LeaveRequestModel;
