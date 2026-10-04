import { Container, InputGroup, FormControl, Row, Col } from "react-bootstrap";
import {
  FaFilePrescription,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaWhatsapp,
} from "react-icons/fa";
import { useRouter } from "next/router";
import FirstSection from "./firstSection/FirstSection";
import MostPopularCheckup from "./mostPopularCheckup/MostPopularCheckup";
import VitalOrganCheckup from "./vitalOrganCheckUp/VitalOrganCheckup";
import HealthyBodyCheckup from "./healthyBodyCheckup/HealthyBodyCheckup";
import Footer4 from "../../layout/Footer/Footer4";
import FaqSection from "../Common/FaqSection";
import { getFaqsForTopic } from "../../../data/faqs";
import { storeLabTestCategory } from "./common/CommonMethod";
import { useEffect, useState } from "react";
import { eventEmitter } from "../../constant";
import cartEventEmitter from "../../eventEmitter/CartEventEmitter";
import ViewDetails from "./viewDetails/ViewDetailsComp";
import ViewAllTestDetails from "./ViewAllTestDetails";
import MostBookedCheckups from "./mostBookedPackages/MostBookedCheckups";
import AnimatedSection from "../../../public/animation/animationSection/AnimatedSection";

export default function HomepageComp() {
  const router = useRouter();

  // FAQs for lab tests only - the group data/faqs.js defines for this topic.
  const labFaqs = getFaqsForTopic("lab-test");

  const handleLocationClick = () => {
    // Your location click handler logic
  };

  return (
    <>
      <div className="mt-2">
        <>
          <Row>
            <Col>
              <FirstSection />
            </Col>
          </Row>
          <AnimatedSection animation="fadeInUp" delay={0.1}>
            <Row className="mt-5" style={{ backgroundColor: "#EFEFEF" }}>
              <Col>
                <MostPopularCheckup />
              </Col>
            </Row>
          </AnimatedSection>
          <AnimatedSection animation="fadeInUp" delay={0.1}>
            <Row className="mt-5">
              <Col>
                <MostBookedCheckups />
              </Col>
            </Row>
          </AnimatedSection>
          <AnimatedSection animation="fadeInUp" delay={0.1}>
            <Row>
              <Col>
                <VitalOrganCheckup />
              </Col>
            </Row>
          </AnimatedSection>
          <AnimatedSection animation="fadeInUp" delay={0.1}>
            <Row>
              <Col>
                <HealthyBodyCheckup />
              </Col>
            </Row>
          </AnimatedSection>
          <AnimatedSection animation="fadeInUp" delay={0.1}>
            <Row>
              <Col>
                {/* Same lab-test answers as the matching block on /faqs, from
                    data/faqs.js - the old Orange Health Labs copy is gone. */}
                {labFaqs ? (
                  <FaqSection
                    items={labFaqs.items}
                    title="Frequently Asked Questions"
                    headingId="faq-lab-test"
                    seeAllHref={`/faqs#${labFaqs.anchor}`}
                  />
                ) : null}
              </Col>
            </Row>
          </AnimatedSection>
        </>
      </div>
    </>
  );
}
