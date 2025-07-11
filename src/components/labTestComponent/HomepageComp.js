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
import FAQ from "./faqs/FAQ";
import { storeLabTestCategory } from "./common/CommonMethod";
import { useEffect } from "react";

export default function HomepageComp() {
  const router = useRouter();

  const handleLocationClick = () => {
    // Your location click handler logic
  };



  return (
    <>
      <div className="mt-2">
        <Row>
          <Col>
            <FirstSection />
          </Col>
        </Row>
        <Row className="mt-5" style={{ backgroundColor: "#EFEFEF" }}>
          <Col>
            <MostPopularCheckup />
          </Col>
        </Row>
        <Row>
          <Col>
            <VitalOrganCheckup />
          </Col>
        </Row>
        <Row>
          <Col>
            <HealthyBodyCheckup />
          </Col>
        </Row>
        <Row>
          <Col>
          <FAQ />
          </Col>
        </Row>
      </div>
    </>
  );
}
