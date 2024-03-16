// components/ItemList.js
import React from "react";
import ItemCard from "./DocItemCards";
import { Button, Col, Row } from "react-bootstrap";

const RecentDoctors = ({ doctors }) => {
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
          <Col md={2} style={{ color: "#8e8333" }}>
            <b>Name</b>
          </Col>
          <Col md={2} style={{ color: "#8e8333" }}>
            <b>Area of Expertise</b>
          </Col>
          <Col md={2} style={{ color: "#8e8333" }}>
            <b>Degree</b>
          </Col>
          <Col md={2} style={{ color: "#8e8333" }}>
            <b>Work Days</b>
          </Col>
          <Col md={2} style={{ color: "#8e8333" }}>
            <b>Joining Date</b>
          </Col>
        </Row>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {doctors.map((item) => (
            <ItemCard doctor={item} />
          ))}
        </div>
        <Row className="mt-4">
          <Col className="text-center">
            <Button>View Doctors</Button>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default RecentDoctors;
