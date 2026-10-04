import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { FaHospital, FaUserCheck, FaClock } from "react-icons/fa";
import { MdAccessAlarms } from "react-icons/md";
import { useRouter } from "next/router";
import { useLanguage } from "../../../i18n/LanguageContext";
import { color_schema } from "../../../constant";

const benefits = [
  {
    icon: <FaHospital size={48} color={color_schema.green} />,
    titleKey: "demo5.benefits.anywhere",
    descKey: "demo5.benefits.anywhereDesc",
  },
  {
    icon: <FaUserCheck size={48} color={color_schema.green} />,
    titleKey: "demo5.benefits.verified",
    descKey: "demo5.benefits.verifiedDesc",
  },
  {
    icon: <FaClock size={48} color={color_schema.green} />,
    titleKey: "demo5.benefits.availability",
    descKey: "demo5.benefits.availabilityDesc",
  },
  {
    icon: <MdAccessAlarms size={48} color={color_schema.green} />,
    titleKey: "demo5.benefits.accessible",
    descKey: "demo5.benefits.accessibleDesc",
  },
];

const BenefitSection = () => {
  const router = useRouter();
  const { t } = useLanguage();

  const handleBenefitClick = () => {
    router.push("/appointment");
  };

  return (
    <div className="">
      <Container className="py-5">
        <h2 className="text-center mb-4">{t("demo5.benefits.heading")}</h2>
        <Row className="justify-content-center">
          {benefits.map((benefit, index) => (
            <Col key={index} xs={12} sm={6} md={3} className="mb-4">
              <Card
                className="h-100 shadow-sm rounded clickable-div"
                style={{ borderRadius: "1rem", cursor: "pointer" }}
                onClick={handleBenefitClick}
              >
                <Card.Body className="text-center">
                  <div className="mb-3">{benefit.icon}</div>
                  <Card.Title>{t(benefit.titleKey)}</Card.Title>
                  <Card.Text className="text-secondary">
                    {t(benefit.descKey)}
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
