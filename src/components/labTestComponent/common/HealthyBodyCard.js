import React from "react";
import { Card, Button } from "react-bootstrap";
import styles from "../css/HealthyBodyCard.module.css"; // Optional CSS module for extra styling
import { MoreButton } from "./CommonMethod";

const HealthyBodyCard = ({ title, description, image }) => {
  return (
    <Card
      className={`text-center ${styles.customCard}`}
      style={{
        borderRadius: "8px",
        padding: "1rem",
        backgroundColor: "#F4F8E8",
      }}
    >
      <Card.Img
        variant="top"
        src={image}
        alt="Care of your Teeth"
        className={styles.cardImage}
        style={{ objectFit: "cover" }}
      />
      <Card.Body>
        <div className={styles.cardTitle}>{title}</div>

        {/* Fix: Remove <Card.Text> and use a <div> instead */}
        <div className={styles.cardDescription}>
          <p>{description}</p>
        </div>

        {/* Add the component here in the center */}
        <div className="d-flex justify-content-center mt-3 mr-5">
          <MoreButton /> {/* Replace with your actual component */}
        </div>
      </Card.Body>
    </Card>
  );
};

export default HealthyBodyCard;
