// components/ItemCard.js
import React from "react";
import { Col, Row } from "react-bootstrap";

const ItemCards = ({ name, area_of_expertise, degree, work_days, joining_date }) => {
  return (
    <Row
      style={{
        // borderBottom: "1px solid #ccc",
        display: "flex",
        flexDirection: "row",
      }}
    className="mt-4"
    >
      
      <Col>{name}</Col>
      <Col>{area_of_expertise}</Col>
      <Col>{degree}</Col>
      <Col>{work_days}</Col>
      <Col>{joining_date}</Col>
    </Row>
  );
};

export default ItemCards;
