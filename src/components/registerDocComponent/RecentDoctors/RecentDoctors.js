// components/ItemList.js
import React from "react";
import ItemCard from "./DocItemCards";
import { Button, Col, Row } from "react-bootstrap";

const RecentDoctors = ({ doctors }) => {
  console.log(doctors, "doctors");
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
          <Col style={{ color: "#8E822F" }}>
            <b>Name</b>
          </Col>
          <Col style={{ color: "#8E822F" }}>
            <b>Area of Expertise</b>
          </Col>
          <Col style={{ color: "#8E822F" }}>
            <b>Degree</b>
          </Col>
          <Col style={{ color: "#8E822F" }}>
            <b>Work Days</b>
          </Col>
          <Col style={{ color: "#8E822F" }}>
            <b>Joining Date</b>
          </Col>
        </Row>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {doctors.map((item) => (
            <ItemCard
              key={item.id} // Ensure each item has a unique key
              name={item.name}
              area_of_expertise={item.expertise}
              degree={item.degree}
              work_days={item.workDays}
              joining_date={new Date(item.joiningDate).toLocaleDateString()}
            />
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
