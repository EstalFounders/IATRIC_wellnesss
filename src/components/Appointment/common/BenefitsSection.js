import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { FaHospital, FaUserCheck, FaClock } from "react-icons/fa";
import { MdAccessAlarms } from "react-icons/md";

const benefits = [
  {
    icon: <FaHospital size={48} color="#3b5f1d" />,
    title: "Anywhere Anytime",
    description:
      "Connect with healthcare specialists from the comfort of your time schedule.",
  },
  {
    icon: <FaUserCheck size={48} color="#3b5f1d" />,
    title: "Verified Doctors",
    description:
      "All our doctors are verified and experienced for quality patient care.",
  },
  {
    icon: <FaClock size={48} color="#3b5f1d" />,
    title: "24/7 Availability",
    description: "Book appointments anytime, including nights and weekends.",
  },
  {
    icon: <MdAccessAlarms size={48} color="#3b5f1d" />,
    title: "Easy Acccesible",
    description: "To Book. Simply click BOOK NOW or call at 7895959925.",
  },
];

const BenefitSection = () => {
  return (
    <div className="">
      <Container className="py-5">
        <h2 className="text-center mb-4">Why Choose Us?</h2>
        <Row className="justify-content-center">
          {benefits.map((benefit, index) => (
            <Col key={index} xs={12} sm={6} md={3} className="mb-4">
              <Card
                className="h-100 shadow-sm rounded"
                style={{ borderRadius: "1rem" }}
              >
                <Card.Body className="text-center">
                  <div className="mb-3">{benefit.icon}</div>
                  <Card.Title>{benefit.title}</Card.Title>
                  <Card.Text className="text-secondary">
                    {benefit.description}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
};

export default BenefitSection;
