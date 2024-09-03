import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import Image from "next/image";
import styles from "../css/HealthConcern.module.css"; // Import the CSS module
import { FaHeartbeat, FaLongArrowAltRight } from "react-icons/fa";

const healthConcerns = [
  { name: "Blood", image: "/images/labtest/test/heart.jpg" },
  { name: "BackPain", image: "/images/labtest/test/heart.jpg" },
  { name: "Liver", image: "/images/labtest/test/heart.jpg" },
  { name: "Kidney", image: "/images/labtest/test/heart.jpg" },
  { name: "Orthopaedics", image: "/images/labtest/test/heart.jpg" },
  { name: "Senior citizen", image: "/images/labtest/test/heart.jpg" },
  // Add more health concerns as needed
];

const FindTestByHealthConcern = () => {
  return (
    <>
      <Row
        className={`align-items-center border-bottom mb-5 p-2 ${styles.container}`}
      >
        <Col>
          <Row>
            <Col
              sm={8}
              md={6}
              lg={11}
              className={`text-left mb-4 ${styles.findTestbyHealthText}`}
            >
              Find Test By health concern
            </Col>
            <Row>
              <Col className="mt-4 h6">
                <Row>
                  <Col style={{whiteSpace: "nowrap"}}>SEE ALL</Col>
                    <FaLongArrowAltRight />
                </Row>
              </Col>
            </Row>
          </Row>
          <Row className="d-flex justify-content-center">
            {healthConcerns.map((concern, index) => (
              <Col
                key={index}
                xs={6}
                sm={4}
                md={3}
                lg={2}
                className="d-flex justify-content-center mb-4"
              >
                <div className={styles.circle}>
                  <Image
                    src={concern.image}
                    alt={concern.name}
                    width={50}
                    height={50}
                    className={styles.image}
                  />
                  <span className={styles.label}>{concern.name}</span>
                </div>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
    </>
  );
};

export default FindTestByHealthConcern;
