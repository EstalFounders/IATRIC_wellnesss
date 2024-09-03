// components/TestCard.js
import React from "react";
import { Card, Badge, Row, Col } from "react-bootstrap";
import Image from "next/image";
import styles from "../css/TestDetailsCard.module.css";

const TestDetailsCard = ({ test }) => {
  return (
    <Card className={styles.testCard}>
      <Card.Body>
        <Row className="d-flex">
          <Col sm={10} md={8} lg={9}>
            <Image src={test.icon} alt={test.name} width={40} height={40} />
          </Col>
          <Col sm={10} md={8} lg={3}>
            {test.discount && (
              <Badge variant="danger" className={styles.discountBadge}>
                {test.discount}% Off
              </Badge>
            )}
          </Col>
        </Row>
        <Card.Title className={styles.testName}>{test.name}</Card.Title>
        <div className={styles.testIncluded}>
          Included {test.testCount} test
        </div>
        <Row className="mt-5">
          <Col sm={10} md={8} lg={3} className={styles.discountPrice}>
            {`₹${test.discountPrice}`}
          </Col>

          <Col sm={10} md={8} lg={5} className={`mt-1 ${styles.price}`}>
            {`₹${test.price}`}
          </Col>

          <Col sm={10} md={8} lg={3} className={`border text-center pt-1 text-white  ${styles.addButton}`}>
            Add
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default TestDetailsCard;
