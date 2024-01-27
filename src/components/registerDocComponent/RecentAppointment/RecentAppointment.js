// components/ItemList.js
import React from "react";
import ItemCard from "./ItemCards";
import { Col, Row } from "react-bootstrap";

const RecentAppointment = ({ data }) => {
  return (
    <Row>
      <Col>
        <div>
          <h4>
            <b>Recent Appointments</b>
          </h4>
        </div>
        <Row
          style={{
            display: "flex",
            flexDirection: "row",
          }}
          className="mt-4"
        >
          <Col><strong>Name</strong></Col>
          <Col><strong>Gender</strong></Col>
          <Col><strong>Date</strong></Col>
          <Col><strong>Disease</strong></Col>
          <Col><strong>Status</strong></Col>
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
      </Col>
    </Row>
  );
};

export default RecentAppointment;
