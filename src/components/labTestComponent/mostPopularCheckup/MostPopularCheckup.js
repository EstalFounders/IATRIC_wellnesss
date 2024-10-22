import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import styles from "../css/MostPopularCheckup.module.css"; // Import the CSS module
import HealthCheckupCard from "../common/HealthCheckupCard";
import { HiArrowCircleRight } from "react-icons/hi";
import { MoreButton } from "../common/CommonMethod";

const healthCheckupData = [
  {
    id: 1, // Use an id if possible for uniqueness
    discount: "-51%",
    price: 3939,
    mrp: 7990,
    title: "Full Body Checkup Essential",
    parameters: 98,
    reportsTime: "7 hours"
  },
  {
    id: 2,
    discount: "-40%",
    price: 2999,
    mrp: 5000,
    title: "Diabetes Checkup Standard",
    parameters: 50,
    reportsTime: "24 hours"
  },
  {
    id: 3, // Use an id if possible for uniqueness
    discount: "-51%",
    price: 3939,
    mrp: 7990,
    title: "Full Body Checkup Essential",
    parameters: 98,
    reportsTime: "7 hours"
  },
  {
    id: 4,
    discount: "-40%",
    price: 2999,
    mrp: 5000,
    title: "Diabetes Checkup Standard",
    parameters: 50,
    reportsTime: "24 hours"
  },
  {
    id: 5, // Use an id if possible for uniqueness
    discount: "-51%",
    price: 3939,
    mrp: 7990,
    title: "Full Body Checkup Essential",
    parameters: 98,
    reportsTime: "7 hours"
  },
  {
    id: 6,
    discount: "-40%",
    price: 2999,
    mrp: 5000,
    title: "Diabetes Checkup Standard",
    parameters: 50,
    reportsTime: "24 hours"
  },
  // ... other items
];

const MostPopularCheckup = () => {
  return (
    <>
      <div
        className={`row align-items-center mb-5 p-2 ${styles.container}`}>
          <div className="col text-center" style={{marginTop: '5%'}}>
        <div className={styles.mostpopulartext}>Most Popular checkups</div>
        <div className={styles.mostpopulartextsubtext}>Lorem ipsum dolor sit amet consectetur.</div>
        </div>
      </div>
      <div>
        <Container>
          <Row>
            {healthCheckupData.map((checkup) => (
              <Col key={checkup.id} xs={12} sm={6} md={4} lg={3} className="m-4 ml-5"> {/* Key should be here */}
                <HealthCheckupCard
                  discount={checkup.discount}
                  price={checkup.price}
                  mrp={checkup.mrp}
                  title={checkup.title}
                  parameters={checkup.parameters}
                  reportsTime={checkup.reportsTime}
                />
              </Col>
            ))}
          </Row>
          <MoreButton />
        </Container>
      </div>
    </>
  );
};

export default MostPopularCheckup;
