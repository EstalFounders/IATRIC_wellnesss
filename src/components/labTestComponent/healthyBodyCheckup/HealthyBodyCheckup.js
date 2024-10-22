import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import styles from "../css/HealthyBodyCheckup.module.css"; // Import the CSS module
import HealthCheckupCard from "../common/HealthCheckupCard";
import HealthyBodyCard from "../common/HealthyBodyCard";
import { HiArrowCircleRight } from "react-icons/hi";
import Demo2Reviews2 from "../../Demo-2/Demo2Reviews2";
import LabTestimonial from "../LabTestimonial/LabTestimonial";
import { MoreButton } from "../common/CommonMethod";

const healthCheckupData = [
  {
    id: 1,
    description: "Lorem ipsum dolor sit amet consectetur.",
    title: "Care of your teeth",
    image: "/images/labtest/healthyBodyCheckup/teeth.png",
  },
  {
    id: 2,
    description: "Lorem ipsum dolor sit amet consectetur.",
    title: "Care of your teeth",
    image: "/images/labtest/healthyBodyCheckup/teeth.png",
  },
  {
    id: 3,
    description: "Lorem ipsum dolor sit amet consectetur.",
    title: "Care of your teeth",
    image: "/images/labtest/healthyBodyCheckup/teeth.png",
  },
  {
    id: 4,
    description: "Lorem ipsum dolor sit amet consectetur.",
    title: "Care of your teeth",
    image: "/images/labtest/healthyBodyCheckup/teeth.png",
  },
  {
    id: 5,
    description: "Lorem ipsum dolor sit amet consectetur.",
    title: "Care of your teeth",
    image: "/images/labtest/healthyBodyCheckup/teeth.png",
  },
  {
    id: 6,
    description: "Lorem ipsum dolor sit amet consectetur.",
    title: "Care of your teeth",
    image: "/images/labtest/healthyBodyCheckup/teeth.png",
  },
];

const HealthyBodyCheckup = () => {
  return (
    <>
      <div className={`row align-items-center mb-5 p-2 ${styles.container}`}>
        <div className="col text-center" style={{ marginTop: "5%" }}>
          <div className={styles.healthyBodyCheckuptext}>
            Checkup for Healthy Body
          </div>
          <div className={styles.healthyBodyCheckupSubtext}>
            Lorem ipsum dolor sit amet consectetur. Mollis erat duis aliquam
            mauris est risus lectus. Phasellus consequat urna tellus
          </div>
        </div>
      </div>
      <div>
        <Container>
          <Row>
            {healthCheckupData.map((checkup, index) => (
              <Col
                key={index}
                xs={12}
                sm={6}
                md={4}
                lg={3}
                className="m-4 ml-5"
              >
                <HealthyBodyCard
                  title={checkup.title}
                  description={checkup.description}
                  image={checkup.image}
                />
              </Col>
            ))}
          </Row>
          <MoreButton />
        </Container>
        <LabTestimonial />
      </div>
    </>
  );
};

export default HealthyBodyCheckup;
