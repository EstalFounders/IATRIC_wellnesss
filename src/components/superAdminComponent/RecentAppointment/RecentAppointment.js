// components/ItemList.js
import React from "react";
import ItemCard from "./AppointmentItemCards";
import { Button, Col, Row } from "react-bootstrap";

const RecentAppointment = ({ data, onUpdateStatus }) => {
  
  return (
    <Row>
      <Col>
        <Row
          style={{
            display: "flex",
            flexDirection: "row",
          }}
          className="mt-4"
        >
          <Col style={{ color: "#8e8333" }}>
            <b>Name</b>
          </Col>
          <Col style={{ color: "#8e8333" }}>
            <b>Consultation Type</b>
          </Col>
          <Col style={{ color: "#8e8333" }}>
            <b>Appointment Time</b>
          </Col>
          <Col style={{ color: "#8e8333" }}>
            <b>Symptoms</b>
          </Col>
          <Col style={{ color: "#8e8333" }}>
            <b>Mobile Number</b>
          </Col>
          <Col style={{ color: "#8e8333" }}>
            <b>Status</b>
          </Col>
        </Row>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {data.map((item) => (
            <ItemCard
              key={item._id} // Ensure each item has a unique key
              itemId={item._id}
              name={item.name}
              consultationType={item.consultationType}
              date={item.appointmentTime}
              symptoms={item.symptoms}
              status={item.status}
              patientMobNo={item.patientMobNo}
              onUpdateStatus = {onUpdateStatus}
            />
          ))}
        </div>
        <Row className="mt-4">
          <Col className="text-center">
            <Button>View Appointments</Button>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default RecentAppointment;
