import React, { useState } from "react";
import { Col, Row, Form, Button } from "react-bootstrap"; // Ensure proper imports
import { formatData } from "../../registerDocComponent/utils/helper";
import { appointment_status } from "../../../constant";
import { useRouter } from "next/router";
import { storeAppointmentData } from "../common/CommonMethod";

const ItemCards = ({ data, onStatusChanged, onUpdateStatus }) => {
  const [selectedStatus, setSelectedStatus] = useState(data.status);
  const [appointmentId, setAppointmentId] = useState(data._id);
  const [filteredData, setFiltereData] = useState(data);
  const router = useRouter();

  const handleStatusChange = (e) => {
    console.log(e.target.value, "event");
    setSelectedStatus(e.target.value);
    setAppointmentId(data._id);
  };

  const handleUpdateClick = () => {
    if (onUpdateStatus) {
      onUpdateStatus({ selectedStatus, appointmentId });
    }
  };

  const handleViewAppointment = async () => {
    router.push({
      pathname: "/superAdmin/viewAppointment",
      query: { data: JSON.stringify(data) }, // Pass the appointment data as a string
    });
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
      <Col className="text-primary clickable-div" onClick={handleViewAppointment}>
        <u>{data.name}</u>
      </Col>
      <Col>{data.consultationType}</Col>
      <Col>{formatData(data.appointmentTime)}</Col>
      <Col>{data.symptoms}</Col>
      <Col>{data.patientMobNo}</Col>
      <Col>
        <div
          className={`font-weight-bold mb-2 ${
            data.status === "COMPLETED"
              ? "text-success"
              : data.status === appointment_status.cancelled
              ? "text-danger"
              : data.status === appointment_status.rescheduled
              ? "text-secondary"
              : data.status === appointment_status.pending
              ? "text-primary"
              : data.status === appointment_status.confirmed
              ? "text-muted"
              : ""
          }`}
        >
          {data.status}
        </div>

        <Form.Group controlId="statusSelect">
          <Form.Control
            as="select"
            value={selectedStatus}
            onChange={handleStatusChange}
          >
            <option value="pending" className="text-center">
              Select to Update
            </option>
            <option value="pending">{appointment_status.pending}</option>
            <option value="confirmed">{appointment_status.confirmed}</option>
            <option value="reschedule">{appointment_status.rescheduled}</option>
            <option value="cancelled">{appointment_status.cancelled}</option>
            <option value="completed">{appointment_status.completed}</option>
          </Form.Control>
        </Form.Group>
        <Button onClick={handleUpdateClick} className="mt-1 mb-2">
          Update
        </Button>
      </Col>
    </Row>
  );
};

export default ItemCards;
