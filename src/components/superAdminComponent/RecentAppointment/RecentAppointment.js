// components/ItemList.js
import React from "react";
import ItemCard from "./AppointmentItemCards";
import { Button, Col, Row } from "react-bootstrap";

const RecentAppointment = ({ data }) => {
  return (
    <Row>
      <Col>
        <Row>
          <Col>
            <h4>
              <b>Recent Appointment</b>
            </h4>
          </Col>
          <Col className="text-right">
            <Button className="bg-danger">Add Appointment</Button>
          </Col>
        </Row>
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
            <b>Gender</b>
          </Col>
          <Col style={{ color: "#8e8333" }}>
            <b>Date</b>
          </Col>
          <Col style={{ color: "#8e8333" }}>
            <b>Disease</b>
          </Col>
          <Col style={{ color: "#8e8333" }}>
            <b>Status</b>
          </Col>
        </Row>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {data.map((item) => (
            <ItemCard
              key={item.id} // Ensure each item has a unique key
              name={item.name}
              gender={item.gender}
              date={item.date}
              disease={item.disease}
              status={item.status}
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
