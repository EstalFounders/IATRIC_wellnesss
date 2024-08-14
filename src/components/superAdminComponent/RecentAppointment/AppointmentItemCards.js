import React, { useState } from "react";
import { Col, Row, Form, Button } from "react-bootstrap"; // Ensure proper imports
import { formatData } from "../../registerDocComponent/utils/helper";

const ItemCards = ({ itemId,name, consultationType, date, symtoms, status, patientMobNo, onUpdateStatus }) => {
  const [selectedStatus, setSelectedStatus] = useState(status);
  const [appointmentId, setAppointmentId] = useState(status);

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
    setAppointmentId(itemId)
  };

  const handleUpdateClick = () => {
    if (onUpdateStatus) {
      onUpdateStatus({selectedStatus, appointmentId});
    }
  };

  return (
    <Row
      style={{
        borderBottom: "1px solid #ccc",
        borderBottomWidth: 3,
        display: "flex",
        flexDirection: "row",
      }}
      className="mt-4"
    >
      <Col>{name}</Col>
      <Col>{consultationType}</Col>
      <Col>{formatData(date)}</Col>
      <Col>{symtoms}</Col>
      <Col>{patientMobNo}</Col>
      <Col>
        <Form.Group controlId="statusSelect">
          <Form.Control as="select" value={selectedStatus} onChange={handleStatusChange}>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="reschedule">Reschedule</option>
          </Form.Control>
        </Form.Group>
        <Button onClick={handleUpdateClick} className="mt-2">
          Update
        </Button>
      </Col>
    </Row>
  );
};

export default ItemCards;
