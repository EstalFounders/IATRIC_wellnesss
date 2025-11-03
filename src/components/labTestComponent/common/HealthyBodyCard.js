import React from "react";
import { Card } from "react-bootstrap";
import styles from "../css/HealthyBodyCard.module.css"; // Optional: For override
import { MoreButton } from "./CommonMethod";

const HealthyBodyCard = ({ title, description, image }) => {
  return (
    <Card
      className={`border-0 shadow-sm rounded-4 overflow-hidden ${styles.customCard}`}
      style={{ minHeight: "100%", backgroundColor: "#ffffff" }}
    >
      {/* Image Banner */}
      <div style={{ height: "180px", overflow: "hidden" }}>
        <Card.Img
          src={image}
          alt={title}
          className="w-100 h-100"
          style={{ objectFit: "cover" }}
        />
      </div>

      {/* Body */}
      <Card.Body className="d-flex flex-column justify-content-between p-3">
        {/* Title */}
        <h5 className={`fw-bold mb-2 text-center ${styles.cardTitle}`}>{title}</h5>

        {/* Description */}
        <p className="text-muted small mb-3 text-center">{description}</p>

        {/* CTA Button */}
        <div className="d-flex justify-content-center mt-auto">
          <MoreButton />
        </div>
      </Card.Body>
    </Card>
  );
};

export default HealthyBodyCard;
