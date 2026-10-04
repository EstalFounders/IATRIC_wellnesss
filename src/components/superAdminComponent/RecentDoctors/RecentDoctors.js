// components/ItemList.js
import React from "react";
import ItemCard from "./DocItemCards";
import { Button, Col, Row } from "react-bootstrap";
import { color_schema } from "../../../constant";

const RecentDoctors = ({ doctors, refreshDoctorList }) => {
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
          <Col md={2} style={{ color: color_schema.yellow }}>
            <b>Name</b>
          </Col>
          <Col md={2} style={{ color: color_schema.yellow }}>
            <b>Area of Expertise</b>
          </Col>
          <Col md={2} style={{ color: color_schema.yellow }}>
            <b>Work Days</b>
          </Col>
          <Col md={2} style={{ color: color_schema.yellow }}>
            <b>Joining Date</b>
          </Col>
        </Row>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {doctors.map((item) => (
            <ItemCard key={item._id} doctor={item} refreshDoctorList={refreshDoctorList} />
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
