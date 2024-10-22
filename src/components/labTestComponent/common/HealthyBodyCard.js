import React from "react";
import { Card, Button } from "react-bootstrap";
import styles from "../css/HealthyBodyCard.module.css"; // Optional CSS module for extra styling

const HealthyBodyCard = ({
    title,
    description,
    image
  }) => {
  return (
    <Card className={`text-center ${styles.customCard}`} style={{ borderRadius: "8px", padding: "1rem", backgroundColor: "#F4F8E8" }}>
      <Card.Img
        variant="top"
        src={image} // Replace with the correct image path
        alt="Care of your Teeth"
        className={styles.cardImage}
        style={{ objectFit: "cover" }}
      />
      <Card.Body>
        <div className={styles.cardTitle}>{title}</div>
        <Card.Text>
          <div className={styles.cardDescription}>{description}</div>
        </Card.Text>
        <Button
          variant="link"
          style={{ color: "#3B82F6", textDecoration: "underline", fontWeight: "bold", padding: 0 }}
        >
          Learn more
        </Button>
      </Card.Body>
    </Card>
  );
};

export default HealthyBodyCard;
