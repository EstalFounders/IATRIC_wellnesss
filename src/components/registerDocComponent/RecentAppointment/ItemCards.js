// components/ItemCard.js
import React from "react";
import { Col, Row } from "react-bootstrap";

const ItemCards = ({ name, gender, date, disease, status }) => {
  return (
    <Row
      style={{
        borderBottom: "1px solid #ccc",
        display: "flex",
        flexDirection: "row",
      }}
      className="mt-4"
    >
      <Col>{name}</Col>
      <Col>{gender}</Col>
      <Col>{date}</Col>
      <Col>{disease}</Col>
      <Col>{status}</Col>
    </Row>
  );
};

export default ItemCards;
